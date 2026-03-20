import { HISTORICAL_MARKET_DATA } from '../utils/historicalData';

const getRandomInt = (max) => Math.floor(Math.random() * max);

export const runMonteCarlo = (contextData, iterations = 1000) => {
    const { startingCorpus, allocation, expenses, strategies, retirementHorizon } = contextData;

    let timelines = [];
    let successCount = 0;

    // The baseline purchasing power the user expects today
    const baselineMonthlyDraw = (expenses.essential + expenses.discretionary) - expenses.guaranteedIncome;

    for (let i = 0; i < iterations; i++) {
        let currentEquity = startingCorpus * (allocation.equity / 100);
        let currentDebt = startingCorpus * (allocation.debt / 100);
        let currentCash = startingCorpus * (allocation.cash / 100);

        let ess = expenses.essential * 12;
        let disc = expenses.discretionary * 12;
        let guar = expenses.guaranteedIncome * 12;

        let timeline = [];
        let detailedTimeline = []; // NEW: Array to hold granular table data

        for (let y = 1; y <= retirementHorizon; y++) {
            const market = HISTORICAL_MARKET_DATA[getRandomInt(HISTORICAL_MARKET_DATA.length)];
            let totalPortfolio = currentEquity + currentDebt + currentCash;

            if (totalPortfolio <= 0) {
                timeline.push(0);
                detailedTimeline.push({
                    yearLabel: `Year ${y}`,
                    nifty: market.equity,
                    drawNominal: 0,
                    drawReal: 0,
                    equity: 0,
                    debt: 0,
                    cash: 0
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

            if (strategies.useBucket) {
                if (market.equity < 0) {
                    if (currentCash >= withdrawalNeed) {
                        currentCash -= withdrawalNeed;
                    } else {
                        let rem = withdrawalNeed - currentCash;
                        currentCash = 0;
                        if (currentDebt >= rem) {
                            currentDebt -= rem;
                        } else {
                            rem -= currentDebt;
                            currentDebt = 0;
                            currentEquity -= rem; 
                        }
                    }
                } else {
                    let targetCash = (ess + actualDisc - guar) * strategies.bucketYears;
                    currentEquity -= withdrawalNeed;
                    
                    if (currentCash < targetCash) {
                        let refillAmount = targetCash - currentCash;
                        if (currentEquity > refillAmount) {
                            currentEquity -= refillAmount;
                            currentCash += refillAmount;
                        }
                    }
                }
            } else {
                currentEquity -= withdrawalNeed * (allocation.equity / 100);
                currentDebt -= withdrawalNeed * (allocation.debt / 100);
                currentCash -= withdrawalNeed * (allocation.cash / 100);
            }

            currentEquity = Math.max(0, currentEquity);
            currentDebt = Math.max(0, currentDebt);
            currentCash = Math.max(0, currentCash);

            if (strategies.useGlidepath && !strategies.useBucket && y <= strategies.glideYears) {
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

            // NEW: Record granular data for the table
            detailedTimeline.push({
                yearLabel: `Year ${y}`,
                nifty: market.equity,
                drawNominal: withdrawalNeed / 12,
                drawReal: baselineMonthlyDraw, // The purchasing power they actually felt
                equity: currentEquity,
                debt: currentDebt,
                cash: currentCash
            });

            let inf = market.inflation / 100;
            ess *= (1 + inf);
            disc *= (1 + inf);
            guar *= (1 + inf);
        }

        if (timeline[retirementHorizon - 1] > 0) {
            successCount++;
        }
        
        // Push the full object containing both the simple array (for chart) and detailed array (for table)
        timelines.push({ finalTotal: timeline[retirementHorizon - 1], rawArray: timeline, details: detailedTimeline });
    }

    // Sort all timelines by their final portfolio value to find the true percentiles
    timelines.sort((a, b) => a.finalTotal - b.finalTotal);

    // Extract the specific timeline that represents the 50th percentile (Median)
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
        medianRunDetails // NEW: Exporting the representative table data
    };
};