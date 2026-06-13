import { formatCurrency } from '../lib/calc';

interface TotalsBarProps {
  totalGrossRevenue: number;
  dispatchFee: number;
  dispatchPercentage: number;
  loadCount: number;
}

export function TotalsBar({ totalGrossRevenue, dispatchFee, dispatchPercentage, loadCount }: TotalsBarProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[140px] bg-lane rounded-xl p-4">
        <div className="text-xs text-steel uppercase tracking-wide mb-1">Loads</div>
        <div className="text-2xl font-bold text-ink">{loadCount}</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-lane rounded-xl p-4">
        <div className="text-xs text-steel uppercase tracking-wide mb-1">Total Gross Revenue</div>
        <div className="text-2xl font-bold text-ink">{formatCurrency(totalGrossRevenue)}</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-signal rounded-xl p-4">
        <div className="text-xs text-white/70 uppercase tracking-wide mb-1">Dispatch Fee ({dispatchPercentage}%)</div>
        <div className="text-2xl font-bold text-white">{formatCurrency(dispatchFee)}</div>
      </div>
    </div>
  );
}
