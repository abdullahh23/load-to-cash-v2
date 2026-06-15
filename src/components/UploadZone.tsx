import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { extractRateConfirmation } from '../lib/api';
import type { Load } from '../types';
import { generateId } from '../lib/calc';
import type { ExtractionResult } from '../../shared/schema';

interface UploadZoneProps {
  onLoadExtracted: (load: Load) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function UploadZone({ onLoadExtracted, disabled, disabledMessage }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (disabled) {
      setError(disabledMessage || 'Uploads are currently disabled for your account.');
      return;
    }
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF or an image file (JPG, PNG, WEBP).');
      return;
    }
    setError(null);
    setLoading(true);
    setLastFile(file.name);

    try {
      const result = await extractRateConfirmation(file);
      if (!result.success || !result.data) {
        setError(result.error || 'Extraction failed. Make sure the file is a clear rate confirmation document.');
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
      setError('Network error. Check your connection or server configurations.');
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
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
          dragging
            ? 'border-signal bg-signal/5 ring-4 ring-signal/15 scale-[0.99]'
            : 'border-steel/20 hover:border-signal/50 hover:bg-lane bg-white/50'
        } ${loading ? 'pointer-events-none opacity-70' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !loading && !disabled && inputRef.current?.click()}
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
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full border-4 border-signal/20 animate-pulse" />
              <Loader2 size={32} className="text-signal animate-spin relative z-10" />
            </div>
            <div>
              <div className="font-bold text-ink text-sm">Processing Confirmation Document...</div>
              <div className="text-xs text-steel mt-1 font-medium truncate max-w-xs mx-auto">
                Analyzing layout & extracting fields
              </div>
              {lastFile && <div className="text-[11px] text-steel/70 italic mt-1">{lastFile}</div>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-signal/5 border border-signal/15 flex items-center justify-center text-signal shadow-sm">
              <Upload size={22} />
            </div>
            <div>
              <div className="font-bold text-ink text-sm">Drop Rate Confirmation here</div>
              <div className="text-xs text-steel mt-1.5 font-medium">
                Supports PDF, JPG, PNG, or WEBP files up to 20MB
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-semibold bg-white border border-steel/15 text-ink hover:border-signal hover:text-signal shadow-sm px-4 py-2 rounded-xl transition-all"
            >
              Select File
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50/50 border border-red-200/60 rounded-2xl text-red-700 text-xs font-semibold shadow-sm animate-fade-in">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <div className="flex-1">{error}</div>
        </div>
      )}
    </div>
  );
}
