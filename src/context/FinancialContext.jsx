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
  
  // The Master Projection Timeline
  const [masterHorizon, setMasterHorizon] = useState(25);

  // --- SPOUSAL SIMULATOR STATE ---
  const [isSpouseEnabled, setIsSpouseEnabled] = useState(false);
  const [spousalMultiplier, setSpousalMultiplier] = useState(2.0); // 2.0 = 100% Match
  const [spousalStartYear, setSpousalStartYear] = useState(1);

  // --- NEW: LIFE EVENT ENGINE STATE ---
  // Array of objects representing shocks to the timeline.
  // Example Event: { id: 1, name: "House Downpayment", amount: 5000000, type: "one-time", startYear: 5, endYear: 5, target: "sip", isFixed: false }
  const [lifeEvents, setLifeEvents] = useState([]);

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
    salary: 100000,   
    basicPercent: 50,
    hike: 10,
    rate: 8.25,
    empContrib: 12,
    emprContrib: 3.67,
    horizon: 15,
    strategy: 'standard', 
    divertTo: 'sip'       
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
  const updateMasterHorizon = (newVal) => {
    const validVal = Math.max(1, Math.min(75, Number(newVal)));
    setMasterHorizon(validVal);

    setSipInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setSavInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setEpfInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setVpfInput(prev => ({ ...prev, horizon: Math.min(prev.horizon, validVal) }));
    setSpousalStartYear(prev => Math.min(prev, validVal));
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
    
    // STEP 1: Salary & Tax Projection
    const salaryData = calculateSalarySeries({
        startSalary: epfInput.salary,
        hike: epfInput.hike,
        years: masterHorizon, 
        inflationRate,
        isSpouseEnabled, 
        spousalMultiplier, 
        spousalStartYear
    });

    // STEP 2: EPF/VPF (Shadow Ledger & Strategy)
    const epfResults = calculateEPF_VPF_Pro({
        salarySeries: salaryData,
        basicPercent: epfInput.basicPercent,
        empContribPct: epfInput.empContrib,
        emprContribPct: epfInput.emprContrib,
        epfRate: epfInput.rate,
        epfHorizon: epfInput.horizon, 
        vpfHorizon: vpfInput.horizon, 
        epfStrategy: isProMode ? epfInput.strategy : 'standard', 
        vpfInput: isProMode ? vpfInput : { ...vpfInput, amount: 0, strategy: 'maximize' }, 
        inflationRate,
        isSpouseEnabled, 
        spousalMultiplier, 
        spousalStartYear
    });

    // STEP 3: Route Overflows & Inject CORPUS SHOCKS (One-Time Life Events)
    let sipOverflow = new Array(masterHorizon).fill(0);
    let savOverflow = new Array(masterHorizon).fill(0);

    if (isProMode) {
        const vpfArr = epfResults.vpfOverflowSeries || epfResults.overflowSeries || [];
        const epfArr = epfResults.epfOverflowSeries || [];

        for (let i = 0; i < masterHorizon; i++) {
            // Route VPF/EPF Overflows
            if (vpfInput.strategy === 'sip') sipOverflow[i] += (vpfArr[i] || 0);
            if (vpfInput.strategy === 'save') savOverflow[i] += (vpfArr[i] || 0);

            if (epfInput.strategy === 'smart' || epfInput.strategy === 'minimum') {
                if (epfInput.divertTo === 'sip') sipOverflow[i] += (epfArr[i] || 0);
                if (epfInput.divertTo === 'save') savOverflow[i] += (epfArr[i] || 0);
            }
        }
    }

    // --- NEW: INJECT CORPUS SHOCKS ---
    lifeEvents.forEach(event => {
        if (event.type === 'one-time') {
            const yIndex = event.startYear - 1; // Array is 0-indexed, years are 1-indexed
            if (yIndex >= 0 && yIndex < masterHorizon) {
                // Auto-Inflate: The user inputs "Today's Money" (Present Value). 
                // The engine dynamically calculates the Future Value (FV) for that specific year.
                const futureValue = event.amount * Math.pow(1 + inflationRate / 100, event.startYear);
                
                // Inject massive negative flow into the designated bucket
                if (event.target === 'sip') sipOverflow[yIndex] -= futureValue;
                if (event.target === 'save') savOverflow[yIndex] -= futureValue;
            }
        }
    });

    // STEP 4: Calculate Investments (SIP & Savings)
    const sipResults = calculateInvestment({
        monthlyStart: sipInput.amount,
        stepUp: sipInput.stepUp,
        returnRate: sipInput.returnRate,
        inflationRate,
        activeYears: sipInput.horizon, 
        totalYears: masterHorizon,     
        extraFlows: sipOverflow,
        isSpouseEnabled, 
        spousalMultiplier, 
        spousalStartYear 
    });

    const savResults = calculateInvestment({
        monthlyStart: savInput.amount,
        stepUp: savInput.stepUp,
        returnRate: savInput.returnRate,
        inflationRate,
        activeYears: savInput.horizon, 
        totalYears: masterHorizon,     
        extraFlows: savOverflow,
        isSpouseEnabled, 
        spousalMultiplier, 
        spousalStartYear 
    });

    // STEP 5: Aggregate Net Worth & Calculate CASHFLOW SHOCKS (Recurring EMIs)
    let netWorthSeries = [];
    
    // NEW: Tracker to catch the first instance of bankruptcy
    let firstBankruptcy = null;

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

        // CALCULATE YEARLY CASHFLOW SHOCKS
        let yearlyCashflowShocks = 0;
        const currentYear = i + 1;

        lifeEvents.forEach(event => {
            if (event.type !== 'one-time' && event.target === 'cashflow') {
                if (currentYear >= event.startYear && currentYear <= event.endYear) {
                    let cost = event.amount;
                    if (!event.isFixed) {
                        cost = cost * Math.pow(1 + inflationRate / 100, currentYear);
                    }
                    if (event.type === 'monthly-emi') {
                        cost *= 12;
                    }
                    yearlyCashflowShocks += cost;
                }
            }
        });

        // B. Disposable Income Calculation
        const isEpfActive = (i + 1) <= epfInput.horizon;
        let mandatoryEpfEmpYearly = epfItem.yearlyEmployeeNominal || 0;
        
        if (!isProMode && isEpfActive) {
           const grossYearly = salaryItem.grossYearly || 0;
           const activeMultiplier = (isSpouseEnabled && (i+1) >= spousalStartYear) ? spousalMultiplier : 1;
           const primaryGrossYearly = grossYearly / activeMultiplier;
           const basicYearly = primaryGrossYearly * (epfInput.basicPercent / 100);
           mandatoryEpfEmpYearly = (basicYearly * (epfInput.empContrib / 100)) * activeMultiplier;
        }

        const totalInvestmentOutflow = (sipItem.yearlyNominal || 0) 
                                     + (savItem.yearlyNominal || 0) 
                                     + (vpfItem.yearlyNominal || 0) 
                                     + mandatoryEpfEmpYearly;

        const extraTax = (epfResults.employerTaxDragSeries && epfResults.employerTaxDragSeries[i]) || 0;

        const disposableNominal = (salaryItem.netYearly || 0) - totalInvestmentOutflow - extraTax - yearlyCashflowShocks;
        const infFactor = Math.pow(1 + (inflationRate/100), i+1);

        // NEW: DETECT BANKRUPTCY
        // We only record the first one we find so the UI doesn't spam the user.
        if (!firstBankruptcy) {
            if (sipItem.isBankrupt) {
                firstBankruptcy = { type: 'SIP Portfolio', year: currentYear, shortfall: sipItem.shortfallNominal };
            } else if (savItem.isBankrupt) {
                firstBankruptcy = { type: 'Savings/FD', year: currentYear, shortfall: savItem.shortfallNominal };
            } else if (disposableNominal < 0) {
                firstBankruptcy = { type: 'Monthly Cashflow', year: currentYear, shortfall: Math.abs(disposableNominal) };
            }
        }

        netWorthSeries.push({
            year: currentYear,
            netWorthNominal: totalNominal,
            netWorthReal: totalReal,
            disposableNominal: disposableNominal,
            disposableReal: disposableNominal / infFactor,
            isNegative: disposableNominal < 0,
            lifeEventsNominal: yearlyCashflowShocks
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
        // DYNAMIC TAX ZEROING FOR SIMPLE MODE
        ltcgRate: isProMode ? swpInput.ltcg : 0,
        gainProp: isProMode ? swpInput.gainProp : 0
    });

    // STEP 7: Year 1 Cash Flow Snapshot
    const y1Salary = salaryData[0] || {};
    const y1NetWorth = netWorthSeries[0] || {};
    
    // Update State
    setDashboardData({
        summary: {
            // DYNAMIC TOTAL: Liquid Wealth (Simple) vs Full Net Worth (Pro)
            total: isProMode 
                ? (sipResults.finalValue + savResults.finalValue + epfResults.totalEPF + epfResults.totalVPF)
                : (sipResults.finalValue + savResults.finalValue),
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

  // Ensure lifeEvents is added to the dependency array!
  }, [sipInput, savInput, epfInput, vpfInput, swpInput, isProMode, inflationRate, masterHorizon, isSpouseEnabled, spousalMultiplier, spousalStartYear, lifeEvents]);

  return (
    <FinancialContext.Provider value={{
      isProMode, setIsProMode,
      inflationRate, setInflationRate,
      masterHorizon, updateMasterHorizon,
      
      isSpouseEnabled, setIsSpouseEnabled,
      spousalMultiplier, setSpousalMultiplier,
      spousalStartYear, setSpousalStartYear,

      // Export Life Events State
      lifeEvents, setLifeEvents,

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