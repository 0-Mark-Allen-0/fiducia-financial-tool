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
      netYearly: netYearly, // Post-Tax Salary
      
      // I-A Values
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
 * Returns separate data for EPF, VPF, and the Overflow amount to be diverted.
 */
export const calculateEPF_VPF_Pro = ({
  salarySeries,   // The output from calculateSalarySeries
  basicPercent,   // Basic Pay %
  empContribPct,  // 12% usually
  emprContribPct, // 3.67% usually
  epfRate,
  epfHorizon,     // NEW: Contribution phase for EPF
  vpfHorizon,     // NEW: Contribution phase for VPF
  vpfInput,       // { amount, stepUp, strategy }
  inflationRate
}) => {
  
  // Totals
  let epfCorpus = 0; // Employer + Employee (Mandatory)
  let vpfCorpus = 0; // Voluntary only
  
  // Shadow Ledger Buckets (Combined EPF+VPF for Tax Calculation)
  let bucketTaxFree = 0; 
  let bucketTaxable = 0;

  // Overflow Series (Amount to divert to SIP/Savings)
  let overflowSeries = []; 
  
  // Detailed Series for Tables
  let epfSeriesData = [];
  let vpfSeriesData = [];

  let currentVpfMonthly = vpfInput.amount;
  let rate = epfRate / 100;

  salarySeries.forEach((yearData, index) => {
    const y = yearData.year;
    const grossYearly = yearData.grossYearly;

    // Determine if we are still actively contributing
    const isEpfActive = y <= epfHorizon;
    const isVpfActive = y <= vpfHorizon;

    // A. Calculate Nominal Inputs
    let basicYearly = grossYearly * (basicPercent / 100);
    
    // Mandatory EPF (Employee)
    let epfEmpYearly = isEpfActive ? basicYearly * (empContribPct / 100) : 0;
    
    // Voluntary VPF (Desired)
    let vpfYearlyDesired = isVpfActive ? currentVpfMonthly * 12 : 0;

    // Employer Share (Always stays in EPF, usually tax-free)
    let epfEmprYearly = isEpfActive ? basicYearly * (emprContribPct / 100) : 0;

    // B. Apply Strategy Logic (The 2.5L Cap)
    let actualEpfEmp = epfEmpYearly;
    let actualVpf = 0;
    let divertableAmount = 0;

    // Strategy Check
    // 2.5L Limit applies to (EPF Employee + VPF)
    const LIMIT = 250000;
    let totalDesiredContrib = epfEmpYearly + vpfYearlyDesired;

    if (vpfInput.strategy === 'maximize') {
        // Strategy: Maximize Corpus (Ignore Tax)
        actualVpf = vpfYearlyDesired;
        divertableAmount = 0;
    } else {
        // Strategy: Cap & Divert
        if (totalDesiredContrib > LIMIT) {
            // Priority 1: Mandatory EPF fills the limit first
            if (epfEmpYearly >= LIMIT) {
                actualVpf = 0;
                divertableAmount = vpfYearlyDesired + (epfEmpYearly - LIMIT); 
                
                if(epfEmpYearly > LIMIT) {
                   // Mandatory itself exceeds limit. Divert ALL VPF. 
                   actualVpf = 0;
                   divertableAmount = vpfYearlyDesired; 
                } else {
                    // Mandatory is within limit. VPF fills the rest.
                    let spaceLeft = LIMIT - epfEmpYearly;
                    actualVpf = Math.min(vpfYearlyDesired, spaceLeft);
                    divertableAmount = vpfYearlyDesired - actualVpf;
                }
            } else {
                let spaceLeft = Math.max(0, LIMIT - epfEmpYearly);
                actualVpf = Math.min(vpfYearlyDesired, spaceLeft);
                divertableAmount = vpfYearlyDesired - actualVpf;
            }
        } else {
            // Under limit, no diversion
            actualVpf = vpfYearlyDesired;
            divertableAmount = 0;
        }
    }

    overflowSeries.push(divertableAmount);

    // C. Interest & Tax Calculation (Shadow Ledger)
    let totalEmpActual = actualEpfEmp + actualVpf;
    let flowTaxFree = Math.min(totalEmpActual, LIMIT);
    let flowTaxable = Math.max(0, totalEmpActual - LIMIT);

    // Interest on existing Corpus
    let interestTaxFree = bucketTaxFree * rate;
    let interestTaxable = bucketTaxable * rate;
    
    // Calculate Tax Drag
    let marginalTaxRate = getMarginalTaxRate(grossYearly);
    let taxOnInterest = interestTaxable * marginalTaxRate;
    let netInterestTaxable = interestTaxable - taxOnInterest;

    // D. Update Buckets (Shadow Ledger)
    bucketTaxFree += flowTaxFree + interestTaxFree + epfEmprYearly;
    bucketTaxable += flowTaxable + netInterestTaxable;

    // E. Update Visual Corpus (Separate EPF / VPF)
    let totalOpening = epfCorpus + vpfCorpus;
    let totalNetInterest = interestTaxFree + netInterestTaxable;
    
    let epfInterest = 0;
    let vpfInterest = 0;
    
    if (totalOpening > 0) {
        epfInterest = totalNetInterest * (epfCorpus / totalOpening);
        vpfInterest = totalNetInterest * (vpfCorpus / totalOpening);
    } 
    
    // Year 1 / Empty Corpus interest attribution
    if(totalOpening === 0) {
        let totalFlow = actualEpfEmp + actualVpf + epfEmprYearly;
        if(totalFlow > 0) {
            epfInterest = totalNetInterest * ((actualEpfEmp + epfEmprYearly) / totalFlow);
            vpfInterest = totalNetInterest * (actualVpf / totalFlow);
        }
    }

    epfCorpus += actualEpfEmp + epfEmprYearly + epfInterest;
    vpfCorpus += actualVpf + vpfInterest;

    // F. Push Series Data
    let infFactor = getInfFactor(inflationRate, y);

    epfSeriesData.push({
        year: y,
        monthlyNominal: (actualEpfEmp + epfEmprYearly) / 12,
        monthlyReal: ((actualEpfEmp + epfEmprYearly) / 12) / infFactor,
        yearlyNominal: actualEpfEmp + epfEmprYearly,
        yearlyReal: (actualEpfEmp + epfEmprYearly) / infFactor,
        corpusNominal: epfCorpus,
        corpusReal: epfCorpus / infFactor,
        isActive: isEpfActive // NEW: UI visual marker flag
    });

    vpfSeriesData.push({
        year: y,
        monthlyNominal: actualVpf / 12,
        monthlyReal: (actualVpf / 12) / infFactor,
        yearlyNominal: actualVpf,
        yearlyReal: actualVpf / infFactor,
        corpusNominal: vpfCorpus,
        corpusReal: vpfCorpus / infFactor,
        isActive: isVpfActive // NEW: UI visual marker flag
    });

    // Step Up VPF only if we are actively contributing
    if (isVpfActive) {
        currentVpfMonthly *= (1 + (vpfInput.stepUp / 100));
    }
  });

  return {
    epfSeries: epfSeriesData,
    vpfSeries: vpfSeriesData,
    overflowSeries: overflowSeries, 
    totalEPF: epfCorpus,
    totalVPF: vpfCorpus
  };
};

/**
 * 3. INVESTMENT ENGINE (SIP / SAVINGS)
 * Accepts 'extraFlows' (Yearly Overflow from EPF)
 */
export const calculateInvestment = ({
  monthlyStart,
  stepUp,
  returnRate,
  inflationRate,
  activeYears, // NEW: The contribution phase
  totalYears,  // NEW: The master projection horizon
  extraFlows = []
}) => {
  let corpus = 0; 
  let currentMonthly = monthlyStart;
  let monthlyRate = returnRate / 12 / 100;
  let series = [];

  for (let y = 1; y <= totalYears; y++) {
    // 1. Determine Flows
    let isActive = y <= activeYears;

    let baseYearlyFlow = 0;
    let extraYearlyFlow = extraFlows[y-1] || 0; 
    let extraMonthly = extraYearlyFlow / 12; 
    
    // Only deposit user's input if in the active phase
    let activeMonthlyInput = isActive ? currentMonthly : 0;
    let totalMonthlyInput = activeMonthlyInput + extraMonthly;

    // 2. Compound Monthly
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
      isActive: isActive // NEW: UI visual marker flag
    });

    // Step Up only the base amount and only if actively contributing
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
 * Unchanged as it operates purely on the retirement horizon.
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