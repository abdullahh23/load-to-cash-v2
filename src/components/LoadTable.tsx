import { Trash2, Sparkles, FileInput } from 'lucide-react';
import type { Load } from '../types';
import { formatCurrency, formatDate } from '../lib/calc';

interface LoadTableProps {
  loads: Load[];
  onRemove: (id: string) => void;
}

export function LoadTable({ loads, onRemove }: LoadTableProps) {
  if (loads.length === 0) {
    return (
      <div className="text-center py-12 text-steel text-sm bg-lane/50 rounded-2xl border border-dashed border-steel/20">
        No active loads listed. Upload a rate confirmation or enter a load manually to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-steel/10 bg-white shadow-card">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-lane/50 border-b border-steel/10 text-steel text-[11px] font-bold uppercase tracking-wider">
            <th className="px-5 py-4 text-left">Load Info</th>
            <th className="px-5 py-4 text-left">Broker</th>
            <th className="px-5 py-4 text-left">Pickup Date</th>
            <th className="px-5 py-4 text-left">Route Details</th>
            <th className="px-5 py-4 text-right">Gross Pay</th>
            <th className="px-5 py-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel/5">
          {loads.map((load) => {
            const isExtracted = load.source === 'extract';
            const route = load.originCity && load.destinationCity
              ? `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`
              : '—';
            
            return (
              <tr key={load.id} className="hover:bg-lane/35 transition-all">
                {/* Load Number with source badge */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink text-sm">
                      {load.loadNumber || '—'}
                    </span>
                    {isExtracted ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-extrabold bg-teal-50 border border-teal-200 text-teal-700 px-1.5 py-0.5 rounded-full" title="Auto-extracted via AI">
                        <Sparkles size={8} /> AI
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[9px] font-extrabold bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full" title="Manually entered">
                        <FileInput size={8} /> Manual
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Broker */}
                <td className="px-5 py-4 text-ink font-semibold">{load.brokerName || '—'}</td>
                
                {/* Pickup Date */}
                <td className="px-5 py-4 text-road font-medium">{formatDate(load.pickupDate)}</td>
                
                {/* Route */}
                <td className="px-5 py-4 text-road font-medium">{route}</td>
                
                {/* Gross Amount */}
                <td className="px-5 py-4 text-right font-mono font-bold text-ink text-sm">
                  {formatCurrency(load.grossAmount)}
                </td>
                
                {/* Action */}
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => { if (confirm('Remove this load?')) onRemove(load.id); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-steel hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Remove load"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
