import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppLoads, useAppSettings } from '../contexts/DataContext';
import { InvoicePage } from './InvoicePage';
import { generateInvoiceNumber, getCurrentWeekLabel } from '../lib/calc';
import { saveInvoice } from '../lib/invoices';
import { printInvoice } from '../lib/pdf';

export function InvoiceRoute() {
  const { user } = useAuth();
  const { loads } = useAppLoads();
  const { company, carrier } = useAppSettings();

  const invoiceNumber = useMemo(() => generateInvoiceNumber(), []);
  const invoiceDate = useMemo(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);
  const weekLabel = useMemo(() => getCurrentWeekLabel(), []);

  const handlePrint = async () => {
    if (user) {
      try {
        await saveInvoice(user.id, loads, company, carrier, invoiceNumber, invoiceDate, weekLabel);
      } catch (e) {
        console.error('Failed to save invoice:', e);
      }
    }
    printInvoice();
  };

  return (
    <InvoicePage
      loads={loads}
      company={company}
      carrier={carrier}
      invoiceNumber={invoiceNumber}
      invoiceDate={invoiceDate}
      weekLabel={weekLabel}
      onPrint={handlePrint}
    />
  );
}
