import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { jsonStorage } from '../utils/jsonStorage';

// Constants
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FINANCIAL_YEAR_OPTIONS = [
  'January to December', 'February to January', 'March to February',
  'April to March', 'May to April', 'June to May', 'July to June',
  'August to July', 'September to August', 'October to September',
  'November to October', 'December to November'
];

const BRAND_COLORS = {
  primary: '#F47B20',
  secondary: '#000000',
  background: '#F5F7FA',
  accent: '#E65100',
};

const TaxFilingTracker = () => {
  const [incorporationDate, setIncorporationDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [financialYear, setFinancialYear] = useState(FINANCIAL_YEAR_OPTIONS[0]);
  const [firstFilingPeriod, setFirstFilingPeriod] = useState('');
  const [filingDueDate, setFilingDueDate] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [customMonth, setCustomMonth] = useState(new Date().getMonth());
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const years = Array.from({ length: 21 }, (_, i) => 2010 + i);
  const getMonthName = (monthNumber) => MONTHS[monthNumber];
  const getMonthNumber = (monthName) => MONTHS.indexOf(monthName);

  useEffect(() => {
    jsonStorage.init();
  }, []);

  const calculateFilingDetails = () => {
    if (!email || !isEmailValid) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!incorporationDate) {
      if (showResults) setShowResults(false);
      return;
    }

    const incorpDate = new Date(incorporationDate);
    const incorpMonth = incorpDate.getMonth();
    const incorpYear = incorpDate.getFullYear();
    
    const fyParts = financialYear.split(' to ');
    const fyStartMonth = getMonthNumber(fyParts[0]);
    const fyEndMonth = getMonthNumber(fyParts[1]);
    const taxImplementationDate = new Date(2023, 5, 1);
    
    let firstFilingStartDate;
    let firstFilingEndDate;
    
    if (incorpYear === 2023 && incorpMonth === 5) {
      let nextFYEndYear = incorpYear;
      let nextFYEndMonth = fyEndMonth;
      
      if (fyEndMonth < fyStartMonth) {
        if (fyStartMonth > incorpMonth) {
          nextFYEndYear = incorpYear + 1;
        } else {
          nextFYEndYear = incorpYear + 1;
        }
      } else if (fyEndMonth < incorpMonth) {
        nextFYEndYear = incorpYear + 1;
      }
      
      const nextFYEndDate = new Date(nextFYEndYear, nextFYEndMonth, 
        new Date(nextFYEndYear, nextFYEndMonth + 1, 0).getDate()
      );
      
      const monthsDiff = (nextFYEndDate.getFullYear() - incorpDate.getFullYear()) * 12 + 
                         (nextFYEndDate.getMonth() - incorpDate.getMonth());
      
      if (monthsDiff >= 6) {
        firstFilingStartDate = new Date(incorpDate);
        firstFilingEndDate = nextFYEndDate;
      } else {
        firstFilingStartDate = new Date(incorpDate);
        let nextToNextFYEndYear = nextFYEndYear + 1;
        firstFilingEndDate = new Date(nextToNextFYEndYear, nextFYEndMonth, 
          new Date(nextToNextFYEndYear, nextFYEndMonth + 1, 0).getDate()
        );
      }
    } else if (incorpDate < taxImplementationDate) {
      let nextFYStartYear = fyStartMonth < 5 ? 2025 : 2024;
      firstFilingStartDate = new Date(nextFYStartYear, fyStartMonth, 1);
      let fyEndYear = nextFYStartYear + (fyEndMonth < fyStartMonth ? 1 : 0);
      firstFilingEndDate = new Date(fyEndYear, fyEndMonth, 
        new Date(fyEndYear, fyEndMonth + 1, 0).getDate()
      );
    } else {
      firstFilingStartDate = new Date(incorpDate);
      let nextFYEndYear = incorpYear;
      let nextFYEndMonth = fyEndMonth;
      
      if (fyEndMonth < fyStartMonth) {
        nextFYEndYear = incorpMonth >= fyStartMonth ? incorpYear + 1 : incorpYear;
      } else {
        nextFYEndYear = incorpMonth > fyEndMonth ? incorpYear + 1 : incorpYear;
      }
      
      const nextFYEndDate = new Date(nextFYEndYear, nextFYEndMonth, 
        new Date(nextFYEndYear, nextFYEndMonth + 1, 0).getDate()
      );
      
      const monthsDiff = (nextFYEndDate.getFullYear() - incorpDate.getFullYear()) * 12 + 
                         (nextFYEndDate.getMonth() - incorpDate.getMonth());
      
      if (monthsDiff >= 6) {
        firstFilingEndDate = nextFYEndDate;
      } else {
        let nextToNextFYEndYear = nextFYEndYear + 1;
        firstFilingEndDate = new Date(nextToNextFYEndYear, nextFYEndMonth, 
          new Date(nextToNextFYEndYear, nextFYEndMonth + 1, 0).getDate()
        );
      }
    }

    const endMonth = firstFilingEndDate.getMonth();
    const endYear = firstFilingEndDate.getFullYear();
    const dueMonth = (endMonth + 9) % 12;
    const dueYear = endYear + Math.floor((endMonth + 9) / 12);
    const filingDueDateValue = new Date(dueYear, dueMonth, 1);
    
    const formatDate = (date) => `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
    const formattedFirstFilingPeriod = `${formatDate(firstFilingStartDate)} to ${formatDate(firstFilingEndDate)}`;
    const formattedFilingDueDate = formatDate(filingDueDateValue);

    // Update UI immediately
    setFirstFilingPeriod(formattedFirstFilingPeriod);
    setFilingDueDate(formattedFilingDueDate);
    setShowResults(true);

    // Save calculation results to Google Sheets in the background
    const calculationData = {
      email,
      incorporationDate,
      financialYear,
      firstFilingPeriod: formattedFirstFilingPeriod,
      filingDueDate: formattedFilingDueDate,
      calculationDetails: {
        incorporationMonth: incorpMonth,
        incorporationYear: incorpYear,
        fyStartMonth,
        fyEndMonth,
        firstFilingStartDate: firstFilingStartDate.toISOString(),
        firstFilingEndDate: firstFilingEndDate.toISOString(),
        filingDueDate: filingDueDateValue.toISOString()
      }
    };

    // Fire and forget API call
    jsonStorage.saveCalculation(calculationData)
      .catch(error => console.error('Failed to save calculation:', error));
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setIsEmailValid(isValid);
    setEmailError(isValid ? '' : 'Please enter a valid email address');
    return isValid;
  };

  const handleDateSelection = (day) => {
    setIncorporationDate(`${customYear}-${String(customMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    setShowDatePicker(false);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(customYear, customMonth);
    const firstDayOfMonth = new Date(customYear, customMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Responsive styles based on window width
  const getResponsiveStyles = () => {
    return {
      container: {
        maxWidth: isMobile ? '100%' : (isTablet ? '90%' : '800px'),
        margin: '0 auto',
        backgroundColor: '#f8f9fc',
        borderRadius: isMobile ? '8px' : '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      },
      header: {
        padding: isMobile ? '1.5rem 1rem 1rem' : '2rem 2rem 1.5rem'
      },
      title: {
        fontSize: isMobile ? '1.5rem' : '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#000'
      },
      description: {
        textAlign: 'center',
        color: '#666',
        fontSize: isMobile ? '0.875rem' : '1rem',
        marginBottom: isMobile ? '1.5rem' : '2rem'
      },
      sectionMargin: {
        marginBottom: isMobile ? '1.25rem' : '1.5rem'
      },
      label: {
        display: 'block',
        marginBottom: isMobile ? '0.5rem' : '0.75rem',
        fontWeight: '600',
        color: '#000',
        fontSize: isMobile ? '0.875rem' : '1rem'
      },
      input: {
        width: '100%',
        padding: isMobile ? '0.75rem' : '0.875rem',
        paddingLeft: '3rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: isMobile ? '0.875rem' : '1rem',
        cursor: 'pointer',
        boxSizing: 'border-box',
        backgroundColor: 'white'
      },
      select: {
        width: '100%',
        padding: isMobile ? '0.75rem' : '0.875rem',
        paddingRight: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: isMobile ? '0.875rem' : '1rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        appearance: 'none'
      },
      button: {
        width: '100%',
        padding: isMobile ? '0.75rem' : '0.875rem',
        backgroundColor: BRAND_COLORS.primary,
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: isMobile ? '0.875rem' : '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '1rem',
        transition: 'background-color 0.2s'
      },
      calendarPopup: {
        position: 'absolute',
        zIndex: 10,
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        marginTop: '0.5rem',
        width: isMobile ? 'calc(100% - 2rem)' : 'calc(100% - 4rem)',
        maxWidth: isMobile ? '100%' : '400px',
        left: isMobile ? '0' : 'auto'
      },
      calendarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: isMobile ? '0.125rem' : '0.25rem'
      },
      calendarDay: {
        padding: isMobile ? '0.375rem' : '0.5rem',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: isMobile ? '0.75rem' : '0.875rem'
      },
      resultsContainer: {
        backgroundColor: 'white',
        padding: isMobile ? '1.25rem 1rem' : '1.5rem',
        margin: isMobile ? '0 1rem 1.5rem' : '0 2rem 2rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      },
      resultsTitle: {
        fontSize: isMobile ? '1.125rem' : '1.25rem',
        fontWeight: '600',
        marginBottom: isMobile ? '1.25rem' : '1.5rem',
        color: BRAND_COLORS.secondary
      },
      resultItem: {
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: '1rem',
        flexDirection: isMobile ? 'column' : 'row'
      },
      resultNumber: {
        width: isMobile ? '1.75rem' : '2rem',
        height: isMobile ? '1.75rem' : '2rem',
        backgroundColor: BRAND_COLORS.primary,
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '1rem',
        marginBottom: isMobile ? '0.5rem' : '0',
        fontWeight: 'bold',
        fontSize: isMobile ? '0.875rem' : '1rem'
      },
      resultLabel: {
        fontWeight: '500',
        color: BRAND_COLORS.secondary,
        marginBottom: '0.25rem',
        fontSize: isMobile ? '0.875rem' : '1rem'
      },
      resultValue: {
        fontSize: isMobile ? '1rem' : '1.125rem'
      },
      footer: {
        padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
        backgroundColor: '#f8f9fc',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      },
      footerText: {
        color: '#4a5568',
        fontSize: isMobile ? '0.75rem' : '0.875rem',
        lineHeight: '1.5'
      }
    };
  };

  const styles = getResponsiveStyles();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          UAE Corporate Tax Tracker
        </h2>
        <p style={styles.description}>
          Calculate your first filing period and due date based on incorporation date and financial year
        </p>

        {/* Email Section */}
        <div style={styles.sectionMargin}>
          <label style={styles.label}>
            Your Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            style={{
              ...styles.input,
              paddingLeft: '1rem',
              borderColor: emailError ? '#e53e3e' : '#e2e8f0'
            }}
            placeholder="Enter your email address"
          />
          {emailError && (
            <p style={{
              color: '#e53e3e',
              fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem',
              marginTop: '0.5rem'
            }}>
              {emailError}
            </p>
          )}
        </div>

        {/* Incorporation Date Section */}
        <div style={styles.sectionMargin}>
          <label style={styles.label}>
            Your Company Incorporation Date
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: isEmailValid ? BRAND_COLORS.primary : '#cbd5e0'
            }}>
              <Calendar size={windowWidth < 768 ? 16 : 20} color={isEmailValid ? BRAND_COLORS.primary : '#cbd5e0'} />
            </div>
            <input
              type="text"
              style={{
                ...styles.input,
                color: incorporationDate ? '#000' : '#a0aec0',
                backgroundColor: isEmailValid ? 'white' : '#f3f4f6',
                cursor: isEmailValid ? 'pointer' : 'not-allowed',
                borderColor: isEmailValid ? '#e2e8f0' : '#edf2f7'
              }}
              value={incorporationDate ? new Date(incorporationDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : (isEmailValid ? 'Click to select incorporation date' : 'Please enter valid email first')}
              onClick={() => isEmailValid && setShowDatePicker(!showDatePicker)}
              readOnly
            />
          </div>

          {showDatePicker && (
            <div style={styles.calendarPopup}>
              {/* Month/Year Selectors */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <select
                  value={customMonth}
                  onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                  style={{
                    padding: windowWidth < 768 ? '0.375rem' : '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem'
                  }}
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>

                <select
                  value={customYear}
                  onChange={(e) => setCustomYear(parseInt(e.target.value))}
                  style={{
                    padding: windowWidth < 768 ? '0.375rem' : '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem'
                  }}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Calendar Grid */}
              <div style={styles.calendarGrid}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} style={{
                    ...styles.calendarDay,
                    color: BRAND_COLORS.secondary
                  }}>
                    {day}
                  </div>
                ))}

                {generateCalendarDays().map((day, index) => {
                  // Check if this day is the selected date
                  const isSelected = day && incorporationDate && 
                    new Date(incorporationDate).getDate() === day &&
                    new Date(incorporationDate).getMonth() === customMonth &&
                    new Date(incorporationDate).getFullYear() === customYear;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => day && handleDateSelection(day)}
                      style={{
                        ...styles.calendarDay,
                        cursor: day ? 'pointer' : 'default',
                        backgroundColor: isSelected ? BRAND_COLORS.primary : 'transparent',
                        color: isSelected ? 'white' : (day ? BRAND_COLORS.secondary : 'transparent'),
                        borderRadius: '0.25rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (day) e.currentTarget.style.backgroundColor = isSelected ? BRAND_COLORS.primary : '#f3f4f6';
                      }}
                      onMouseOut={(e) => {
                        if (day) e.currentTarget.style.backgroundColor = isSelected ? BRAND_COLORS.primary : 'transparent';
                      }}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <div style={{
                marginTop: '1rem',
                textAlign: 'right'
              }}>
                <button
                  onClick={() => setShowDatePicker(false)}
                  style={{
                    padding: windowWidth < 768 ? '0.375rem 0.75rem' : '0.5rem 1rem',
                    backgroundColor: BRAND_COLORS.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS.accent}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS.primary}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          <p style={{ 
            color: '#718096', 
            fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem', 
            marginTop: '0.5rem' 
          }}>
            Click to open our custom calendar for easier selection of any date
          </p>
        </div>

        {/* Financial Year Section */}
        <div style={styles.sectionMargin}>
          <label style={styles.label}>
            Your Financial Year (As per MOA/AOA)
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              style={{
                ...styles.select,
                backgroundColor: isEmailValid ? 'white' : '#f3f4f6',
                cursor: isEmailValid ? 'pointer' : 'not-allowed',
                borderColor: isEmailValid ? '#e2e8f0' : '#edf2f7'
              }}
              disabled={!isEmailValid}
            >
              {FINANCIAL_YEAR_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: isEmailValid ? BRAND_COLORS.primary : '#cbd5e0'
            }}>
              <svg width={windowWidth < 768 ? "12" : "16"} height={windowWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke={isEmailValid ? BRAND_COLORS.primary : '#cbd5e0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateFilingDetails}
          style={styles.button}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS.accent}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS.primary}
        >
          Calculate Due Dates
        </button>
      </div>

      {/* Results Section */}
      {showResults && (
        <div style={styles.resultsContainer}>
          <h3 style={styles.resultsTitle}>
            Tax Filing Timeline
          </h3>

          <div style={{ marginBottom: windowWidth < 768 ? '1rem' : '1.5rem' }}>
            <div style={{
              ...styles.resultItem,
              alignItems: windowWidth < 768 ? 'flex-start' : 'center',
              flexDirection: windowWidth < 768 ? 'column' : 'row'
            }}>
              <div style={{
                ...styles.resultNumber,
                marginBottom: windowWidth < 768 ? '0.5rem' : '0'
              }}>
                1
              </div>
              <div style={{ width: windowWidth < 768 ? '100%' : 'auto' }}>
                <div style={styles.resultLabel}>
                  Your First Filing Period:
                </div>
                <div style={styles.resultValue}>
                  {firstFilingPeriod}
                </div>
              </div>
            </div>

            <div style={{
              ...styles.resultItem,
              alignItems: windowWidth < 768 ? 'flex-start' : 'center',
              flexDirection: windowWidth < 768 ? 'column' : 'row',
              marginBottom: 0
            }}>
              <div style={{
                ...styles.resultNumber,
                marginBottom: windowWidth < 768 ? '0.5rem' : '0'
              }}>
                2
              </div>
              <div style={{ width: windowWidth < 768 ? '100%' : 'auto' }}>
                <div style={styles.resultLabel}>
                  Your First Filing Due Date:
                </div>
                <div style={styles.resultValue}>
                  {filingDueDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          <strong style={{ fontWeight: '600' }}>Simplify your tax filing process!</strong> Get expert assistance by reaching out to{' '}
          <a href="mailto:sales@finanshels.com" style={{ color: BRAND_COLORS.primary, textDecoration: 'none', fontWeight: '600' }}>sales@finanshels.com</a>.
          {windowWidth < 768 ? <br /> : ' '}Keeping your financial statements updated before the <strong style={{ fontWeight: '600' }}>Due Date</strong> is key to a hassle-free filing.
        </p>
      </div>
    </div>
  );
};

export default TaxFilingTracker;