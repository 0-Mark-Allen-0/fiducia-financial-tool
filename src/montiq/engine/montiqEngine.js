import { HISTORICAL_MARKET_DATA } from '../utils/historicalData';

const getRandomInt = (max) => Math.floor(Math.random() * max);

export const runMonteCarlo = (contextData, iterations = 1000) => {
    const { startingCorpus, allocation, expenses, strategies, retirementHorizon, retirementEvents } = contextData;

    let timelines = [];
    let successCount = 0;

    const baselineMonthlyDraw = (expenses.essential + expenses.discretionary) - expenses.guaranteedIncome;
    // THE TAX RULE: 12.5% LTCG applied to 63% of the withdrawn amount.
    const effectiveEquityTaxRate = 0.63 * 0.125; 

    for (let i = 0; i < iterations; i++) {
        let currentEquity = startingCorpus * (allocation.equity / 100);
        let currentDebt = startingCorpus * (allocation.debt / 100);
        let currentCash = startingCorpus * (allocation.cash / 100);

        let ess = expenses.essential * 12;
        let disc = expenses.discretionary * 12;
        let guar = expenses.guaranteedIncome * 12;
        
        let cumulativeInflation = 1;

        let timeline = [];
        let detailedTimeline = []; 

        for (let y = 1; y <= retirementHorizon; y++) {
            const market = HISTORICAL_MARKET_DATA[getRandomInt(HISTORICAL_MARKET_DATA.length)];
            let totalPortfolio = currentEquity + currentDebt + currentCash;

            if (totalPortfolio <= 0) {
                timeline.push(0);
                detailedTimeline.push({
                    yearLabel: `Year ${y}`, nifty: market.equity, drawNominal: 0, drawReal: 0,
                    taxPaid: 0, equity: 0, debt: 0, cash: 0
                });
                continue;
            }

            let actualDisc = disc;
            if (strategies.useGuardrails && y > 1) {
                const prevPortfolio = timeline[y - 2];
                if (prevPortfolio && ((totalPortfolio - prevPortfolio) / prevPortfolio) * 100 <= strategies.guardrailTrigger) {
                    actualDisc = disc * (1 - (strategies.guardrailCut / 100));
                }
            }

            let withdrawalNeed = Math.max(0, (ess + actualDisc) - guar);
            let totalNominalDrawThisYear = withdrawalNeed; 
            let totalTaxPaidThisYear = 0;

            // --- THE TAX-AWARE CASCADING DRAIN HELPER ---
            const drain = (amount, preference) => {
                let remaining = amount;
                
                const takeFrom = (bucket) => {
                    if (remaining <= 0) return;
                    
                    if (bucket === 'equity') {
                        // Gross up the withdrawal to cover the tax bill
                        let requiredGross = remaining / (1 - effectiveEquityTaxRate);
                        
                        if (currentEquity >= requiredGross) {
                            currentEquity -= requiredGross;
                            totalTaxPaidThisYear += (requiredGross - remaining);
                            remaining = 0;
                        } else {
                            // If equity is too low, drain it entirely and pay whatever tax is due
                            let grossTake = currentEquity;
                            let taxPaid = grossTake * effectiveEquityTaxRate;
                            let netTake = grossTake - taxPaid;
                            
                            currentEquity = 0;
                            totalTaxPaidThisYear += taxPaid;
                            remaining -= netTake;
                        }
                    } else if (bucket === 'debt') {
                        let take = Math.min(currentDebt, remaining);
                        currentDebt -= take;
                        remaining -= take;
                    } else if (bucket === 'cash') {
                        let take = Math.min(currentCash, remaining);
                        currentCash -= take;
                        remaining -= take;
                    }
                };

                if (preference === 'equity') { takeFrom('equity'); takeFrom('debt'); takeFrom('cash'); }
                else if (preference === 'debt') { takeFrom('debt'); takeFrom('cash'); takeFrom('equity'); }
                else if (preference === 'cash') { takeFrom('cash'); takeFrom('debt'); takeFrom('equity'); }
                else { 
                    let tot = currentEquity + currentDebt + currentCash;
                    if (tot > 0) {
                        let eqTargetNet = remaining * (currentEquity / tot);
                        let dbTake = Math.min(currentDebt, remaining * (currentDebt / tot));
                        let csTake = Math.min(currentCash, remaining * (currentCash / tot));
                        
                        let eqRequiredGross = eqTargetNet / (1 - effectiveEquityTaxRate);
                        let actualEqGrossTake = Math.min(currentEquity, eqRequiredGross);
                        let actualEqNetTake = actualEqGrossTake * (1 - effectiveEquityTaxRate);
                        let taxPaid = actualEqGrossTake - actualEqNetTake;

                        currentEquity -= actualEqGrossTake;
                        currentDebt -= dbTake;
                        currentCash -= csTake;
                        
                        totalTaxPaidThisYear += taxPaid;
                        remaining -= (actualEqNetTake + dbTake + csTake);
                        
                        if (remaining > 0.1) { takeFrom('cash'); takeFrom('debt'); takeFrom('equity'); }
                    }
                }
            };

            const eventsThisYear = retirementEvents.filter(e => Number(e.year) === y);
            eventsThisYear.forEach(e => {
                let inflatedCost = e.amount * cumulativeInflation;
                totalNominalDrawThisYear += inflatedCost;
                drain(inflatedCost, e.target);
            });

            if (strategies.withdrawalSequence === 'dynamic-bucket') {
                if (market.equity < 0) {
                    drain(withdrawalNeed, 'cash');
                } else {
                    drain(withdrawalNeed, 'proportional');
                    let targetCash = (ess + actualDisc - guar) * strategies.bucketYears;
                    if (currentCash < targetCash) {
                        let refill = targetCash - currentCash;
                        let growthAssets = currentEquity + currentDebt;
                        
                        if (growthAssets > 0) {
                            let eqRefillNet = refill * (currentEquity / growthAssets);
                            let dbTake = Math.min(currentDebt, refill * (currentDebt / growthAssets));
                            
                            let eqRequiredGross = eqRefillNet / (1 - effectiveEquityTaxRate);
                            let actualEqGrossTake = Math.min(currentEquity, eqRequiredGross);
                            let actualEqNetTake = actualEqGrossTake * (1 - effectiveEquityTaxRate);
                            let taxPaid = actualEqGrossTake - actualEqNetTake;

                            currentEquity -= actualEqGrossTake;
                            currentDebt -= dbTake;
                            currentCash += (actualEqNetTake + dbTake);
                            totalTaxPaidThisYear += taxPaid;
                        }
                    }
                }
            } else if (strategies.withdrawalSequence === 'equity-first') { drain(withdrawalNeed, 'equity'); } 
              else if (strategies.withdrawalSequence === 'debt-first') { drain(withdrawalNeed, 'debt'); } 
              else { drain(withdrawalNeed, 'proportional'); }

            currentEquity = Math.max(0, currentEquity);
            currentDebt = Math.max(0, currentDebt);
            currentCash = Math.max(0, currentCash);

            if (strategies.useGlidepath && strategies.withdrawalSequence === 'proportional' && y <= strategies.glideYears) {
                let step = (strategies.glideTargetEquity - allocation.equity) / strategies.glideYears;
                let newTargetEq = allocation.equity + (step * y);
                
                let currentTotal = currentEquity + currentDebt + currentCash;
                currentEquity = currentTotal * (newTargetEq / 100);
                currentDebt = currentTotal * ((100 - newTargetEq - allocation.cash) / 100);
            }

            let eqReturn = market.equity / 100;
            if (eqReturn > 0) eqReturn *= 0.875; 
            currentEquity *= (1 + eqReturn);

            let dbReturn = market.debt / 100;
            if (dbReturn > 0) dbReturn *= 0.70;
            currentDebt *= (1 + dbReturn);

            currentCash *= (1 + (0.06 * 0.70));

            totalPortfolio = currentEquity + currentDebt + currentCash;
            timeline.push(totalPortfolio > 0 ? totalPortfolio : 0);

            detailedTimeline.push({
                yearLabel: `Year ${y}`,
                nifty: market.equity,
                drawNominal: totalNominalDrawThisYear / 12, 
                drawReal: baselineMonthlyDraw, 
                taxPaid: totalTaxPaidThisYear, // NEW EXPORT
                equity: currentEquity,
                debt: currentDebt,
                cash: currentCash
            });

            let inf = market.inflation / 100;
            cumulativeInflation *= (1 + inf);
            ess *= (1 + inf);
            disc *= (1 + inf);
            guar *= (1 + inf);
        }

        if (timeline[retirementHorizon - 1] > 0) successCount++;
        timelines.push({ finalTotal: timeline[retirementHorizon - 1], rawArray: timeline, details: detailedTimeline });
    }

    timelines.sort((a, b) => a.finalTotal - b.finalTotal);

    const medianRunIndex = Math.floor(iterations * 0.50);
    const medianRunDetails = timelines[medianRunIndex].details;

    let percentiles = [];
    for (let y = 0; y < retirementHorizon; y++) {
        let yearValues = timelines.map(t => t.rawArray[y]).sort((a, b) => a - b);
        percentiles.push({
            yearLabel: `Year ${y + 1}`,
            p10: yearValues[Math.floor(iterations * 0.10)], 
            p50: yearValues[Math.floor(iterations * 0.50)], 
            p90: yearValues[Math.floor(iterations * 0.90)]  
        });
    }

    return {
        successRate: ((successCount / iterations) * 100).toFixed(1),
        percentiles,
        medianRunDetails 
    };
};