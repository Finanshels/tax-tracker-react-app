import React from 'react';
import ReactDOM from 'react-dom/client';
import TaxFilingTracker from './components/TaxFilingTracker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <TaxFilingTracker />
    </div>
  </React.StrictMode>
); 