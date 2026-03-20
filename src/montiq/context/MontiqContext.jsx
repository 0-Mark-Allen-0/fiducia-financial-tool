import React, { createContext, useContext, useState, useEffect } from 'react';

const MontiqContext = createContext();

export const useMontiqData = () => useContext(MontiqContext);

export const MontiqProvider = ({ children }) => {
  // NEW: Track the absolute total corpus
  const [startingCorpus, setStartingCorpus] = useState(20000000); // Default 2 Cr

  // Percentage sliders mapping (must equal 100%)
  const [allocation, setAllocation] = useState({
    equity: 60,
    debt: 30,
    cash: 10
  });

  const [expenses, setExpenses] = useState({
    essential: 50000,      
    discretionary: 30000,  
    guaranteedIncome: 0    
  });

  const [retirementHorizon, setRetirementHorizon] = useState(30);

  const [strategies, setStrategies] = useState({
    useBucket: false,
    bucketYears: 3, 
    useGuardrails: false,
    guardrailCut: 10, 
    guardrailTrigger: -15, 
    useGlidepath: false,
    glideTargetEquity: 60,
    glideYears: 10
  });

  const [simulationResults, setSimulationResults] = useState(null);

  // HYDRATION: The Fiducia Bridge
  useEffect(() => {
    const fiduciaExport = localStorage.getItem('fiducia_export_v1');
    if (fiduciaExport) {
        try {
            const data = JSON.parse(fiduciaExport);
            
            const importedEquity = data.sipTotal || 0;
            const importedCash = data.savingsTotal || 0;
            const importedDebt = (data.epfTotal || 0) + (data.vpfTotal || 0);
            const total = importedEquity + importedCash + importedDebt;

            if (total > 0) {
                setStartingCorpus(total);
                setAllocation({
                    equity: Math.round((importedEquity / total) * 100),
                    debt: Math.round((importedDebt / total) * 100),
                    cash: Math.round((importedCash / total) * 100)
                });
            }
        } catch (e) {
            console.error("Failed to parse Fiducia export", e);
        }
    }
  }, []);

  const value = {
    startingCorpus, setStartingCorpus,
    allocation, setAllocation,
    expenses, setExpenses,
    retirementHorizon, setRetirementHorizon,
    strategies, setStrategies,
    simulationResults, setSimulationResults
  };

  return (
    <MontiqContext.Provider value={value}>
      {children}
    </MontiqContext.Provider>
  );
};