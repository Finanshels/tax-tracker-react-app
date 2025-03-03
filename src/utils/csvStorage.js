// Local CSV storage utility

const LOCAL_STORAGE_KEY = 'tax_tracker_emails';

export const csvStorage = {
  // Initialize storage
  init() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    }
  },

  // Save email
  saveEmail(email) {
    try {
      const emails = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const exists = emails.some(entry => entry.email === email);
      
      if (!exists) {
        emails.push({
          email,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emails));
      }
      
      return !exists;
    } catch (error) {
      console.error('Error saving email:', error);
      return false;
    }
  },

  // Check if email exists
  checkEmail(email) {
    try {
      const emails = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      return emails.some(entry => entry.email === email);
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  },

  // Export to CSV
  exportToCSV() {
    try {
      const emails = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const csvContent = [
        'email,createdAt',
        ...emails.map(entry => `${entry.email},${entry.createdAt}`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'tax_tracker_emails.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  }
}; 