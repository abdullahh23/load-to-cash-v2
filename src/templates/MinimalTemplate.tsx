import type { Load, CompanySettings, CarrierSettings } from '../types';
import { calcTotals, formatCurrency, formatDate } from '../lib/calc';

interface TemplateProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
  weekLabel: string;
}

export function MinimalTemplate({
  loads,
  company,
  carrier,
  invoiceNumber,
  invoiceDate,
  weekLabel,
}: TemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const weLabel = weekLabel.replace('Week of ', 'W/E ').split('–')[1]?.trim() ?? weekLabel;

  const paymentMethod = company.zelle
    ? `Zelle: ${company.zelle}`
    : company.payoneer
    ? `Payoneer: ${company.payoneer}`
    : company.bankInformation
    ? `Bank Transfer: ${company.bankInformation}`
    : company.paymentInstructions || '';

  return (
    <div
      id="invoice-root"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '12px',
        color: '#1a1a1a',
        background: '#ffffff',
        width: '820px',
        margin: '0 auto',
        padding: '50px 60px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {company.companyLogo && (
            <img src={company.companyLogo} alt="Logo" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
          )}
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
              {company.companyName || 'Dispatch Services'}
            </div>
            {company.companyHeaderText && (
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                {company.companyHeaderText}
              </div>
            )}
            <div style={{ color: '#666', marginTop: '2px' }}>Dispatch Fee Invoice</div>
          </div>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', textAlign: 'right' }}>
          <div>INV: {invoiceNumber}</div>
          <div style={{ color: '#666', marginTop: '2px' }}>Date: {formatDate(invoiceDate)}</div>
        </div>
      </div>

      <div style={{ height: '1px', background: '#e5e5e5', marginBottom: '30px' }} />

      {/* Bill Section */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', color: '#999', letterSpacing: '0.5px', marginBottom: '8px' }}>Billing From</div>
          <div style={{ fontWeight: '600', color: '#111' }}>{company.companyName}</div>
          {company.companyAddress && <div style={{ color: '#555' }}>{company.companyAddress}</div>}
          {company.companyPhone && <div style={{ color: '#555' }}>{company.companyPhone}</div>}
          {company.companyEmail && <div style={{ color: '#555' }}>{company.companyEmail}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', color: '#999', letterSpacing: '0.5px', marginBottom: '8px' }}>Bill To</div>
          <div style={{ fontWeight: '600', color: '#111' }}>{carrier.carrierName}</div>
          {carrier.carrierAddress && <div style={{ color: '#555' }}>{carrier.carrierAddress}</div>}
          {carrier.carrierPhone && <div style={{ color: '#555' }}>{carrier.carrierPhone}</div>}
          {carrier.mcNumber && <div style={{ color: '#555' }}>MC: {carrier.mcNumber}</div>}
        </div>
      </div>

      <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
        Loads — {weLabel}
      </div>

      {/* Loads Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #111', fontSize: '11px', color: '#666', textAlign: 'left' }}>
            <th style={{ padding: '8px 4px', fontWeight: '500' }}>#</th>
            <th style={{ padding: '8px 4px', fontWeight: '500' }}>Load #</th>
            <th style={{ padding: '8px 4px', fontWeight: '500' }}>Broker</th>
            <th style={{ padding: '8px 4px', fontWeight: '500' }}>Route</th>
            <th style={{ padding: '8px 4px', fontWeight: '500', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {loads.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '20px 4px', textAlign: 'center', color: '#999' }}>
                No loads listed
              </td>
            </tr>
          ) : (
            loads.map((load, index) => {
              const route = load.originCity && load.destinationCity
                ? `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`
                : '—';
              return (
                <tr key={load.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 4px', color: '#888' }}>{index + 1}</td>
                  <td style={{ padding: '10px 4px', fontWeight: '600' }}>{load.loadNumber}</td>
                  <td style={{ padding: '10px 4px' }}>{load.brokerName}</td>
                  <td style={{ padding: '10px 4px', color: '#444' }}>{route}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: '600', fontFamily: 'monospace' }}>
                    {formatCurrency(load.grossAmount)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ width: '300px', marginLeft: 'auto', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ color: '#666' }}>Gross Total</span>
          <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{formatCurrency(totalGrossRevenue)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ color: '#666' }}>Dispatch Rate ({company.dispatchPercentage}%)</span>
          <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{company.dispatchPercentage}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px solid #111', fontWeight: '700', fontSize: '13px' }}>
          <span>Total Fee Due</span>
          <span style={{ fontFamily: 'monospace' }}>{formatCurrency(dispatchFee)}</span>
        </div>
      </div>

      {/* Payment Details */}
      {(company.zelle || company.payoneer || company.bankInformation || company.paymentInstructions) && (
        <div style={{ padding: '16px', border: '1px solid #eee', background: '#fafafa', borderRadius: '4px' }}>
          <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', color: '#999', marginBottom: '8px' }}>Payment Options</div>
          <div style={{ color: '#333', lineHeight: '1.5' }}>{paymentMethod}</div>
        </div>
      )}
    </div>
  );
}
