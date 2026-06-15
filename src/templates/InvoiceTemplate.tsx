import type { Load, CompanySettings, CarrierSettings } from '../types';
import { calcTotals, formatCurrency, formatDate } from '../lib/calc';
import { MinimalTemplate } from './MinimalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { TechTemplate } from './TechTemplate';

interface InvoiceTemplateProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
  weekLabel: string;
}

// Colors from the original Classic template
const NAVY = '#1e2d4a';
const NAVY_LIGHT = '#f0f3f8';
const GOLD = '#c9a84c';
const GRAY_LABEL = '#6b7a8d';
const BORDER = '#d8dde6';
const TEXT = '#1e2d4a';

function ClassicTemplate({
  loads,
  company,
  carrier,
  invoiceNumber,
  invoiceDate,
  weekLabel,
}: InvoiceTemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const weLabel = weekLabel.replace('Week of ', 'W/E ').split('–')[1]?.trim() ?? weekLabel;

  const paymentMethod = company.zelle
    ? `Payment via Zelle: ${company.zelle}`
    : company.payoneer
    ? `Payment via Payoneer: ${company.payoneer}`
    : company.bankInformation
    ? `Bank Transfer: ${company.bankInformation}`
    : company.paymentInstructions || '';

  return (
    <div
      id="invoice-root"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        fontSize: '13px',
        color: TEXT,
        background: '#ffffff',
        width: '820px',
        margin: '0 auto',
        padding: '48px 52px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {company.companyLogo && (
            <img src={company.companyLogo} alt="Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
          )}
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: NAVY, letterSpacing: '0.5px', lineHeight: 1.1 }}>
              DISPATCH FEE INVOICE
            </div>
            <div style={{ fontSize: '11px', color: GRAY_LABEL, fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {company.companyHeaderText || company.companyName || ''}
            </div>
          </div>
        </div>

        {/* Invoice meta */}
        <table style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            <tr>
              <td style={{ color: GRAY_LABEL, paddingRight: '20px', paddingBottom: '4px', whiteSpace: 'nowrap' }}>Invoice #</td>
              <td style={{ fontWeight: '700', color: NAVY, paddingBottom: '4px', textAlign: 'right' }}>{invoiceNumber}</td>
            </tr>
            <tr>
              <td style={{ color: GRAY_LABEL, paddingRight: '20px', paddingBottom: '4px' }}>Invoice Date</td>
              <td style={{ fontWeight: '700', color: NAVY, paddingBottom: '4px', textAlign: 'right' }}>{formatDate(invoiceDate)}</td>
            </tr>
            <tr>
              <td style={{ color: GRAY_LABEL, paddingRight: '20px' }}>Due Date</td>
              <td style={{ fontWeight: '700', color: NAVY, textAlign: 'right' }}>{formatDate(invoiceDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── GOLD DIVIDER ── */}
      <div style={{ height: '3px', background: GOLD, margin: '16px 0 24px 0' }} />

      {/* ── FROM / BILL TO BOXES ── */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        {/* FROM */}
        <div style={{
          flex: 1,
          border: `1px solid ${BORDER}`,
          borderRadius: '4px',
          padding: '16px 18px',
          lineHeight: '1.65',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: GRAY_LABEL, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>FROM</div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: NAVY, marginBottom: '2px' }}>{company.companyName || 'Your Company'}</div>
          {company.companyAddress && <div style={{ color: '#3d4f63' }}>Dispatch Services</div>}
          {company.companyAddress && <div style={{ color: '#3d4f63' }}>{company.companyAddress}</div>}
          {company.companyPhone && <div style={{ color: '#3d4f63' }}>Phone: {company.companyPhone}</div>}
          {company.companyEmail && <div style={{ color: '#3d4f63' }}>Email: {company.companyEmail}</div>}
        </div>

        {/* BILL TO */}
        <div style={{
          flex: 1,
          border: `1px solid ${BORDER}`,
          borderRadius: '4px',
          padding: '16px 18px',
          lineHeight: '1.65',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: GRAY_LABEL, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>BILL TO</div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: NAVY, marginBottom: '2px' }}>{carrier.carrierName || '—'}</div>
          {carrier.carrierAddress && <div style={{ color: '#3d4f63' }}>{carrier.carrierAddress}</div>}
          {carrier.carrierPhone && <div style={{ color: '#3d4f63' }}>Phone: {carrier.carrierPhone}</div>}
          {carrier.mcNumber && <div style={{ color: '#3d4f63' }}>MC: {carrier.mcNumber}</div>}
        </div>
      </div>

      {/* ── WEEKLY LOAD SUMMARY LABEL ── */}
      <div style={{
        fontSize: '11px',
        fontWeight: '700',
        color: NAVY,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '10px',
      }}>
        WEEKLY LOAD SUMMARY — {weLabel}
      </div>

      {/* ── LOADS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: NAVY, color: '#ffffff' }}>
            <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '32px' }}>#</th>
            <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: '600', fontSize: '12px' }}>Load #</th>
            <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: '600', fontSize: '12px' }}>Broker</th>
            <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: '600', fontSize: '12px' }}>Route</th>
            <th style={{ padding: '11px 14px', textAlign: 'right', fontWeight: '600', fontSize: '12px' }}>Gross Amount</th>
          </tr>
        </thead>
        <tbody>
          {loads.length === 0 ? (
            <tr style={{ background: '#ffffff' }}>
              <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: GRAY_LABEL, fontStyle: 'italic', border: `1px solid ${BORDER}`, borderTop: 'none' }}>
                No loads added yet
              </td>
            </tr>
          ) : (
            loads.map((load, i) => {
              const route = load.originCity && load.destinationCity
                ? `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`
                : '—';
              return (
                <tr key={load.id} style={{ background: i % 2 === 0 ? '#ffffff' : NAVY_LIGHT }}>
                  <td style={{ padding: '10px 14px', color: GRAY_LABEL, borderBottom: `1px solid ${BORDER}` }}>{i + 1}</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600', color: NAVY, borderBottom: `1px solid ${BORDER}` }}>{load.loadNumber || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#3d4f63', borderBottom: `1px solid ${BORDER}` }}>{load.brokerName || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#3d4f63', borderBottom: `1px solid ${BORDER}` }}>{route}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: NAVY, borderBottom: `1px solid ${BORDER}` }}>{formatCurrency(load.grossAmount)}</td>
                </tr>
              );
            })
          )}

          {/* TOTAL WEEKLY GROSS row */}
          {loads.length > 0 && (
            <tr style={{ background: NAVY_LIGHT }}>
              <td colSpan={3} style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}` }} />
              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: NAVY, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.3px', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                TOTAL WEEKLY GROSS
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: NAVY, fontSize: '14px', borderBottom: `1px solid ${BORDER}` }}>
                {formatCurrency(totalGrossRevenue)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── INVOICE SUMMARY ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: NAVY, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
          INVOICE SUMMARY
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: '#3d4f63' }}>Total Weekly Gross ({loads.length} {loads.length === 1 ? 'Load' : 'Loads'})</span>
          <span style={{ fontWeight: '600', color: NAVY }}>{formatCurrency(totalGrossRevenue)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: '#3d4f63' }}>Dispatch Fee @ {company.dispatchPercentage}%</span>
          <span style={{ fontWeight: '600', color: NAVY }}>{formatCurrency(dispatchFee)}</span>
        </div>

        {/* TOTAL DUE bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: NAVY,
          padding: '14px 18px',
          marginTop: '2px',
          borderRadius: '2px',
        }}>
          <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL DUE</span>
          <span style={{ color: GOLD, fontWeight: '800', fontSize: '16px' }}>{formatCurrency(dispatchFee)}</span>
        </div>
      </div>

      {/* ── PAYMENT BOX ── */}
      {(company.zelle || company.payoneer || company.bankInformation || company.paymentInstructions) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: `1px solid ${BORDER}`,
          borderRadius: '4px',
          padding: '16px 20px',
          marginTop: '16px',
          background: '#fafbfc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3d4f63', fontSize: '13px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: NAVY, borderRadius: '1px', flexShrink: 0 }} />
            <span>
              {paymentMethod.includes(':') ? (
                <>
                  {paymentMethod.split(':')[0]}:{' '}
                  <strong style={{ color: NAVY }}>{paymentMethod.split(':').slice(1).join(':').trim()}</strong>
                </>
              ) : (
                <strong style={{ color: NAVY }}>{paymentMethod}</strong>
              )}
            </span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '22px', color: NAVY }}>
            {formatCurrency(dispatchFee)}
          </div>
        </div>
      )}
    </div>
  );
}

export function InvoiceTemplate(props: InvoiceTemplateProps) {
  const templateId = props.company.templateId || 'classic';

  switch (templateId) {
    case 'modern':
      return <MinimalTemplate {...props} />;
    case 'cargo':
      return <ExecutiveTemplate {...props} />;
    case 'teal':
      return <TechTemplate {...props} />;
    case 'classic':
    default:
      return <ClassicTemplate {...props} />;
  }
}
