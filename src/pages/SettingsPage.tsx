import { useState, useRef } from 'react';
import { Save, CheckCircle, Building2, Truck, DollarSign, Wallet, Upload, X, Image, BookmarkPlus, Trash2 } from 'lucide-react';
import type { CompanySettings, CarrierSettings, SavedCarrier } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SettingsPageProps {
  company: CompanySettings;
  carrier: CarrierSettings;
  savedCarriers: SavedCarrier[];
  onSave: (company: CompanySettings, carrier: CarrierSettings) => void | Promise<void>;
  onAddCarrier: (carrier: CarrierSettings) => void | Promise<void>;
  onRemoveCarrier: (id: string) => void | Promise<void>;
  onLoadCarrier: (id: string) => void;
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-steel/20 rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-4 focus:ring-signal/10 focus:border-signal/70 transition-all placeholder:text-steel/45"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-steel/20 rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-4 focus:ring-signal/10 focus:border-signal/70 transition-all placeholder:text-steel/45 resize-none"
      />
    </div>
  );
}

export function SettingsPage({ company, carrier, savedCarriers, onSave, onAddCarrier, onRemoveCarrier, onLoadCarrier }: SettingsPageProps) {
  const { user } = useAuth();
  const [comp, setComp] = useState<CompanySettings>(company);
  const [carr, setCarr] = useState<CarrierSettings>(carrier);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await onSave(comp, carr);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      setComp(prev => ({ ...prev, companyLogo: urlData.publicUrl }));
    } catch (err) {
      console.error('Logo upload failed:', err);
      const message = err instanceof Error ? err.message : 'Logo upload failed. Please try a smaller image or different format.';
      setUploadError(message);
      setTimeout(() => setUploadError(null), 5000);
    }
    setUploading(false);
  };

  const removeLogo = () => setComp(prev => ({ ...prev, companyLogo: '' }));

  const setC = (k: keyof CompanySettings) => (v: string) => setComp(prev => ({ ...prev, [k]: k === 'dispatchPercentage' ? Number(v) : v }));
  const setK = (k: keyof CarrierSettings) => (v: string) => setCarr(prev => ({ ...prev, [k]: v }));

  const handleSelectCarrier = (id: string) => {
    onLoadCarrier(id);
    const found = savedCarriers.find(c => c.id === id);
    if (found) {
      setCarr({ carrierName: found.carrierName, carrierAddress: found.carrierAddress, mcNumber: found.mcNumber, carrierPhone: found.carrierPhone });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight font-outfit">Settings</h1>
        <p className="text-steel text-sm mt-0.5 font-medium">Configure company info, carrier settings, and payment preferences.</p>
      </div>

      {/* Company Branding */}
      <section className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-steel/5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Image size={16} />
          </div>
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Company Branding</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="space-y-2">
            <label className="block text-xxs font-bold text-steel uppercase tracking-widest">Company Logo</label>
            {comp.companyLogo ? (
              <div className="relative inline-block">
                <img src={comp.companyLogo} alt="Logo" className="max-h-20 max-w-48 object-contain rounded-lg border border-steel/10" />
                <button onClick={removeLogo} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-steel/20 rounded-xl text-xs text-steel hover:border-signal hover:text-signal transition-all"
              >
                <Upload size={14} />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            {uploadError && <p className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 mt-1">{uploadError}</p>}
            <p className="text-[10px] text-steel">PNG, JPG. Max 120px height on invoice.</p>
          </div>
          <div className="flex-1">
            <Field label="Custom Header Text" value={comp.companyHeaderText || ''} onChange={setC('companyHeaderText')} placeholder="e.g. Premium Dispatch Services" />
            <p className="text-[10px] text-steel mt-1">Appears under company name on invoices</p>
          </div>
        </div>
      </section>

      {/* Dispatch Company */}
      <section className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-steel/5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-signal/5 text-signal flex items-center justify-center">
            <Building2 size={16} />
          </div>
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Dispatch Company Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Company Name" value={comp.companyName} onChange={setC('companyName')} placeholder="e.g. Apex Dispatch Services" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Address" value={comp.companyAddress} onChange={setC('companyAddress')} placeholder="Street, City, State ZIP" />
          </div>
          <Field label="Phone" value={comp.companyPhone} onChange={setC('companyPhone')} placeholder="(555) 123-4567" />
          <Field label="Email" value={comp.companyEmail} onChange={setC('companyEmail')} placeholder="dispatch@company.com" />
        </div>
      </section>

      {/* Carrier Section */}
      <section className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amberline/10 text-amberline flex items-center justify-center">
              <Truck size={16} />
            </div>
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Carrier Information</h2>
          </div>
          {carr.carrierName && (
            <button
              onClick={() => onAddCarrier(carr)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-signal bg-signal/5 border border-signal/20 rounded-xl hover:bg-signal hover:text-white transition-all"
            >
              <BookmarkPlus size={12} /> Save Carrier
            </button>
          )}
        </div>

        {savedCarriers.length > 0 && (
          <div>
            <label className="block text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">Quick Select Saved Carrier</label>
            <div className="flex flex-wrap gap-2">
              {savedCarriers.map(sc => (
                <div key={sc.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSelectCarrier(sc.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-lane border border-steel/15 rounded-lg hover:border-signal hover:text-signal transition-all"
                  >
                    {sc.carrierName} {sc.mcNumber && `(${sc.mcNumber})`}
                  </button>
                  <button
                    onClick={() => onRemoveCarrier(sc.id)}
                    className="p-1 text-steel hover:text-red-500 transition-all"
                    title="Remove saved carrier"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Carrier / Trucking Company" value={carr.carrierName} onChange={setK('carrierName')} placeholder="e.g. Swift Trucking LLC" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Address" value={carr.carrierAddress} onChange={setK('carrierAddress')} placeholder="Street, City, State ZIP" />
          </div>
          <Field label="MC Number" value={carr.mcNumber} onChange={setK('mcNumber')} placeholder="MC-123456" />
          <Field label="Phone" value={carr.carrierPhone} onChange={setK('carrierPhone')} placeholder="(555) 987-6543" />
        </div>
      </section>

      {/* Payment */}
      <section className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-steel/5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={16} />
          </div>
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Payment & Billing</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Dispatch %" value={String(comp.dispatchPercentage)} onChange={v => setComp(p => ({ ...p, dispatchPercentage: Number(v) || 0 }))} type="number" placeholder="10" />
          <Field label="Zelle" value={comp.zelle} onChange={setC('zelle')} placeholder="zelle@email.com" />
          <Field label="Payoneer" value={comp.payoneer} onChange={setC('payoneer')} placeholder="payoneer@email.com" />
          <Field label="Cash App" value={comp.cashApp || ''} onChange={setC('cashApp')} placeholder="$cashtag" />
          <div className="sm:col-span-2">
            <TextArea label="Bank Information" value={comp.bankInformation} onChange={setC('bankInformation')} placeholder="Bank name, routing #, account #" />
          </div>
          <div className="sm:col-span-2">
            <TextArea label="Payment Instructions (legacy)" value={comp.paymentInstructions} onChange={setC('paymentInstructions')} placeholder="Additional payment notes..." />
          </div>
          <div className="sm:col-span-2">
            <Field label="Account Holder Name" value={comp.accountHolderName || ''} onChange={setC('accountHolderName')} placeholder="Full legal name on payment account" />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 bg-signal text-white rounded-xl font-bold text-sm hover:bg-signal/90 shadow-sm hover:shadow-md transition-all"
      >
        {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save All Settings</>}
      </button>
    </div>
  );
}
