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

export function ExecutiveTemplate({
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
    ? `Zelle Account: ${company.zelle}`
    : company.payoneer
    ? `Payoneer Account: ${company.payoneer}`
    : company.bankInformation
    ? `Bank Info: ${company.bankInformation}`
    : company.paymentInstructions || '';

  return (
    <div
      id="invoice-root"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        fontFamily: "'Segoe UI', Roboto, Helvetica, sans-serif",
        fontSize: '13px',
        color: '#2d3748',
        background: '#ffffff',
        width: '820px',
        margin: '0 auto',
        padding: '0 0 40px 0',
        boxSizing: 'border-box',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Dark Bold Header Block */}
      <div style={{ background: '#1a202c', color: '#ffffff', padding: '40px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {company.companyLogo && (
            <img src={company.companyLogo} alt="Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
          )}
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#ecc94b' }}>
              {company.companyName || 'DISPATCH LOGISTICS'}
            </div>
            {company.companyHeaderText && (
              <div style={{ fontSize: '10px', color: '#a0aec0', fontWeight: 500, marginTop: '2px' }}>
                {company.companyHeaderText}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#a0aec0' }}>INVOICE NUMBER</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', fontFamily: 'monospace' }}>{invoiceNumber}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '40px 50px' }}>
        
        {/* Dates Info Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: '#f7fafc', borderLeft: '4px solid #ecc94b', marginBottom: '30px' }}>
          <div><strong>Invoice Date:</strong> {formatDate(invoiceDate)}</div>
          <div><strong>Due Date:</strong> {formatDate(invoiceDate)}</div>
          <div><strong>Billing Period:</strong> {weLabel}</div>
        </div>

        {/* Billing Addresses Grid */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '35px' }}>
          <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#ecc94b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>PROVIDER</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a202c', marginBottom: '4px' }}>{company.companyName}</div>
            {company.companyAddress && <div style={{ color: '#4a5568' }}>{company.companyAddress}</div>}
            {company.companyPhone && <div style={{ color: '#4a5568' }}>Phone: {company.companyPhone}</div>}
            {company.companyEmail && <div style={{ color: '#4a5568' }}>Email: {company.companyEmail}</div>}
          </div>
          <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#ecc94b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>BILL TO CARRIER</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a202c', marginBottom: '4px' }}>{carrier.carrierName}</div>
            {carrier.carrierAddress && <div style={{ color: '#4a5568' }}>{carrier.carrierAddress}</div>}
            {carrier.carrierPhone && <div style={{ color: '#4a5568' }}>Phone: {carrier.carrierPhone}</div>}
            {carrier.mcNumber && <div style={{ color: '#4a5568' }}>MC: {carrier.mcNumber}</div>}
          </div>
        </div>

        {/* Loads Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#2d3748', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600' }}>#</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600' }}>Load Number</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600' }}>Broker</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600' }}>Route Details</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', textAlign: 'right' }}>Gross Pay</th>
              </tr>
            </thead>
            <tbody>
              {loads.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' }}>
                    No loads assigned to this invoice period.
                  </td>
                </tr>
              ) : (
                loads.map((load, index) => {
                  const route = load.originCity && load.destinationCity
                    ? `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`
                    : '—';
                  return (
                    <tr key={load.id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? '#ffffff' : '#f7fafc' }}>
                      <td style={{ padding: '12px 16px', color: '#718096' }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1a202c' }}>{load.loadNumber}</td>
                      <td style={{ padding: '12px 16px' }}>{load.brokerName}</td>
                      <td style={{ padding: '12px 16px', color: '#4a5568' }}>{route}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#1a202c' }}>
                        {formatCurrency(load.grossAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px' }}>
          
          {/* Left Side: Payment Details */}
          <div style={{ width: '45%', border: '1px dashed #cbd5e0', borderRadius: '6px', padding: '16px' }}>
            <div style={{ fontWeight: '700', fontSize: '11px', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>
              Payment Information
            </div>
            <div style={{ fontSize: '12px', color: '#2d3748', lineHeight: '1.6' }}>
              {paymentMethod}
            </div>
          </div>

          {/* Right Side: Totals */}
          <div style={{ width: '45%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#718096' }}>Gross Weekly Revenue</span>
              <span style={{ fontWeight: '600' }}>{formatCurrency(totalGrossRevenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#718096' }}>Dispatch Rate</span>
              <span style={{ fontWeight: '600' }}>{company.dispatchPercentage}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '3px double #ecc94b', fontSize: '16px', fontWeight: '800', color: '#ecc94b' }}>
              <span style={{ textTransform: 'uppercase' }}>Amount Due</span>
              <span>{formatCurrency(dispatchFee)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
