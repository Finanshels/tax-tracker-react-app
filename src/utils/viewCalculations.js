import { jsonStorage } from './jsonStorage';

export const viewCalculations = () => {
  const calculations = jsonStorage.getCalculations();
  return calculations.map(calc => ({
    timestamp: new Date(calc.timestamp).toLocaleString(),
    email: calc.email,
    incorporationDate: calc.incorporationDate,
    financialYear: calc.financialYear,
    firstFilingPeriod: calc.firstFilingPeriod,
    filingDueDate: calc.filingDueDate
  }));
};

// Run the viewer
viewCalculations(); 