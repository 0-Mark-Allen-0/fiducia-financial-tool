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
  
  // NEW: The Master Projection Timeline (Limits the visual/compounding boundaries)
  // Hard limits: min 1, max 75. Let's set a default of 25.
  const [masterHorizon, setMasterHorizon] = useState(25);

  // --- 2. INPUT STATES ---
  const [sipInput, setSipInput] = useState({
    amount: 15000,
    stepUp: 10,
    returnRate: 12,
    horizon: 15, // Contribution Horizon
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

  const [vpfInput, setVpfInput] = useState({
    amount: 5000,
    stepUp: 10,
    rate: 8.25,
    horizon: 15,
    strategy: 'maximize' 
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

  // --- THE CASCADE EFFECT ---
  // When the user updates the Master Horizon, we intercept it here to ensure
  // no individual contribution horizon exceeds the new Master limit.
  const updateMasterHorizon = (newVal) => {
    // 1. Enforce Hard Limits (1 to 75 years)
    const validVal = Math.max(1, Math.min(75, Number(newVal)));
    setMasterHorizon(validVal);

    // 2. The Cascade: Auto-correct any card horizons that are now out of bounds
    setSipInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setSavInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setEpfInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setVpfInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
  };

  // --- 3. OUTPUT DATA (Structured for Tabs) ---
  const [dashboardData, setDashboardData] = useState({
    summary: { total: 0, corpus: 0, gains: 0 },
    
    salarySeries: [],
    epfSeries: [],
    vpfSeries: [],
    sipSeries: [],
    savSeries: [],
    netWorthSeries: [], 
    
    swpSeries: [],
    cashFlow: { income: 0, outflow: 0, net: 0 }
  });

  // --- 4. THE CALCULATION CHAIN ---
  useEffect(() => {
    // STEP 1: Salary & Tax Projection runs for the entire Master Horizon
    const salaryData = calculateSalarySeries({
        startSalary: epfInput.salary,
        hike: epfInput.hike,
        years: masterHorizon, 
        inflationRate
    });

    // STEP 2: EPF/VPF (Shadow Ledger & Strategy)
    const epfResults = calculateEPF_VPF_Pro({
        salarySeries: salaryData,
        basicPercent: epfInput.basicPercent,
        empContribPct: epfInput.empContrib,
        emprContribPct: epfInput.emprContrib,
        epfRate: epfInput.rate,
        epfHorizon: epfInput.horizon, // Passing distinct horizon
        vpfHorizon: vpfInput.horizon, // Passing distinct horizon
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
        activeYears: sipInput.horizon, // The contribution phase
        totalYears: masterHorizon,     // The compounding/visual phase
        extraFlows: sipOverflow 
    });

    const savResults = calculateInvestment({
        monthlyStart: savInput.amount,
        stepUp: savInput.stepUp,
        returnRate: savInput.returnRate,
        inflationRate,
        activeYears: savInput.horizon, // The contribution phase
        totalYears: masterHorizon,     // The compounding/visual phase
        extraFlows: savOverflow 
    });

    // STEP 5: Aggregate Net Worth & Disposable Income
    let netWorthSeries = [];

    for (let i = 0; i < masterHorizon; i++) {
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
        const grossYearly = salaryItem.grossYearly || 0;
        const basicYearly = grossYearly * (epfInput.basicPercent / 100);
        
        // Ensure we only deduct mandatory EPF from disposable income if it's still active
        const isEpfActive = (i + 1) <= epfInput.horizon;
        const mandatoryEpfEmpYearly = isEpfActive ? (basicYearly * (epfInput.empContrib / 100)) : 0;

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
            isNegative: disposableNominal < 0 
        });
    }

    // STEP 6: SWP Calculation (Unaffected by master horizon logic, retirement runs independently)
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
            corpus: 0, 
            gains: 0   
        },
        
        salarySeries: salaryData,
        epfSeries: epfResults.epfSeries,
        vpfSeries: epfResults.vpfSeries,
        sipSeries: sipResults.series,
        savSeries: savResults.series,
        netWorthSeries: netWorthSeries,
        
        swpSeries: swpResults,

        cashFlow: {
            income: epfInput.salary,
            netSalary: y1Salary.netYearly / 12, 
            disposable: y1NetWorth.disposableNominal / 12, 
            isNegative: y1NetWorth.isNegative
        }
    });

  // NOTE: Added `masterHorizon` to the dependency array
  }, [sipInput, savInput, epfInput, vpfInput, swpInput, isProMode, inflationRate, masterHorizon]);

  return (
    <FinancialContext.Provider value={{
      isProMode, setIsProMode,
      inflationRate, setInflationRate,
      masterHorizon, updateMasterHorizon, // Exposed the new state and cascading updater
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