import { calculateNewRegimeTax, getMarginalTaxRate } from './tax';

/**
 * Helper: Calculate Inflation Factor
 */
const getInfFactor = (rate, year) => Math.pow(1 + (rate / 100), year);

/**
 * 1. SALARY & TAX ENGINE
 * Projects Gross Salary, Calculates Tax, and determines Net Income.
 * UPGRADE: Now handles Spousal Multiplier by separating incomes for accurate legal tax calculation.
 */
export const calculateSalarySeries = ({
  startSalary, // Monthly Gross
  hike,
  years,
  inflationRate,
  // NEW SPOUSAL PARAMS
  isSpouseEnabled, 
  spousalMultiplier, 
  spousalStartYear
}) => {
  let currentMonthly = startSalary;
  let series = [];

  for (let y = 1; y <= years; y++) {
    // Determine if spouse is active this year
    let activeMultiplier = (isSpouseEnabled && y >= spousalStartYear) ? spousalMultiplier : 1;
    let spouseFraction = activeMultiplier - 1;

    // Separate incomes to prevent joint-tax bracket penalties (India taxes individuals, not households)
    let primaryGrossYearly = currentMonthly * 12;
    let spouseGrossYearly = primaryGrossYearly * spouseFraction;

    // Calculate individual taxes legally under the New Regime
    let primaryTax = calculateNewRegimeTax(primaryGrossYearly);
    let spouseTax = calculateNewRegimeTax(spouseGrossYearly);

    // Combine Household Income
    let grossYearly = primaryGrossYearly + spouseGrossYearly;
    let taxYearly = primaryTax + spouseTax;
    let netYearly = grossYearly - taxYearly;
    let totalMonthlyGross = grossYearly / 12;
    
    let infFactor = getInfFactor(inflationRate, y);

    series.push({
      year: y,
      monthlyGross: totalMonthlyGross,
      grossYearly: grossYearly,
      taxYearly: taxYearly,
      netYearly: netYearly, 
      monthlyGrossReal: totalMonthlyGross / infFactor,
      netYearlyReal: netYearly / infFactor
    });

    currentMonthly *= (1 + (hike / 100));
  }

  return series;
};

/**
 * 2. EPF & VPF ENGINE (PRO MODE - SHADOW Ledger)
 * Handles the 2.5L Cap and Diversion Strategies.
 * UPGRADE: Scales contributions dynamically if a spouse is enabled.
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
  inflationRate,
  // NEW SPOUSAL PARAMS
  isSpouseEnabled, 
  spousalMultiplier, 
  spousalStartYear
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
    const isEpfActive = y <= epfHorizon;
    const isVpfActive = y <= vpfHorizon;

    // To evaluate the standard bounds accurately, we must reverse the active multiplier 
    // to find the primary gross. Otherwise, the engine thinks a single person makes the household income.
    let activeMultiplier = (isSpouseEnabled && y >= spousalStartYear) ? spousalMultiplier : 1;
    const primaryGrossYearly = yearData.grossYearly / activeMultiplier;

    // A. Calculate Standard Nominal Inputs (Based on Primary Income)
    let basicYearly = primaryGrossYearly * (basicPercent / 100);
    
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

    // Statutory Minimum Strategy bypasses the 2.5L check
    if (epfStrategy === 'minimum') {
        isEpfMinimum = true;
        actualEpfEmp = isEpfActive ? 21600 : 0; // ₹1,800 * 12
        actualEpfEmpr = isEpfActive ? 21600 : 0;
        
        employeeSavings = Math.max(0, standardEpfEmp - actualEpfEmp);
        employerSavings = Math.max(0, standardEpfEmpr - actualEpfEmpr);
        
        let marginalTaxRate = getMarginalTaxRate(primaryGrossYearly);
        employerTaxDrag = employerSavings * marginalTaxRate;
        
    } else if (epfStrategy === 'smart' && standardEpfEmp > 250000) {
        // Existing Smart Cap Logic
        isEpfCapped = true; 
        actualEpfEmp = isEpfActive ? 21600 : 0; 
        actualEpfEmpr = isEpfActive ? 21600 : 0;
        
        employeeSavings = standardEpfEmp - actualEpfEmp;
        employerSavings = standardEpfEmpr - actualEpfEmpr;
        
        let marginalTaxRate = getMarginalTaxRate(primaryGrossYearly);
        employerTaxDrag = employerSavings * marginalTaxRate;
    }

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

    // D. Base Flow Bucketing
    let totalEmpActual = actualEpfEmp + actualVpf;
    let flowTaxFree = Math.min(totalEmpActual, LIMIT);
    let flowTaxable = Math.max(0, totalEmpActual - LIMIT);

    // --- SPOUSAL SCALING MAGIC ---
    // Now that the legal logic is resolved, multiply the actual flows and deltas by the household multiplier
    actualEpfEmp *= activeMultiplier;
    actualEpfEmpr *= activeMultiplier;
    employeeSavings *= activeMultiplier;
    employerTaxDrag *= activeMultiplier;
    actualVpf *= activeMultiplier;
    vpfDivertableAmount *= activeMultiplier;
    flowTaxFree *= activeMultiplier;
    flowTaxable *= activeMultiplier;

    epfOverflowSeries.push(employeeSavings);
    employerTaxDragSeries.push(employerTaxDrag);
    vpfOverflowSeries.push(vpfDivertableAmount);

    // E. Interest & Tax Calculation
    let interestTaxFree = bucketTaxFree * rate;
    let interestTaxable = bucketTaxable * rate;
    
    let marginalTaxRate = getMarginalTaxRate(primaryGrossYearly);
    let taxOnInterest = interestTaxable * marginalTaxRate;
    let netInterestTaxable = interestTaxable - taxOnInterest;

    // F. Update Buckets
    bucketTaxFree += flowTaxFree + interestTaxFree + actualEpfEmpr;
    bucketTaxable += flowTaxable + netInterestTaxable;

    // G. Update Visual Corpus
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

    // H. Push Series Data
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
        isEpfMinimum: isEpfMinimum
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
 * UPGRADE: Dynamically calculates Marginal Tax vs LTCG Drag for the Safety Net.
 */
