import { calculateNewRegimeTax, getMarginalTaxRate } from './tax';

/**
 * Helper: Calculate Inflation Factor
 */
const getInfFactor = (rate, year) => Math.pow(1 + (rate / 100), year);

/**
 * 1. SALARY & TAX ENGINE
 * Projects Gross Salary, Calculates Tax, and determines Net Income.
 */
export const calculateSalarySeries = ({
  startSalary, // Monthly Gross
  hike,
  years,
  inflationRate
}) => {
  let currentMonthly = startSalary;
  let series = [];

  for (let y = 1; y <= years; y++) {
    let grossYearly = currentMonthly * 12;
    let taxYearly = calculateNewRegimeTax(grossYearly);
    let netYearly = grossYearly - taxYearly;
    
    let infFactor = getInfFactor(inflationRate, y);

    series.push({
      year: y,
      monthlyGross: currentMonthly,
      grossYearly: grossYearly,
      taxYearly: taxYearly,
      netYearly: netYearly, 
      monthlyGrossReal: currentMonthly / infFactor,
      netYearlyReal: netYearly / infFactor
    });

    currentMonthly *= (1 + (hike / 100));
  }

  return series;
};

/**
 * 2. EPF & VPF ENGINE (PRO MODE - SHADOW Ledger)
 * Handles the 2.5L Cap and Diversion Strategies.
 */
