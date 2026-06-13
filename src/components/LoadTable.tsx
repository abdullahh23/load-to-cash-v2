import { Trash2 } from 'lucide-react';
import type { Load } from '../types';
import { formatCurrency, formatDate } from '../lib/calc';

interface LoadTableProps {
  loads: Load[];
  onRemove: (id: string) => void;
}

export function LoadTable({ loads, onRemove }: LoadTableProps) {
  if (loads.length === 0) {
    return (
      <div className="text-center py-10 text-steel text-sm">
        No loads added yet. Upload a rate confirmation to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-steel/15">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-lane text-steel text-xs uppercase tracking-wide">
            <th className="px-4 py-3 text-left">Load #</th>
            <th className="px-4 py-3 text-left">Broker</th>
            <th className="px-4 py-3 text-left">Pickup</th>
            <th className="px-4 py-3 text-left">Origin</th>
            <th className="px-4 py-3 text-left">Destination</th>
            <th className="px-4 py-3 text-right">Gross</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {loads.map((load, i) => (
            <tr key={load.id} className={`border-t border-steel/10 ${i % 2 === 0 ? 'bg-white' : 'bg-lane/40'}`}>
              <td className="px-4 py-3 font-semibold text-ink">{load.loadNumber || '—'}</td>
              <td className="px-4 py-3 text-road">{load.brokerName || '—'}</td>
              <td className="px-4 py-3 text-road">{formatDate(load.pickupDate)}</td>
              <td className="px-4 py-3 text-road">{load.originCity && load.originState ? `${load.originCity}, ${load.originState}` : '—'}</td>
              <td className="px-4 py-3 text-road">{load.destinationCity && load.destinationState ? `${load.destinationCity}, ${load.destinationState}` : '—'}</td>
              <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(load.grossAmount)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onRemove(load.id)}
                  className="text-steel hover:text-red-500 transition-colors"
                  title="Remove load"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
