const SHEETY_API_URL = 'https://api.sheety.co/127d912da888eeee0ac3b745d225ecac/emailinfo/sheet1';

export const jsonStorage = {
  init() {
    // No initialization needed for Google Sheets
  },

  async saveCalculation(data) {
    try {
      const timestamp = new Date().toISOString();
      
      // Format the data for Google Sheets
      const sheetData = {
        sheet1: {
          timestamp: timestamp,
          phone: data.phone,
          email: data.email,
          incorporationDate: data.incorporationDate,
          financialYear: data.financialYear,
          firstFilingPeriod: data.firstFilingPeriod,
          filingDueDate: data.filingDueDate
        }
      };

      // Make API call to Sheety
      const response = await fetch(SHEETY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData)
      });

      if (!response.ok) {
        throw new Error('Failed to save to Google Sheets');
      }

      const json = await response.json();
      console.log('Saved to Google Sheets:', json.sheet1);
      return true;
    } catch (error) {
      console.error('Error saving calculation:', error);
      return false;
    }
  },

  getCalculations() {
    // This method is kept for compatibility, but now returns an empty array
    // as we're storing data in Google Sheets
    return [];
  }
}; 