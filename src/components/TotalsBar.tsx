import { formatCurrency } from '../lib/calc';
import { Truck, DollarSign, Percent, TrendingUp, TrendingDown } from 'lucide-react';

interface TotalsBarProps {
  totalGrossRevenue: number;
  dispatchFee: number;
  dispatchPercentage: number;
  loadCount: number;
  totalPaid?: number;
  totalUnpaid?: number;
}

/**
 * Auto-sizing text class based on the formatted currency length.
 * Cards expand naturally — text shrinks only enough to stay clean.
 */
function amountSizeClass(amount: number): string {
  const formatted = formatCurrency(amount);
  if (formatted.length >= 13) return 'text-base sm:text-lg';
  if (formatted.length >= 11) return 'text-lg sm:text-xl';
  if (formatted.length >= 9)  return 'text-xl sm:text-2xl';
  return 'text-2xl sm:text-3xl';
}

export function TotalsBar({ totalGrossRevenue, dispatchFee, dispatchPercentage, loadCount, totalPaid, totalUnpaid }: TotalsBarProps) {
  const showPaymentStats = totalPaid !== undefined || totalUnpaid !== undefined;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${showPaymentStats ? 'lg:grid-cols-5' : ''} gap-3 sm:gap-4`}>
      {/* Total Loads Card */}
      <div className="bg-white border border-steel/10 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-panel transition-all duration-300 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">Weekly Loads</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ink">{loadCount}</div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-lane border border-steel/5 rounded-xl flex items-center justify-center text-steel shrink-0">
          <Truck size={18} />
        </div>
      </div>

      {/* Gross Revenue Card */}
      <div className="bg-white border border-steel/10 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-panel transition-all duration-300 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">Gross Revenue</div>
          <div className={`${amountSizeClass(totalGrossRevenue)} font-extrabold text-ink break-all`}>{formatCurrency(totalGrossRevenue)}</div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-lane border border-steel/5 rounded-xl flex items-center justify-center text-steel shrink-0">
          <DollarSign size={18} />
        </div>
      </div>

      {/* Dispatch Fee Card (Teal Primary Accent) */}
      <div className="bg-signal text-white rounded-2xl p-4 sm:p-5 shadow-sm shadow-signal/15 hover:shadow-panel transition-all duration-300 flex items-center justify-between gap-3 col-span-2 sm:col-span-1">
        <div className="min-w-0">
          <div className="text-xxs font-bold text-white/75 uppercase tracking-widest mb-1.5">Dispatch Fee ({dispatchPercentage}%)</div>
          <div className={`${amountSizeClass(dispatchFee)} font-extrabold break-all`}>{formatCurrency(dispatchFee)}</div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
          <Percent size={18} />
        </div>
      </div>

      {/* Total Paid Card */}
      {showPaymentStats && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-panel transition-all duration-300 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xxs font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Total Paid</div>
            <div className={`${amountSizeClass(totalPaid ?? 0)} font-extrabold text-emerald-700 break-all`}>{formatCurrency(totalPaid ?? 0)}</div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>
      )}

      {/* Total Unpaid Card */}
      {showPaymentStats && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-panel transition-all duration-300 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xxs font-bold text-red-700 uppercase tracking-widest mb-1.5">Total Unpaid</div>
            <div className={`${amountSizeClass(totalUnpaid ?? 0)} font-extrabold text-red-700 break-all`}>{formatCurrency(totalUnpaid ?? 0)}</div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center text-red-500 shrink-0">
            <TrendingDown size={18} />
          </div>
        </div>
      )}
    </div>
  );
}