export const calculateEPF_VPF_Pro = ({
  salarySeries,   
  basicPercent,   
  empContribPct,  
  emprContribPct, 
  epfRate,
  epfHorizon,     
  vpfHorizon,     
  epfStrategy = 'standard', // 'standard', 'smart', or 'minimum'
  vpfInput,       
  inflationRate
}) => {
  
  let epfCorpus = 0; 
  let vpfCorpus = 0; 
  
  let bucketTaxFree = 0; 
  let bucketTaxable = 0;

  let vpfOverflowSeries = []; 
  let epfOverflowSeries = [];
  let employerTaxDragSeries = [];
  
  let epfSeriesData = [];
  let vpfSeriesData = [];

  let currentVpfMonthly = vpfInput.amount;
  let rate = epfRate / 100;

  salarySeries.forEach((yearData) => {
    const y = yearData.year;
    const grossYearly = yearData.grossYearly;

    const isEpfActive = y <= epfHorizon;
    const isVpfActive = y <= vpfHorizon;

    // A. Calculate Standard Nominal Inputs
    let basicYearly = grossYearly * (basicPercent / 100);
    
    let standardEpfEmp = isEpfActive ? basicYearly * (empContribPct / 100) : 0;
    let standardEpfEmpr = isEpfActive ? basicYearly * (emprContribPct / 100) : 0;
    let vpfYearlyDesired = isVpfActive ? currentVpfMonthly * 12 : 0;

    // B. Apply EPF Strategy Logic
    let actualEpfEmp = standardEpfEmp;
    let actualEpfEmpr = standardEpfEmpr;
    let employeeSavings = 0;
    let employerSavings = 0;
    let employerTaxDrag = 0;
    
    let isEpfCapped = false;
    let isEpfMinimum = false;

    // NEW LOGIC: Statutory Minimum Strategy bypasses the 2.5L check
    if (epfStrategy === 'minimum') {
        isEpfMinimum = true;
        actualEpfEmp = isEpfActive ? 21600 : 0; // ₹1,800 * 12
        actualEpfEmpr = isEpfActive ? 21600 : 0;
        
        employeeSavings = Math.max(0, standardEpfEmp - actualEpfEmp);
        employerSavings = Math.max(0, standardEpfEmpr - actualEpfEmpr);
        
        let marginalTaxRate = getMarginalTaxRate(grossYearly);
        employerTaxDrag = employerSavings * marginalTaxRate;
        
    } else if (epfStrategy === 'smart' && standardEpfEmp > 250000) {
        // Existing Smart Cap Logic
        isEpfCapped = true; 
        actualEpfEmp = isEpfActive ? 21600 : 0; 
        actualEpfEmpr = isEpfActive ? 21600 : 0;
        
        employeeSavings = standardEpfEmp - actualEpfEmp;
        employerSavings = standardEpfEmpr - actualEpfEmpr;
        
        let marginalTaxRate = getMarginalTaxRate(grossYearly);
        employerTaxDrag = employerSavings * marginalTaxRate;
    }

    epfOverflowSeries.push(employeeSavings);
    employerTaxDragSeries.push(employerTaxDrag);

    // C. Apply VPF Strategy Logic (The 2.5L Cap)
    let actualVpf = 0;
    let vpfDivertableAmount = 0;
    const LIMIT = 250000;
    
    let totalDesiredContrib = actualEpfEmp + vpfYearlyDesired;

    if (vpfInput.strategy === 'maximize') {
        actualVpf = vpfYearlyDesired;
        vpfDivertableAmount = 0;
    } else {
        if (totalDesiredContrib > LIMIT) {
            if (actualEpfEmp >= LIMIT) {
                actualVpf = 0;
                vpfDivertableAmount = vpfYearlyDesired + (actualEpfEmp - LIMIT); 
                
                if(actualEpfEmp > LIMIT) {
                   actualVpf = 0;
                   vpfDivertableAmount = vpfYearlyDesired; 
                } else {
                    let spaceLeft = LIMIT - actualEpfEmp;
                    actualVpf = Math.min(vpfYearlyDesired, spaceLeft);
                    vpfDivertableAmount = vpfYearlyDesired - actualVpf;
                }
            } else {
                let spaceLeft = Math.max(0, LIMIT - actualEpfEmp);
                actualVpf = Math.min(vpfYearlyDesired, spaceLeft);
                vpfDivertableAmount = vpfYearlyDesired - actualVpf;
            }
        } else {
            actualVpf = vpfYearlyDesired;
            vpfDivertableAmount = 0;
        }
    }

    let isVpfDiverted = vpfDivertableAmount > 0;

    vpfOverflowSeries.push(vpfDivertableAmount);

    // D. Interest & Tax Calculation
    let totalEmpActual = actualEpfEmp + actualVpf;
    let flowTaxFree = Math.min(totalEmpActual, LIMIT);
    let flowTaxable = Math.max(0, totalEmpActual - LIMIT);

    let interestTaxFree = bucketTaxFree * rate;
    let interestTaxable = bucketTaxable * rate;
    
    let marginalTaxRate = getMarginalTaxRate(grossYearly);
    let taxOnInterest = interestTaxable * marginalTaxRate;
    let netInterestTaxable = interestTaxable - taxOnInterest;

    // E. Update Buckets
    bucketTaxFree += flowTaxFree + interestTaxFree + actualEpfEmpr;
    bucketTaxable += flowTaxable + netInterestTaxable;

    // F. Update Visual Corpus
    let totalOpening = epfCorpus + vpfCorpus;
    let totalNetInterest = interestTaxFree + netInterestTaxable;
    
    let epfInterest = 0;
    let vpfInterest = 0;
    
    if (totalOpening > 0) {
        epfInterest = totalNetInterest * (epfCorpus / totalOpening);
        vpfInterest = totalNetInterest * (vpfCorpus / totalOpening);
    } 
    
    if(totalOpening === 0) {
        let totalFlow = actualEpfEmp + actualVpf + actualEpfEmpr;
        if(totalFlow > 0) {
            epfInterest = totalNetInterest * ((actualEpfEmp + actualEpfEmpr) / totalFlow);
            vpfInterest = totalNetInterest * (actualVpf / totalFlow);
        }
    }

    epfCorpus += actualEpfEmp + actualEpfEmpr + epfInterest;
    vpfCorpus += actualVpf + vpfInterest;

    // G. Push Series Data
    let infFactor = getInfFactor(inflationRate, y);

    epfSeriesData.push({
        year: y,
        monthlyNominal: (actualEpfEmp + actualEpfEmpr) / 12,
        monthlyReal: ((actualEpfEmp + actualEpfEmpr) / 12) / infFactor,
        yearlyNominal: actualEpfEmp + actualEpfEmpr,
        yearlyReal: (actualEpfEmp + actualEpfEmpr) / infFactor,
        yearlyEmployeeNominal: actualEpfEmp, 
        corpusNominal: epfCorpus,
        corpusReal: epfCorpus / infFactor,
        isActive: isEpfActive,
        isEpfCapped: isEpfCapped, 
        isEpfMinimum: isEpfMinimum // NEW EXPORT
    });

    vpfSeriesData.push({
        year: y,
        monthlyNominal: actualVpf / 12,
        monthlyReal: (actualVpf / 12) / infFactor,
        yearlyNominal: actualVpf,
        yearlyReal: actualVpf / infFactor,
        corpusNominal: vpfCorpus,
        corpusReal: vpfCorpus / infFactor,
        isActive: isVpfActive,
        isVpfDiverted: isVpfDiverted 
    });

    if (isVpfActive) {
        currentVpfMonthly *= (1 + (vpfInput.stepUp / 100));
    }
  });

  return {
    epfSeries: epfSeriesData,
    vpfSeries: vpfSeriesData,
    vpfOverflowSeries: vpfOverflowSeries, 
    overflowSeries: vpfOverflowSeries,    
    epfOverflowSeries: epfOverflowSeries, 
    employerTaxDragSeries: employerTaxDragSeries, 
    totalEPF: epfCorpus,
    totalVPF: vpfCorpus
  };
};

