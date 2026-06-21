-- Migration 008: Security Fixes
-- Fixes: C4 (increment_uploads auth check), H5 (role column protection)

-- ============================================================
-- FIX C4: Secure increment_uploads RPC
-- Prevents any user from incrementing another user's counter.
-- Only allows: self-increment OR service-role calls.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_uploads(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Allow service role (no auth.uid) or self-increment only
  IF auth.uid() IS NOT NULL AND user_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user''s upload counter';
  END IF;

  UPDATE public.profiles
  SET uploads_used = uploads_used + 1
  WHERE id = user_id_param;
END;
$$;

-- ============================================================
-- FIX H5: Prevent users from updating sensitive columns
-- Users should NOT be able to change: role, status, approved_at,
-- approved_by, monthly_upload_limit, uploads_used, uploads_reset_at,
-- manual_load_limit, manual_loads_used, file_upload_limit, file_uploads_used
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only service role or admin can modify protected columns
  IF NOT public.is_admin() THEN
    -- Revert protected columns to their old values
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.approved_at := OLD.approved_at;
    NEW.approved_by := OLD.approved_by;
    NEW.monthly_upload_limit := OLD.monthly_upload_limit;
    NEW.uploads_used := OLD.uploads_used;
    NEW.uploads_reset_at := OLD.uploads_reset_at;
    -- Also protect the split limit columns if they exist
    IF TG_TABLE_NAME = 'profiles' THEN
      BEGIN
        NEW.manual_load_limit := OLD.manual_load_limit;
        NEW.manual_loads_used := OLD.manual_loads_used;
        NEW.file_upload_limit := OLD.file_upload_limit;
        NEW.file_uploads_used := OLD.file_uploads_used;
      EXCEPTION WHEN undefined_column THEN
        -- Columns don't exist yet, skip
        NULL;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ============================================================
-- FIX H6: Atomic invoice save function
-- Wraps invoice + loads insert in a transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_invoice_atomic(
  p_user_id uuid,
  p_invoice_number text,
  p_invoice_date text,
  p_due_date text,
  p_template text,
  p_total_gross numeric,
  p_dispatch_fee numeric,
  p_dispatch_percentage numeric,
  p_status text,
  p_carrier_name text,
  p_carrier_snapshot jsonb,
  p_company_snapshot jsonb,
  p_loads jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_load jsonb;
BEGIN
  -- Verify caller owns this data
  IF auth.uid() IS NOT NULL AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert invoice
  INSERT INTO public.invoices (
    user_id, invoice_number, invoice_date, due_date, template,
    total_gross_revenue, dispatch_fee, dispatch_percentage, status,
    carrier_name, carrier_snapshot, company_snapshot
  ) VALUES (
    p_user_id, p_invoice_number, p_invoice_date, p_due_date, p_template,
    p_total_gross, p_dispatch_fee, p_dispatch_percentage, p_status,
    p_carrier_name, p_carrier_snapshot, p_company_snapshot
  ) RETURNING id INTO v_invoice_id;

  -- Insert loads
  FOR v_load IN SELECT * FROM jsonb_array_elements(p_loads)
  LOOP
    INSERT INTO public.invoice_loads (
      invoice_id, load_number, broker_name, pickup_date,
      gross_amount, origin_city, origin_state,
      destination_city, destination_state
    ) VALUES (
      v_invoice_id,
      v_load->>'load_number',
      v_load->>'broker_name',
      v_load->>'pickup_date',
      (v_load->>'gross_amount')::numeric,
      v_load->>'origin_city',
      v_load->>'origin_state',
      v_load->>'destination_city',
      v_load->>'destination_state'
    );
  END LOOP;

  RETURN v_invoice_id;
END;
$$;
