import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { extractRateConfirmation } from '../lib/api';
import type { Load } from '../types';
import { generateId } from '../lib/calc';
import type { ExtractionResult } from '../../shared/schema';

interface UploadZoneProps {
  onLoadExtracted: (load: Load) => void;
}

export function UploadZone({ onLoadExtracted }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file.');
      return;
    }
    setError(null);
    setLoading(true);
    setLastFile(file.name);

    try {
      const result = await extractRateConfirmation(file);
      if (!result.success || !result.data) {
        setError(result.error || 'Extraction failed. Please try again.');
        setLoading(false);
        return;
      }
      const d: ExtractionResult = result.data;
      const load: Load = {
        id: generateId(),
        loadNumber: d.loadNumber || '',
        brokerName: d.brokerName || '',
        pickupDate: d.pickupDate || '',
        grossAmount: d.grossAmount || 0,
        originCity: d.originCity || '',
        originState: d.originState || '',
        destinationCity: d.destinationCity || '',
        destinationState: d.destinationState || '',
      };
      onLoadExtracted(load);
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [onLoadExtracted]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-signal bg-signal/5' : 'border-steel/30 hover:border-signal/60 hover:bg-lane/60'
        } ${loading ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-signal">
            <Loader2 size={32} className="animate-spin" />
            <div>
              <div className="font-semibold">Extracting load data…</div>
              {lastFile && <div className="text-sm text-steel mt-1">{lastFile}</div>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-steel">
            <Upload size={32} className="text-signal/70" />
            <div>
              <div className="font-semibold text-ink">Drop Rate Confirmation here</div>
              <div className="text-sm mt-1">PDF, JPG, or PNG · Click or drag & drop</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