/**
 * 3. INVESTMENT ENGINE (SIP / SAVINGS)
 */
export const calculateInvestment = ({
  monthlyStart,
  stepUp,
  returnRate,
  inflationRate,
  activeYears, 
  totalYears,  
  extraFlows = []
}) => {
  let corpus = 0; 
  let currentMonthly = monthlyStart;
  let monthlyRate = returnRate / 12 / 100;
  let series = [];

  for (let y = 1; y <= totalYears; y++) {
    let isActive = y <= activeYears;

    let baseYearlyFlow = 0;
    let extraYearlyFlow = extraFlows[y-1] || 0; 
    let extraMonthly = extraYearlyFlow / 12; 
    
    let isReceivingDiversion = extraYearlyFlow > 0;

    let activeMonthlyInput = isActive ? currentMonthly : 0;
    let totalMonthlyInput = activeMonthlyInput + extraMonthly;

    for (let m = 1; m <= 12; m++) {
      corpus = (corpus + totalMonthlyInput) * (1 + monthlyRate);
      if (isActive) baseYearlyFlow += currentMonthly;
    }

    let totalYearlyFlow = baseYearlyFlow + extraYearlyFlow;
    let infFactor = getInfFactor(inflationRate, y);

    series.push({
      year: y,
      monthlyNominal: totalMonthlyInput,
      monthlyReal: totalMonthlyInput / infFactor,
      yearlyNominal: totalYearlyFlow,
      yearlyReal: totalYearlyFlow / infFactor,
      corpusNominal: corpus,
      corpusReal: corpus / infFactor,
      isActive: isActive,
      isReceivingDiversion: isReceivingDiversion 
    });

    if (isActive) {
      currentMonthly *= (1 + (stepUp / 100));
    }
  }

  return {
    finalValue: corpus,
    series: series
  };
};

/**
 * 4. SWP ENGINE (RETIREMENT)
 */
export const calculateSWP = ({
  corpus,
  method, 
  val,    
  returnRate,
  inflationRate,
  years,
  ltcgRate,
  gainProp
}) => {
  let portfolio = corpus;
  let monthlyRate = returnRate / 12 / 100;
  let series = [];

  let startMonthly = method === 'swr' 
    ? (corpus * (val / 100)) / 12 
    : val;

  let currentMonthly = startMonthly;

  for (let y = 1; y <= years; y++) {
    if (y > 1) currentMonthly *= (1 + (inflationRate / 100));

    let yearlyWithdrawal = currentMonthly * 12;
    let yearlyTax = 0;

    for (let m = 1; m <= 12; m++) {
        if (portfolio > 0) {
            let taxablePortion = currentMonthly * (gainProp / 100);
            let tax = taxablePortion * (ltcgRate / 100);
            yearlyTax += tax;

            portfolio -= currentMonthly;
            portfolio *= (1 + monthlyRate);
        }
    }
    
    if (portfolio < 0) portfolio = 0;

    let infFactor = getInfFactor(inflationRate, y);

    series.push({
      year: y,
      withdrawalMonthlyNominal: currentMonthly,
      withdrawalMonthlyReal: currentMonthly / infFactor,
      
      taxNominal: yearlyTax,
      taxReal: yearlyTax / infFactor,
      
      portfolioNominal: portfolio,
      portfolioReal: portfolio / infFactor
    });

    if (portfolio <= 0) break;
  }

  return series;
};