export const calculateInvestment = ({
  monthlyStart, stepUp, returnRate, inflationRate, activeYears, totalYears,  
  extraFlows = [], isSpouseEnabled, spousalMultiplier, spousalStartYear,
  isProMode = false,
  isSavings = false,
  savingsTaxSplit = 50,
  salarySeries = []
}) => {
  let corpus = 0; 
  let corpusGross = 0; // Shadow ledger to track what you WOULD have made without taxes
  let currentMonthly = monthlyStart;
  let series = [];

  for (let y = 1; y <= totalYears; y++) {
    let isActive = y <= activeYears;
    let activeMultiplier = (isSpouseEnabled && y >= spousalStartYear) ? spousalMultiplier : 1;

    let baseYearlyFlow = 0;
    let extraYearlyFlow = extraFlows[y-1] || 0; 
    
    let diversionInflow = Math.max(0, extraYearlyFlow);
    let shockOutflow = Math.min(0, extraYearlyFlow); 
    
    let isReceivingDiversion = diversionInflow > 0;
    let activeMonthlyInput = isActive ? (currentMonthly * activeMultiplier) : 0;
    let totalMonthlyInput = activeMonthlyInput + (diversionInflow / 12);

    // --- NEW: THE TAX DRAG CALCULATION ---
    let grossAnnualRate = returnRate / 100;
    let netAnnualRate = grossAnnualRate;
    let marginalRate = 0;

    // Only apply the drag to the Savings bucket in Pro Mode
    if (isProMode && isSavings && salarySeries[y-1]) {
        // Find marginal tax bracket based on current primary salary
        const primaryGrossYearly = salarySeries[y-1].grossYearly / activeMultiplier;
        marginalRate = getMarginalTaxRate(primaryGrossYearly);

        let arbPercentage = savingsTaxSplit / 100;
        let fdPercentage = 1 - arbPercentage;

        // Apply Slab to FD, Apply 12.5% LTCG to Arbitrage
        let fdNetReturn = grossAnnualRate * (1 - marginalRate);
        let arbNetReturn = grossAnnualRate * (1 - 0.125); 

        netAnnualRate = (fdPercentage * fdNetReturn) + (arbPercentage * arbNetReturn);
    }

    let monthlyRateNet = netAnnualRate / 12;
    let monthlyRateGross = grossAnnualRate / 12;

    for (let m = 1; m <= 12; m++) {
      // Compound the real taxable corpus
      corpus = (corpus + totalMonthlyInput) * (1 + monthlyRateNet);
      // Compound the shadow gross corpus to track tax losses
      corpusGross = (corpusGross + totalMonthlyInput) * (1 + monthlyRateGross);
      if (isActive) baseYearlyFlow += (currentMonthly * activeMultiplier);
    }

    corpus += shockOutflow; 
    corpusGross += shockOutflow;
    
    let shortfall = 0;
    let isBankrupt = false;
    
    if (corpus < 0) {
        isBankrupt = true;
        shortfall = Math.abs(corpus); 
        corpus = 0; 
        corpusGross = 0;
    }

    let totalYearlyFlow = baseYearlyFlow + diversionInflow;
    let infFactor = getInfFactor(inflationRate, y);
    
    // The difference between the shadow ledger and real ledger is exactly the tax lost
    let taxDragNominal = Math.max(0, corpusGross - corpus);

    series.push({
      year: y,
      monthlyNominal: totalMonthlyInput,
      monthlyReal: totalMonthlyInput / infFactor,
      yearlyNominal: totalYearlyFlow, 
      yearlyReal: totalYearlyFlow / infFactor,
      corpusNominal: corpus,
      corpusReal: corpus / infFactor,
      taxDragNominal: taxDragNominal, // NEW EXPORT
      isActive: isActive,
      isReceivingDiversion: isReceivingDiversion,
      isBankrupt: isBankrupt,
      shortfallNominal: shortfall
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
 * UPGRADED: Now uses a Proportional Multi-Bucket strategy to isolate LTCG tax solely to the Equity bucket.
 */
export const calculateSWP = ({
  corpus,
  eqPct = 1,
  dbPct = 0,
  csPct = 0,
  method, 
  val,    
  returnRate,
  inflationRate,
  years,
  ltcgRate,
  gainProp
}) => {
  let currentEq = corpus * eqPct;
  let currentDb = corpus * dbPct;
  let currentCs = corpus * csPct;
  
  let monthlyRate = returnRate / 12 / 100;
  let series = [];

  let startMonthly = method === 'swr' 
    ? (corpus * (val / 100)) / 12 
    : val;

  let currentMonthly = startMonthly;
  
  // The effective tax rate applied only to equity (e.g., 63% profit * 12.5% LTCG)
  let effectiveTaxRate = (gainProp / 100) * (ltcgRate / 100);

  for (let y = 1; y <= years; y++) {
    if (y > 1) currentMonthly *= (1 + (inflationRate / 100));

    let yearlyTax = 0;

    for (let m = 1; m <= 12; m++) {
        let remaining = currentMonthly;
        let tot = currentEq + currentDb + currentCs;
        
        if (tot > 0) {
            // Calculate Proportional Drain
            let eqTargetNet = remaining * (currentEq / tot);
            let dbTake = Math.min(currentDb, remaining * (currentDb / tot));
            let csTake = Math.min(currentCs, remaining * (currentCs / tot));

            // Gross up the Equity take to cover the LTCG tax
            let eqRequiredGross = eqTargetNet / (1 - effectiveTaxRate);
            let actualEqGrossTake = Math.min(currentEq, eqRequiredGross);
            let actualEqNetTake = actualEqGrossTake * (1 - effectiveTaxRate);
            let taxPaid = actualEqGrossTake - actualEqNetTake;

            currentEq -= actualEqGrossTake;
            currentDb -= dbTake;
            currentCs -= csTake;
            
            yearlyTax += taxPaid;
            remaining -= (actualEqNetTake + dbTake + csTake);
            
            // Fallback (If buckets run dry mid-month, drain whatever is left sequentially)
            const takeFrom = (bucket) => {
                if (remaining <= 0.01) return;
                if (bucket === 'cash') {
                    let take = Math.min(currentCs, remaining); currentCs -= take; remaining -= take;
                } else if (bucket === 'debt') {
                    let take = Math.min(currentDb, remaining); currentDb -= take; remaining -= take;
                } else if (bucket === 'equity') {
                    let requiredGross = remaining / (1 - effectiveTaxRate);
                    let actualGross = Math.min(currentEq, requiredGross);
                    let actualNet = actualGross * (1 - effectiveTaxRate);
                    currentEq -= actualGross;
                    yearlyTax += (actualGross - actualNet);
                    remaining -= actualNet;
                }
            };
            
            takeFrom('cash'); takeFrom('debt'); takeFrom('equity');
            
            // Apply monthly growth to the remaining balances
            currentEq *= (1 + monthlyRate);
            currentDb *= (1 + monthlyRate);
            currentCs *= (1 + monthlyRate);
        }
    }
    
    // Floor check
    currentEq = Math.max(0, currentEq);
    currentDb = Math.max(0, currentDb);
    currentCs = Math.max(0, currentCs);
    
    let portfolio = currentEq + currentDb + currentCs;
    let infFactor = getInfFactor(inflationRate, y);

    series.push({
      year: y,
      withdrawalMonthlyNominal: currentMonthly,
      withdrawalMonthlyReal: currentMonthly / infFactor,
      taxNominal: yearlyTax,
      taxReal: yearlyTax / infFactor,
      portfolioNominal: portfolio,
      portfolioReal: portfolio / infFactor,
      eqNominal: currentEq, // Exported for the Data Table
      dbNominal: currentDb, // Exported for the Data Table
      csNominal: currentCs  // Exported for the Data Table
    });

    if (portfolio <= 0) break;
  }

  return series;
};