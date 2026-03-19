import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit } from '../../../utils/format';
import { AlertCircle, PlusCircle, Trash2, CalendarClock, ChevronDown } from 'lucide-react';
import { InputGroup } from '../../shared/InputGroup';

export function LifeEventsCard() {
  const { lifeEvents, setLifeEvents, masterHorizon, inflationRate } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    amount: 1000000,
    type: 'one-time', 
    target: 'sip',
    startYear: 5,
    endYear: 5,
    isFixed: false
  });

  const handleAdd = () => {
    if (!newEvent.name) return setError('Please provide an event name.');
    if (newEvent.amount <= 0) return setError('Cost must be greater than zero.');
    if (newEvent.type !== 'one-time' && newEvent.startYear > newEvent.endYear) {
        return setError('End Year cannot be before Start Year.');
    }

    setError('');
    const eventToAdd = {
      ...newEvent,
      id: Date.now().toString(),
      target: newEvent.type === 'one-time' ? newEvent.target : 'cashflow',
      endYear: newEvent.type === 'one-time' ? newEvent.startYear : newEvent.endYear
    };

    setLifeEvents(prev => [...prev, eventToAdd]);
    setNewEvent({ ...newEvent, name: '' }); 
  };

  const removeEvent = (id) => {
    setLifeEvents(prev => prev.filter(e => e.id !== id));
  };

  const getInflatedCost = (amount, year) => {
      return amount * Math.pow(1 + (inflationRate / 100), year);
  };

  return (
    <div className="glass-card flex flex-col h-fit w-full transition-all duration-300 ease-out shadow-xl mb-6">
      
      {/* HEADER */}
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-lg shrink-0">
              <CalendarClock size={20} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Life Event Shocks</h3>
              
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-brand-orange text-white rounded">
                  Beta
              </span>
              
              {/* Event Counter Pill */}
              {!isOpen && lifeEvents.length > 0 && (
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                  {lifeEvents.length} Event{lifeEvents.length !== 1 ? 's' : ''}
                </span>
              )}
          </div>
        </div>
        <div className="p-1 shrink-0">
          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* FLUID ACCORDION ANIMATION */}
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col pt-2 border-t border-black/5 dark:border-white/5 mt-2">
            
            {/* PERSISTENT DISCLAIMER BANNER */}
            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg flex items-start gap-2 text-yellow-800 dark:text-yellow-200 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    <strong>Caution:</strong> This feature is currently in Beta. The simulator does not actively prevent you from spending money you don't have. Please monitor your <em>Wealth Chart</em> and <em>Salary Preview Table</em>.
                </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold animate-in fade-in">
                  <AlertCircle size={14} />
                  {error}
              </div>
            )}

            {/* THE INPUT FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
               <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Event Name</label>
                  <input 
                      type="text" 
                      placeholder="e.g., House Downpayment" 
                      value={newEvent.name}
                      onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                      className="input-field mt-1"
                  />
               </div>

               <div className="flex flex-col">
                   <InputGroup label="Cost (In Today's ₹)" value={newEvent.amount} onChange={v => setNewEvent({...newEvent, amount: v})} />
                   <span className="text-[10px] font-medium text-brand-orange h-3 block mt-1 px-1">
                       {newEvent.amount > 0 ? `(${formatUnit(newEvent.amount)})` : ''}
                   </span>
               </div>
               
               <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Event Type</label>
                  <select 
                      value={newEvent.type} 
                      onChange={e => {
                          const type = e.target.value;
                          setNewEvent({...newEvent, type, target: type === 'one-time' ? 'sip' : 'cashflow'});
                      }}
                      className="input-field mt-1"
                  >
                      <option value="one-time">One-Time (Corpus Shock)</option>
                      <option value="monthly-emi">Monthly EMI (Cashflow Shock)</option>
                      <option value="yearly-recurring">Yearly Recurring (Cashflow)</option>
                  </select>
               </div>

               <InputGroup label="Start Year" value={newEvent.startYear} onChange={v => setNewEvent({...newEvent, startYear: v})} min={1} max={masterHorizon} />
               
               {newEvent.type !== 'one-time' && (
                   <InputGroup label="End Year" value={newEvent.endYear} onChange={v => setNewEvent({...newEvent, endYear: v})} min={newEvent.startYear} max={masterHorizon} />
               )}

               {newEvent.type === 'one-time' && (
                  <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Withdraw From</label>
                      <select value={newEvent.target} onChange={e => setNewEvent({...newEvent, target: e.target.value})} className="input-field mt-1">
                          <option value="sip">SIP Portfolio</option>
                          <option value="save">Savings / FD</option>
                      </select>
                  </div>
               )}

               {newEvent.type !== 'one-time' && (
                  <div className="flex items-center gap-2 mt-6">
                      <input 
                          type="checkbox" 
                          id="isFixed" 
                          checked={newEvent.isFixed} 
                          onChange={e => setNewEvent({...newEvent, isFixed: e.target.checked})}
                          className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange"
                      />
                      <label htmlFor="isFixed" className="text-xs font-bold text-slate-600 dark:text-slate-400">Fixed Cost (No Inflation)</label>
                  </div>
               )}

               <div className="col-span-1 md:col-span-2 mt-2">
                  <button 
                      onClick={handleAdd}
                      disabled={!newEvent.name}
                      className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-lg text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                      <PlusCircle size={16} /> Add Event
                  </button>
               </div>
            </div>

            {/* ACTIVE EVENTS LEDGER */}
            <div className="space-y-3">
                {lifeEvents.map(event => (
                    <div key={event.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {event.name} 
                                <span className="text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">
                                    {event.type === 'one-time' ? `From ${event.target}` : 'Cashflow'}
                                </span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Today's Cost: {formatCurrency(event.amount)} {event.type === 'monthly-emi' ? '/ mo' : ''}
                            </p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <div>
                                <p className="text-xs font-bold text-brand-orange">
                                    Inflated: {formatCurrency(getInflatedCost(event.amount, event.startYear))}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    Year {event.startYear} {event.type !== 'one-time' ? `to ${event.endYear}` : ''}
                                </p>
                            </div>
                            <button onClick={() => removeEvent(event.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {lifeEvents.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-4 italic">No life events added yet.</p>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}