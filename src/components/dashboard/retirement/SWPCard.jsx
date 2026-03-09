import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { formatCurrency } from '../../../utils/format';
import { Coins } from 'lucide-react';

export function SWPCard() {
  const { swpInput, setSwpInput } = useFinancialData();

  const update = (field, val) => setSwpInput(prev => ({ ...prev, [field]: val }));

  // Helper to calculate monthly income preview
  const getMonthlyPreview = () => {
    if (swpInput.method === 'fixed') return swpInput.val;
    // SWR Logic: (Corpus * Rate%) / 12
    return (swpInput.corpus * (swpInput.val / 100)) / 12;
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full border-brand-orange/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
            <Coins size={20} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Systematic Withdrawal</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <InputGroup 
                label="Retirement Corpus (₹)" 
                value={swpInput.corpus} 
                onChange={(v) => update('corpus', v)} 
                isCurrency 
            />
        </div>

        <InputGroup label="Return (%)" value={swpInput.returnRate} onChange={(v) => update('returnRate', v)} step="0.1" />
        <InputGroup label="Inflation (%)" value={swpInput.inflation} onChange={(v) => update('inflation', v)} step="0.1" />
        
        <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Withdrawal Strategy
            </label>
            <select 
                value={swpInput.method}
                onChange={(e) => update('method', e.target.value)}
                className="input-field mt-1"
            >
                <option value="swr">Safe Withdrawal Rate (%)</option>
                <option value="fixed">Fixed Monthly Amount (₹)</option>
            </select>
        </div>

        <div className="col-span-2">
            <InputGroup 
                label={swpInput.method === 'swr' ? "Withdrawal Rate (%)" : "Monthly Amount (₹)"}
                value={swpInput.val}
                onChange={(v) => update('val', v)}
                step={swpInput.method === 'swr' ? "0.1" : "1000"}
                isCurrency={swpInput.method === 'fixed'}
            />
            {swpInput.method === 'swr' && (
                <p className="text-right text-xs font-semibold text-brand-green mt-1">
                    ≈ {formatCurrency(getMonthlyPreview())} / month
                </p>
            )}
        </div>

        {/* Tax Estimation Inputs */}
        <InputGroup 
            label="Profit Ratio (%)" 
            value={swpInput.gainProp} 
            onChange={(v) => update('gainProp', v)} 
            tooltip="% of your corpus that is pure profit (interest/gains)"
        />
        <InputGroup 
            label="LTCG Tax (%)" 
            value={swpInput.ltcg} 
            onChange={(v) => update('ltcg', v)} 
            step="0.1"
        />
      </div>
    </div>
  );
}