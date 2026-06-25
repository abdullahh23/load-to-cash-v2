import type { Load, CompanySettings, CarrierSettings } from '../types';
import { calcTotals, formatCurrency, formatDate } from '../lib/calc';

interface TemplateProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  weekLabel: string;
  pendingAmount?: number;
}

export function TechTemplate({
  loads,
  company,
  carrier,
  invoiceNumber,
  invoiceDate,
  dueDate,
  weekLabel,
  pendingAmount = 0,
}: TemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const totalDue = dispatchFee + pendingAmount;
  const weLabel = weekLabel.replace('Week of ', 'W/E ').split('–')[1]?.trim() ?? weekLabel;

  const paymentMethod = company.cashApp
    ? `Cash App: ${company.cashApp}`
    : company.zelle
    ? `Zelle Account: ${company.zelle}`
    : company.payoneer
    ? `Payoneer: ${company.payoneer}`
    : company.bankInformation
    ? `Direct Deposit: ${company.bankInformation}`
    : company.paymentInstructions || '';

  return (
    <div
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '12px',
        color: '#334155',
        background: '#ffffff',
        width: '100%',
        margin: '0 auto',
        padding: '40px 50px',
        boxSizing: 'border-box',
      }}
    >
      {/* Upper Logo & Summary Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '6px 12px', borderRadius: '8px', marginBottom: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d9488' }} />
            <span style={{ color: '#0f766e', fontWeight: '700', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px' }}>SYSTEM BILLING</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {company.companyLogo && (
              <img src={company.companyLogo} alt="Logo" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                {company.companyHeaderText || company.companyName || 'Dispatch Co.'}
              </div>
              <div style={{ color: '#64748b', marginTop: '2px', fontSize: '11px' }}>Dispatch Fee Invoice</div>
            </div>
          </div>
        </div>

        {/* Invoice Info Box */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', minWidth: '180px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#64748b', paddingBottom: '6px' }}>Invoice</td>
                <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a', paddingBottom: '6px', whiteSpace: 'nowrap' }}>{invoiceNumber}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748b', paddingBottom: '6px' }}>Issued</td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#0f172a', paddingBottom: '6px' }}>{formatDate(invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748b', paddingBottom: '6px' }}>Due</td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#0f172a', paddingBottom: '6px' }}>{formatDate(dueDate || invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748b' }}>Period</td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>{weLabel}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: From/To Address */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '35px' }}>
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#0d9488', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>ISSUED BY</div>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>{company.companyName}</div>
          {company.companyAddress && <div style={{ color: '#475569', lineHeight: '1.4' }}>{company.companyAddress}</div>}
          {company.companyPhone && <div style={{ color: '#475569', marginTop: '4px' }}>Phone: {company.companyPhone}</div>}
          {company.companyEmail && <div style={{ color: '#475569' }}>Email: {company.companyEmail}</div>}
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#0d9488', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>BILL TO CARRIER</div>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>{carrier.carrierName}</div>
          {carrier.carrierAddress && <div style={{ color: '#475569', lineHeight: '1.4' }}>{carrier.carrierAddress}</div>}
          {carrier.carrierPhone && <div style={{ color: '#475569', marginTop: '4px' }}>Phone: {carrier.carrierPhone}</div>}
          {carrier.mcNumber && <div style={{ color: '#475569' }}>MC: {carrier.mcNumber}</div>}
        </div>
      </div>

      {/* Table Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>LOGISTICS LOAD DETAILS</span>
        <span style={{ color: '#64748b', fontSize: '11px' }}>{loads.length} Completed Load(s)</span>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontSize: '11px' }}>
            <th style={{ padding: '8px 10px', fontWeight: '600' }}>#</th>
            <th style={{ padding: '8px 10px', fontWeight: '600' }}>Load #</th>
            <th style={{ padding: '8px 10px', fontWeight: '600' }}>Broker</th>
            <th style={{ padding: '8px 10px', fontWeight: '600' }}>Route</th>
            <th style={{ padding: '8px 10px', fontWeight: '600', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {loads.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                No active loads listed.
              </td>
            </tr>
          ) : (
            loads.map((load, index) => {
              const route = load.originCity && load.destinationCity
                ? `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`
                : '—';
              return (
                <tr key={load.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', color: '#94a3b8' }}>{index + 1}</td>
                  <td style={{ padding: '10px', fontWeight: '700', color: '#0f172a' }}>{load.loadNumber}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>{load.brokerName}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>{route}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                    {formatCurrency(load.grossAmount)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Billing Summary Panels */}
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        {/* Left Side: Tech styled payment methods */}
        <div style={{ flex: 1, padding: '16px', background: 'rgba(241, 245, 249, 0.5)', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
          <div style={{ fontWeight: '700', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Statement Remittance</div>
          <div style={{ color: '#475569', lineHeight: '1.5', fontSize: '11px' }}>{paymentMethod}</div>
          {company.accountHolderName && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#475569' }}>
              <span style={{ fontWeight: 700 }}>Account Holder: </span>{company.accountHolderName}
            </div>
          )}
        </div>

        {/* Right Side: Total summary Card */}
        <div style={{ minWidth: '260px', background: '#0f172a', color: '#ffffff', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #334155', fontSize: '11px', color: '#94a3b8' }}>
            <span>Weekly gross volume</span>
            <span>{formatCurrency(totalGrossRevenue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px', borderBottom: '1px solid #334155', fontSize: '11px', color: '#94a3b8' }}>
            <span>Dispatch rate</span>
            <span>{company.dispatchPercentage}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: pendingAmount > 0 ? '10px' : '0', borderBottom: pendingAmount > 0 ? '1px solid #334155' : 'none', fontSize: '11px', color: '#94a3b8' }}>
            <span>Dispatch fee</span>
            <span>{formatCurrency(dispatchFee)}</span>
          </div>
          {pendingAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px', fontSize: '11px', color: '#fbbf24', borderBottom: '1px solid #334155' }}>
              <span>⚠ Previous Pending Balance</span>
              <span style={{ fontWeight: '700' }}>{formatCurrency(pendingAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '10px', borderTop: pendingAmount > 0 ? 'none' : '2px solid #0d9488' }}>
            <span style={{ fontWeight: '700', fontSize: '12px', color: '#0d9488', textTransform: 'uppercase' }}>Amount Due</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{formatCurrency(totalDue)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
