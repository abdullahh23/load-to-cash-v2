import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { extractFromFile, validateFile } from './ai/extraction.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8787;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LoadToCash <notifications@loadtocash.online>';
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'nickindispatch@gmail.com';


// Security: Never allow credentials with wildcard origin
app.use(cors({
  origin: CLIENT_ORIGIN === '*' ? ['http://localhost:5173', 'http://localhost:3000'] : CLIENT_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.set('trust proxy', 1); // Trust first proxy (Railway/Vercel)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG, or WEBP files are allowed'));
  },
});

// Extend Express Request to carry user info
interface AuthenticatedRequest extends express.Request {
  userId?: string;
  userProfile?: {
    id: string;
    role?: string;
    status: string;
    monthly_upload_limit: number;
    uploads_used: number;
    uploads_reset_at: string;
  };
}

/**
 * Auth middleware — validates Bearer token, attaches userId + profile to request.
 */
async function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ success: false, error: 'Authentication service not configured' });
    return;
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: header } } });
  const { data: { user }, error } = await supabase.auth.getUser(header.slice(7));
  if (error || !user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  // Fetch profile with approval/quota fields (gracefully handle if migration not run)
  let profile: AuthenticatedRequest['userProfile'] | undefined;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, status, monthly_upload_limit, uploads_used, uploads_reset_at')
      .eq('id', user.id)
      .single();
    profile = data ?? undefined;
  } catch {
    // If new columns don't exist yet, fetch basic profile
    const { data } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
    profile = data ? { ...data, status: 'approved', monthly_upload_limit: 0, uploads_used: 0, uploads_reset_at: new Date().toISOString() } : undefined;
  }

  req.userId = user.id;
  req.userProfile = profile ?? undefined;
  next();
}

/**
 * Approval + Quota middleware — checks user status and upload limits.
 * Must run AFTER requireAuth.
 */
async function requireApproval(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const profile = req.userProfile;

  // If no profile found (Supabase not configured), allow through
  if (!profile) {
    res.status(403).json({ success: false, error: 'User profile not found' });
    return;
  }

  // Admins always bypass approval/quota
  if (profile.role === 'admin') return next();

  // If status column doesn't exist yet (migration not run), treat as approved
  if (!profile.status) return next();

  // Check approval status
  if (profile.status === 'pending') {
    res.status(403).json({ success: false, error: 'Account pending approval. Please wait for admin to approve your account.' });
    return;
  }
  if (profile.status === 'suspended') {
    res.status(403).json({ success: false, error: 'Account suspended. Contact admin for assistance.' });
    return;
  }

  // Auto-reset monthly uploads if needed
  const resetAt = new Date(profile.uploads_reset_at);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  if (resetAt < monthStart && SUPABASE_URL && SUPABASE_ANON_KEY) {
    const serviceKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    const supabase = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await supabase
      .from('profiles')
      .update({ uploads_used: 0, uploads_reset_at: monthStart.toISOString() })
      .eq('id', profile.id);
    profile.uploads_used = 0;
  }

  // Check quota (0 = unlimited)
  if (profile.monthly_upload_limit > 0 && profile.uploads_used >= profile.monthly_upload_limit) {
    res.status(403).json({
      success: false,
      error: `Monthly upload limit reached (${profile.uploads_used}/${profile.monthly_upload_limit}). Contact admin to increase your limit.`
    });
    return;
  }

  next();
}

// Rate limiter
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitInfo>();
const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 60;

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();

  let info = rateLimits.get(ip);
  if (!info || now > info.resetTime) {
    info = {
      count: 0,
      resetTime: now + LIMIT_WINDOW_MS,
    };
  }

  if (info.count >= MAX_REQUESTS) {
    res.status(429).json({ success: false, error: 'Too many extraction requests. Please wait and try again later.' });
    return;
  }

  info.count++;
  rateLimits.set(ip, info);
  next();
}

// Health check endpoint (Railway)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/notify-signup
 * Sends admin email notification when a new user signs up.
 * Called from the client after successful registration.
 */
app.post('/api/notify-signup', express.json(), async (req, res) => {
  if (!RESEND_API_KEY) {
    res.json({ success: false, error: 'Resend not configured' });
    return;
  }

  const { name, email, phone } = req.body || {};
  if (!email) {
    res.status(400).json({ success: false, error: 'Email required' });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [ADMIN_NOTIFICATION_EMAIL],
        subject: `🆕 New User Signup — ${name || email}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0f172a; font-size: 22px; margin: 0;">🚛 New User Registered</h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">LoadToCash Dispatch System</p>
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Name</td>
                  <td style="padding: 8px 0; color: #0f172a; text-align: right;">${name || '—'}</td>
                </tr>
                <tr style="border-top: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email</td>
                  <td style="padding: 8px 0; color: #0f172a; text-align: right;">${email}</td>
                </tr>
                <tr style="border-top: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone</td>
                  <td style="padding: 8px 0; color: #0f172a; text-align: right;">${phone || '—'}</td>
                </tr>
                <tr style="border-top: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Time</td>
                  <td style="padding: 8px 0; color: #0f172a; text-align: right;">${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' })}</td>
                </tr>
              </table>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">
              Go to <a href="https://loadtocash.com/admin" style="color: #14b8a6;">Admin Panel</a> to approve or manage this user.
            </p>
          </div>
        `,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`[Notify] Signup email sent for ${email}`);
      res.json({ success: true });
    } else {
      console.error('[Notify] Resend error:', result);
      res.json({ success: false, error: result?.message || 'Email send failed' });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Notification failed';
    console.error('[Notify] Error:', msg);
    res.json({ success: false, error: msg });
  }
});

