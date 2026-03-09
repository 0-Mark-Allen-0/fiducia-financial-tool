import { createContext, useContext, useState, useEffect } from 'react';
import { 
  calculateSalarySeries, 
  calculateEPF_VPF_Pro, 
  calculateInvestment, 
  calculateSWP 
} from '../utils/finance';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  // --- 1. GLOBAL SETTINGS ---
  const [isProMode, setIsProMode] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  // --- 2. INPUT STATES ---
  const [sipInput, setSipInput] = useState({
    amount: 15000,
    stepUp: 10,
    returnRate: 12,
    horizon: 15,
  });

  const [savInput, setSavInput] = useState({
    amount: 10000,
    stepUp: 10,
    returnRate: 6,
    horizon: 15,
  });

  const [epfInput, setEpfInput] = useState({
    salary: 100000,   // Monthly Gross
    basicPercent: 50,
    hike: 10,
    rate: 8.25,
    empContrib: 12,
    emprContrib: 3.67,
    horizon: 15,
  });

  // VPF Input now includes 'strategy' for the Shadow Ledger
  const [vpfInput, setVpfInput] = useState({
    amount: 5000,
    stepUp: 10,
    rate: 8.25,
    horizon: 15,
    strategy: 'maximize' // Options: 'maximize', 'sip', 'save'
  });

  const [swpInput, setSwpInput] = useState({
    corpus: 20000000,
    returnRate: 8,
    inflation: 6,
    horizon: 20,
    method: 'swr',
    val: 4,
    gainProp: 50,
    ltcg: 12.5,
  });

  // --- 3. OUTPUT DATA (Structured for Tabs) ---
  const [dashboardData, setDashboardData] = useState({
    summary: { total: 0, corpus: 0, gains: 0 },
    
    // Series Data for Tables
    salarySeries: [],
    epfSeries: [],
    vpfSeries: [],
    sipSeries: [],
    savSeries: [],
    netWorthSeries: [], // Aggregated
    
    // Retirement
    swpSeries: [],
    
    // Cash Flow (Year 1 Snapshot)
    cashFlow: { income: 0, outflow: 0, net: 0 }
  });

  // --- 4. THE CALCULATION CHAIN ---
  useEffect(() => {
    const maxHorizon = Math.max(sipInput.horizon, savInput.horizon, epfInput.horizon, vpfInput.horizon);

    // STEP 1: Salary & Tax Projection
    const salaryData = calculateSalarySeries({
        startSalary: epfInput.salary,
        hike: epfInput.hike,
        years: maxHorizon,
        inflationRate
    });

    // STEP 2: EPF/VPF (Shadow Ledger & Strategy)
    // In Simple Mode, we force 0 VPF and standard EPF logic (no diversion)
    const epfResults = calculateEPF_VPF_Pro({
        salarySeries: salaryData,
        basicPercent: epfInput.basicPercent,
        empContribPct: epfInput.empContrib,
        emprContribPct: epfInput.emprContrib,
        epfRate: epfInput.rate,
        vpfInput: isProMode ? vpfInput : { ...vpfInput, amount: 0, strategy: 'maximize' }, 
        inflationRate
    });

    // STEP 3: Route Overflow based on Strategy
    let sipOverflow = [];
    let savOverflow = [];

    if (isProMode) {
        if (vpfInput.strategy === 'sip') sipOverflow = epfResults.overflowSeries;
        if (vpfInput.strategy === 'save') savOverflow = epfResults.overflowSeries;
    }

    // STEP 4: Calculate Investments (SIP & Savings)
    const sipResults = calculateInvestment({
        monthlyStart: sipInput.amount,
        stepUp: sipInput.stepUp,
        returnRate: sipInput.returnRate,
        inflationRate,
        years: maxHorizon,
        extraFlows: sipOverflow // Inject EPF diversion here
    });

    const savResults = calculateInvestment({
        monthlyStart: savInput.amount,
        stepUp: savInput.stepUp,
        returnRate: savInput.returnRate,
        inflationRate,
        years: maxHorizon,
        extraFlows: savOverflow // Inject EPF diversion here
    });

    // STEP 5: Aggregate Net Worth & Disposable Income
    let netWorthSeries = [];

    for (let i = 0; i < maxHorizon; i++) {
        const salaryItem = salaryData[i] || {};
        const sipItem = sipResults.series[i] || {};
        const savItem = savResults.series[i] || {};
        const epfItem = epfResults.epfSeries[i] || {};
        const vpfItem = epfResults.vpfSeries[i] || {};

        // A. Net Worth
        const totalNominal = (sipItem.corpusNominal || 0) 
                           + (savItem.corpusNominal || 0) 
                           + (epfItem.corpusNominal || 0) 
                           + (vpfItem.corpusNominal || 0);

        const totalReal = (sipItem.corpusReal || 0) 
                        + (savItem.corpusReal || 0) 
                        + (epfItem.corpusReal || 0) 
                        + (vpfItem.corpusReal || 0);

        // B. Disposable Income Calculation
        // Formula: PostTaxSalary - (SIP + Sav + VPF + Mandatory_EPF_Employee_Share)
        
        // We calculate Mandatory EPF Emp Share manually here as finance.js returns Total (Emp+Empr)
        const grossYearly = salaryItem.grossYearly || 0;
        const basicYearly = grossYearly * (epfInput.basicPercent / 100);
        const mandatoryEpfEmpYearly = basicYearly * (epfInput.empContrib / 100);

        const totalInvestmentOutflow = (sipItem.yearlyNominal || 0) 
                                     + (savItem.yearlyNominal || 0) 
                                     + (vpfItem.yearlyNominal || 0) 
                                     + mandatoryEpfEmpYearly;

        const disposableNominal = (salaryItem.netYearly || 0) - totalInvestmentOutflow;
        const infFactor = Math.pow(1 + (inflationRate/100), i+1);

        netWorthSeries.push({
            year: i + 1,
            netWorthNominal: totalNominal,
            netWorthReal: totalReal,
            disposableNominal: disposableNominal,
            disposableReal: disposableNominal / infFactor,
            isNegative: disposableNominal < 0 // Flag for UI warning
        });
    }

    // STEP 6: SWP Calculation
    const swpResults = calculateSWP({
        corpus: swpInput.corpus,
        method: swpInput.method,
        val: swpInput.val,
        returnRate: swpInput.returnRate,
        inflationRate: swpInput.inflation,
        years: swpInput.horizon,
        ltcgRate: swpInput.ltcg,
        gainProp: swpInput.gainProp
    });

    // STEP 7: Year 1 Cash Flow Snapshot
    const y1Salary = salaryData[0] || {};
    const y1NetWorth = netWorthSeries[0] || {};
    
    // Update State
    setDashboardData({
        summary: {
            total: (sipResults.finalValue + savResults.finalValue + epfResults.totalEPF + epfResults.totalVPF),
            corpus: 0, // Calculated purely on visual totals if needed, or derived
            gains: 0   // Derived in UI if needed
        },
        
        // Detailed Series
        salarySeries: salaryData,
        epfSeries: epfResults.epfSeries,
        vpfSeries: epfResults.vpfSeries,
        sipSeries: sipResults.series,
        savSeries: savResults.series,
        netWorthSeries: netWorthSeries,
        
        swpSeries: swpResults,

        cashFlow: {
            income: epfInput.salary,
            netSalary: y1Salary.netYearly / 12, // Monthly Post-Tax
            disposable: y1NetWorth.disposableNominal / 12, // Monthly Disposable
            isNegative: y1NetWorth.isNegative
        }
    });

  }, [sipInput, savInput, epfInput, vpfInput, swpInput, isProMode, inflationRate]);

  return (
    <FinancialContext.Provider value={{
      isProMode, setIsProMode,
      inflationRate, setInflationRate,
      sipInput, setSipInput,
      savInput, setSavInput,
      epfInput, setEpfInput,
      vpfInput, setVpfInput,
      swpInput, setSwpInput,
      dashboardData, 
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancialData = () => useContext(FinancialContext);