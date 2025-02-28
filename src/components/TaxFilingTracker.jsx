import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const TaxFilingTracker = () => {
  const [incorporationDate, setIncorporationDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [financialYear, setFinancialYear] = useState('January to December');
  const [firstFilingPeriod, setFirstFilingPeriod] = useState('');
  const [filingDueDate, setFilingDueDate] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [customMonth, setCustomMonth] = useState(new Date().getMonth());
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Finanshels brand colors
  const brandColors = {
    primary: '#F47B20', // Orange from logo
    secondary: '#000000', // Black from logo
    background: '#F5F7FA', // Light gray background
    accent: '#E65100', // Darker orange for hover
  };

  // Add window resize listener for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 21 }, (_, i) => 2010 + i);

  const financialYearOptions = [
    'January to December',
    'February to January',
    'March to February',
    'April to March',
    'May to April',
    'June to May',
    'July to June',
    'August to July',
    'September to August',
    'October to September',
    'November to October',
    'December to November'
  ];

  // Use useEffect to recalculate when inputs change
  useEffect(() => {
    // Only recalculate if we've already shown results once
    // and we have a valid incorporation date
    if (showResults && incorporationDate) {
      calculateFilingDetails();
    }
  }, [incorporationDate, financialYear]);

  // Function to handle custom date selection
  const handleDateSelection = (day) => {
    // Use direct string formatting to avoid timezone issues
    // This ensures the date is exactly what the user selected
    const formattedDate = `${customYear}-${String(customMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setIncorporationDate(formattedDate);
    setShowDatePicker(false);
  };

  // Function to get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(customYear, customMonth);
    const firstDayOfMonth = new Date(customYear, customMonth, 1).getDay();
    
    // Create array for days of the month
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Function to get month name from month number (0-based)
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber];
  };

  // Function to get month number from month name (0-based)
  const getMonthNumber = (monthName) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName);
  };

  // Calculate the first filing period and due date
  const calculateFilingDetails = () => {
    if (!incorporationDate) {
      if (showResults) {
        setShowResults(false);
      }
      return;
    }

    const incorpDate = new Date(incorporationDate);
    const incorpMonth = incorpDate.getMonth();
    const incorpYear = incorpDate.getFullYear();
    
    // Extract financial year start and end months
    const fyParts = financialYear.split(' to ');
    const fyStartMonth = getMonthNumber(fyParts[0]);
    const fyEndMonth = getMonthNumber(fyParts[1]);
    
    // Corporate tax implementation date in UAE
    const taxImplementationDate = new Date(2023, 5, 1); // June 2023
    
    let firstFilingStartDate;
    let firstFilingEndDate;
    
    // Logic 1: Incorporation Date is in June 2023
    if (incorpYear === 2023 && incorpMonth === 5) {
      // Find next financial year end after incorporation
      let nextFYEndYear = incorpYear;
      let nextFYEndMonth = fyEndMonth;
      
      // Adjust the year for the next financial year end
      if (fyEndMonth < fyStartMonth) {
        // Financial year spans across years (e.g., April to March)
        if (fyStartMonth > incorpMonth) {
          nextFYEndYear = incorpYear + 1;
        } else {
          nextFYEndYear = incorpYear + 1;
        }
      } else {
        // Financial year within the same year (e.g., January to December)
        if (fyEndMonth < incorpMonth) {
          nextFYEndYear = incorpYear + 1;
        }
      }
      
      // Create the next financial year end date
      const nextFYEndDate = new Date(nextFYEndYear, nextFYEndMonth, 
        // Use last day of month
        new Date(nextFYEndYear, nextFYEndMonth + 1, 0).getDate()
      );
      
      // Calculate months difference
      const monthsDiff = (nextFYEndDate.getFullYear() - incorpDate.getFullYear()) * 12 + 
                         (nextFYEndDate.getMonth() - incorpDate.getMonth());
      
      if (monthsDiff >= 6) {
        // If 6 or more months, first filing period ends at next FY end
        firstFilingStartDate = new Date(incorpDate);
        firstFilingEndDate = nextFYEndDate;
      } else {
        // If less than 6 months, first filing period ends at next to next FY end
        firstFilingStartDate = new Date(incorpDate);
        
        // Calculate next to next financial year end date
        let nextToNextFYEndYear = nextFYEndYear;
        if (fyEndMonth < fyStartMonth) {
          nextToNextFYEndYear += 1;
        } else {
          nextToNextFYEndYear += 1;
        }
        
        firstFilingEndDate = new Date(nextToNextFYEndYear, nextFYEndMonth, 
          // Use last day of month
          new Date(nextToNextFYEndYear, nextFYEndMonth + 1, 0).getDate()
        );
      }
    }
    // Logic 2: Incorporation Date is before June 2023
    else if (incorpDate < taxImplementationDate) {
      // Find next financial year start date after June 2023
      let nextFYStartYear = 2023;
      
      if (fyStartMonth < 5) { // If FY starts before June
        nextFYStartYear = 2024;
      }
      
      firstFilingStartDate = new Date(nextFYStartYear, fyStartMonth, 1);
      
      // Calculate the FY end date
      let fyEndYear = nextFYStartYear;
      if (fyEndMonth < fyStartMonth) {
        fyEndYear += 1;
      }
      
      firstFilingEndDate = new Date(fyEndYear, fyEndMonth, 
        // Use last day of month
        new Date(fyEndYear, fyEndMonth + 1, 0).getDate()
      );
    }
    // Logic 3: Incorporation Date is after June 2023
    else if (incorpDate > taxImplementationDate) {
      // First, set the filing start date to the incorporation date
      firstFilingStartDate = new Date(incorpDate);
      
      // Find next financial year end after incorporation
      let nextFYEndYear = incorpYear;
      let nextFYEndMonth = fyEndMonth;
      
      // Determine the next financial year end after incorporation date
      // For Jan-Dec FY: If incorporated in Aug 2025, next FY end is Dec 2025
      // For Apr-Mar FY: If incorporated in Aug 2025, next FY end is Mar 2026
      
      // Financial year spans across years (e.g., April to March)
      if (fyEndMonth < fyStartMonth) {
        // If incorporated after FY start month, next end will be in the next year
        if (incorpMonth >= fyStartMonth) {
          nextFYEndYear = incorpYear + 1;
        } 
        // If incorporated before FY start month but after/at FY end month
        else if (incorpMonth >= fyEndMonth) {
          nextFYEndYear = incorpYear + 1;
        }
        // Otherwise, it's in the current year
      } 
      // Financial year within the same year (e.g., January to December)
      else {
        // If incorporated after FY end month, next FY end is next year
        if (incorpMonth > fyEndMonth) {
          nextFYEndYear = incorpYear + 1;
        }
      }
      
      // Create the next financial year end date
      const nextFYEndDate = new Date(nextFYEndYear, nextFYEndMonth, 
        // Use last day of month
        new Date(nextFYEndYear, nextFYEndMonth + 1, 0).getDate()
      );
      
      // Calculate months difference
      const monthsDiff = (nextFYEndDate.getFullYear() - incorpDate.getFullYear()) * 12 + 
                         (nextFYEndDate.getMonth() - incorpDate.getMonth());
      
      if (monthsDiff >= 6) {
        // If 6 or more months, first filing period ends at next FY end
        firstFilingEndDate = nextFYEndDate;
      } else {
        // If less than 6 months, first filing period ends at next to next FY end
        
        // Calculate next to next financial year end date
        let nextToNextFYEndYear = nextFYEndYear + 1;
        
        firstFilingEndDate = new Date(nextToNextFYEndYear, nextFYEndMonth, 
          // Use last day of month
          new Date(nextToNextFYEndYear, nextFYEndMonth + 1, 0).getDate()
        );
      }
    }
    
    // Calculate Filing Due Date (9th month from the end month of first filing period)
    // For example: if first filing period ends Dec 2023, due date is Sep 2024
    const endMonth = firstFilingEndDate.getMonth();
    const endYear = firstFilingEndDate.getFullYear();
    
    // Calculate the due month (adding 9 to the current month)
    const dueMonth = (endMonth + 9) % 12;
    // Calculate the due year (if month + 9 > 12, we move to next year)
    const dueYear = endYear + Math.floor((endMonth + 9) / 12);
    
    const filingDueDateValue = new Date(dueYear, dueMonth, 1);
    
    // Remove debug console.log statements in production version
    const formatDate = (date) => {
      return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
    };
    
    setFirstFilingPeriod(`${formatDate(firstFilingStartDate)} to ${formatDate(firstFilingEndDate)}`);
    setFilingDueDate(formatDate(filingDueDateValue));
    setShowResults(true);
  };

  // Responsive styles based on window width
  const getResponsiveStyles = () => {
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    
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
        backgroundColor: brandColors.primary,
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
        color: brandColors.secondary
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
        backgroundColor: brandColors.primary,
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
        color: brandColors.secondary,
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
              color: brandColors.primary
            }}>
              <Calendar size={windowWidth < 768 ? 16 : 20} color={brandColors.primary} />
            </div>
            <input
              type="text"
              style={{
                ...styles.input,
                color: incorporationDate ? '#000' : '#a0aec0'
              }}
              value={incorporationDate ? new Date(incorporationDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : 'Click to select date'}
              onClick={() => setShowDatePicker(!showDatePicker)}
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
                  {months.map((month, index) => (
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
                    color: brandColors.secondary
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
                        backgroundColor: isSelected ? brandColors.primary : 'transparent',
                        color: isSelected ? 'white' : (day ? brandColors.secondary : 'transparent'),
                        borderRadius: '0.25rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (day) e.currentTarget.style.backgroundColor = isSelected ? brandColors.primary : '#f3f4f6';
                      }}
                      onMouseOut={(e) => {
                        if (day) e.currentTarget.style.backgroundColor = isSelected ? brandColors.primary : 'transparent';
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
                    backgroundColor: brandColors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandColors.accent}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
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
              style={styles.select}
            >
              {financialYearOptions.map(option => (
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
              color: brandColors.primary
            }}>
              <svg width={windowWidth < 768 ? "12" : "16"} height={windowWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke={brandColors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateFilingDetails}
          style={styles.button}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandColors.accent}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
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
          <a href="mailto:sales@finanshels.com" style={{ color: brandColors.primary, textDecoration: 'none', fontWeight: '600' }}>sales@finanshels.com</a>.
          {windowWidth < 768 ? <br /> : ' '}Keeping your financial statements updated before the <strong style={{ fontWeight: '600' }}>Due Date</strong> is key to a hassle-free filing.
        </p>
      </div>
    </div>
  );
};

export default TaxFilingTracker;