/**
 * DELETE /api/admin/delete-user/:userId
 * Permanently deletes a user from Supabase Auth + their profile/data.
 * Requires admin JWT + SUPABASE_SERVICE_ROLE_KEY on server.
 */
app.delete('/api/admin/delete-user/:userId',
  requireAuth as express.RequestHandler,
  async (req: AuthenticatedRequest, res) => {
    // Only admins can delete users
    if (req.userProfile?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      res.status(500).json({ success: false, error: 'Service role key not configured on server.' });
      return;
    }

    const userId = String(req.params.userId);

    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      res.status(400).json({ success: false, error: 'You cannot delete your own admin account.' });
      return;
    }

    try {
      // Use service role client (bypasses RLS)
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Delete user from Supabase Auth (cascades to profile via DB trigger if set up)
      const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
      if (authError) {
        res.status(500).json({ success: false, error: authError.message });
        return;
      }

      // Also manually delete profile row (safety net)
      await adminClient.from('profiles').delete().eq('id', userId);

      console.log(`[Admin] User ${userId} permanently deleted by admin ${req.userId}`);
      res.json({ success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      res.status(500).json({ success: false, error: msg });
    }
  }
);


// User quota endpoint
app.get('/api/user/quota', requireAuth as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const profile = req.userProfile;
  if (!profile) {
    res.json({ status: 'approved', uploads_used: 0, monthly_upload_limit: 0 });
    return;
  }
  res.json({
    status: profile.status,
    uploads_used: profile.uploads_used,
    monthly_upload_limit: profile.monthly_upload_limit,
  });
});

// Main extraction endpoint
app.post('/api/extract',
  requireAuth as express.RequestHandler,
  requireApproval as express.RequestHandler,
  rateLimiter,
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    // File validation
    const fileError = validateFile(req.file.mimetype, req.file.size);
    if (fileError) {
      res.status(400).json({ success: false, error: fileError });
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, error: 'OpenRouter API key not configured on server' });
      return;
    }

    const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

    const mock = process.env.AI_MOCK === 'true';
    if (mock) {
      res.json({
        success: true,
        data: {
          loadNumber: 'MOCK-001',
          brokerName: 'Mock Broker LLC',
          pickupDate: '2025-01-15',
          grossAmount: 2500,
          originCity: 'Chicago',
          originState: 'IL',
          destinationCity: 'Dallas',
          destinationState: 'TX',
        },
      });
      return;
    }

    console.log(`[Extract] Processing ${req.file.originalname} (${req.file.mimetype}, ${(req.file.size / 1024).toFixed(1)}KB)`);
    const result = await extractFromFile(req.file.buffer, req.file.mimetype, apiKey, model);

    // Increment upload count on successful extraction
    if (result.success && req.userId && SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const serviceKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const supabase = createClient(SUPABASE_URL, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { error: rpcError } = await supabase.rpc('increment_uploads', { user_id_param: req.userId });
        if (rpcError) {
          // Fallback: direct update
          await supabase
            .from('profiles')
            .update({ uploads_used: (req.userProfile?.uploads_used ?? 0) + 1 })
            .eq('id', req.userId!);
        }
      } catch {
        // Non-critical: don't fail the extraction response
      }
    }

    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    console.error('[Extract] Error:', message);
    res.status(500).json({ success: false, error: message });
  }
});

// Serve built frontend in production
// In production: dist-server/server/index.js -> ../../dist
// In dev with tsx: server/index.ts -> ../dist (not used)
const distPath = path.resolve(__dirname, '..', 'dist');
const distPath2 = path.resolve(__dirname, '..', '..', 'dist');
const finalDistPath = fs.existsSync(distPath) ? distPath : distPath2;

// Serve public folder (sitemap.xml, robots.txt, favicon.svg)
const publicPath = path.resolve(__dirname, '..', 'public');
const publicPath2 = path.resolve(__dirname, '..', '..', 'public');
const finalPublicPath = fs.existsSync(publicPath) ? publicPath : publicPath2;
if (fs.existsSync(finalPublicPath)) {
  app.use(express.static(finalPublicPath));
}

app.use(express.static(finalDistPath));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(finalDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
