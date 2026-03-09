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
 * 2. EPF & VPF ENGINE (PRO MODE - SHADOW LEDGER)
 * Handles the 2.5L Cap and Diversion Strategies.
 * Returns separate data for EPF, VPF, and the Overflow amount to be diverted.
 */
export const calculateEPF_VPF_Pro = ({
  salarySeries,   // The output from calculateSalarySeries
  basicPercent,   // Basic Pay %
  empContribPct,  // 12% usually
  emprContribPct, // 3.67% usually
  epfRate,
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

    // A. Calculate Nominal Inputs
    let basicYearly = grossYearly * (basicPercent / 100);
    
    // Mandatory EPF (Employee)
    let epfEmpYearly = basicYearly * (empContribPct / 100);
    
    // Voluntary VPF (Desired)
    let vpfYearlyDesired = currentVpfMonthly * 12;

    // Employer Share (Always stays in EPF, usually tax-free)
    let epfEmprYearly = basicYearly * (emprContribPct / 100);

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
                // Note: We can't actually divert Mandatory EPF, only VPF. 
                // But for simulation, we assume VPF is diverted fully.
                // If Mandatory EPF > 2.5L, that excess stays in EPF (taxable) effectively, 
                // but user wants to divert VPF.
                // CORRECTION: You can't divert Mandatory EPF. 
                // So if Mandatory > 2.5L, Divert = VPF. 
                // If Mandatory < 2.5L, VPF fills the gap, rest is Divert.
                
                if(epfEmpYearly > LIMIT) {
                   // Mandatory itself exceeds limit.
                   // Divert ALL VPF. 
                   actualVpf = 0;
                   divertableAmount = vpfYearlyDesired; 
                   // The excess Mandatory EPF stays in EPF (Taxable)
                } else {
                    // Mandatory is within limit. VPF fills the rest.
                    let spaceLeft = LIMIT - epfEmpYearly;
                    actualVpf = Math.min(vpfYearlyDesired, spaceLeft);
                    divertableAmount = vpfYearlyDesired - actualVpf;
                }
            } else {
                // Should be covered by logic above, but safety net:
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
    // 1. Calculate Taxable vs Tax-Free Flows for this year
    let totalEmpActual = actualEpfEmp + actualVpf;
    let flowTaxFree = Math.min(totalEmpActual, LIMIT);
    let flowTaxable = Math.max(0, totalEmpActual - LIMIT);

    // 2. Interest on existing Corpus
    // We approximate interest on opening balance for simplicity in loop
    // But we need to attribute interest to EPF vs VPF corpus separately for the tables
    
    // Global Combined Interest (For Shadow Ledger Tax)
    let interestTaxFree = bucketTaxFree * rate;
    let interestTaxable = bucketTaxable * rate;
    
    // Calculate Tax Drag
    let marginalTaxRate = getMarginalTaxRate(grossYearly); // Uses current year salary slab
    let taxOnInterest = interestTaxable * marginalTaxRate;
    let netInterestTaxable = interestTaxable - taxOnInterest;

    // D. Update Buckets (Shadow Ledger)
    bucketTaxFree += flowTaxFree + interestTaxFree + epfEmprYearly; // Employer share adds to tax free
    bucketTaxable += flowTaxable + netInterestTaxable;

    // E. Update Visual Corpus (Separate EPF / VPF)
    // We need to distribute the Net Interest proportionally
    let totalOpening = epfCorpus + vpfCorpus;
    let totalNetInterest = interestTaxFree + netInterestTaxable;
    
    // Proportional Interest Attribution
    let epfInterest = 0;
    let vpfInterest = 0;
    
    if (totalOpening > 0) {
        epfInterest = totalNetInterest * (epfCorpus / totalOpening);
        vpfInterest = totalNetInterest * (vpfCorpus / totalOpening);
    } 
    
    // If it's year 1, interest is on the mid-year flow (simplified to 0 or end-of-year)
    // For end-of-year compounding:
    if(totalOpening === 0) {
        // Simple attribution on current year flow if opening is 0
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
        corpusReal: epfCorpus / infFactor
    });

    vpfSeriesData.push({
        year: y,
        monthlyNominal: actualVpf / 12,
        monthlyReal: (actualVpf / 12) / infFactor,
        yearlyNominal: actualVpf,
        yearlyReal: actualVpf / infFactor,
        corpusNominal: vpfCorpus,
        corpusReal: vpfCorpus / infFactor
    });

    // Step Up VPF for next year
    currentVpfMonthly *= (1 + (vpfInput.stepUp / 100));
  });

  return {
    epfSeries: epfSeriesData,
    vpfSeries: vpfSeriesData,
    overflowSeries: overflowSeries, // Array of yearly amounts to add to SIP/Savings
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
  years,
  extraFlows = [] // Array of yearly lumpsums (from EPF diversion)
}) => {
  let corpus = 0; 
  let currentMonthly = monthlyStart;
  let monthlyRate = returnRate / 12 / 100;
  let series = [];

  for (let y = 1; y <= years; y++) {
    // 1. Determine Flows
    let baseYearlyFlow = 0;
    let extraYearlyFlow = extraFlows[y-1] || 0; // Get overflow for this year
    let extraMonthly = extraYearlyFlow / 12; // Distribute overflow monthly
    
    let totalMonthlyInput = currentMonthly + extraMonthly;

    // 2. Compound Monthly
    for (let m = 1; m <= 12; m++) {
      corpus = (corpus + totalMonthlyInput) * (1 + monthlyRate);
      baseYearlyFlow += currentMonthly;
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
      corpusReal: corpus / infFactor
    });

    // Step Up only the base amount
    currentMonthly *= (1 + (stepUp / 100));
  }

  return {
    finalValue: corpus,
    series: series
  };
};

/**
 * 4. SWP ENGINE (RETIREMENT)
 * Updated fields as per request
 */
export const calculateSWP = ({
  corpus,
  method, // 'swr' or 'fixed'
  val,    // Rate % or Amount ₹
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
    // Inflation Adjustment (starting year 2)
    if (y > 1) currentMonthly *= (1 + (inflationRate / 100));

    let yearlyWithdrawal = currentMonthly * 12;
    let yearlyTax = 0;

    for (let m = 1; m <= 12; m++) {
        if (portfolio > 0) {
            // Tax Calculation
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