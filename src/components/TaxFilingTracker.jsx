import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Finanshels brand colors
  const brandColors = {
    primary: '#F47B20', // Orange from logo
    secondary: '#000000', // Black from logo
    background: '#F5F7FA', // Light gray background
    accent: '#E65100', // Darker orange for hover
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years from 2010 to 2030
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
      
      console.log(`Months diff: ${monthsDiff} for ${incorpDate.toDateString()} to ${nextFYEndDate.toDateString()}`);
      
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg" style={{backgroundColor: brandColors.background, borderRadius: '12px'}}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-center mb-4" style={{color: brandColors.secondary}}>
          UAE Corporate Tax Tracker
        </CardTitle>
        <CardDescription className="text-center text-gray-600 px-4">
          Calculate your first filing period and due date based on incorporation date and financial year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="space-y-3">
          <label htmlFor="incorporation-date" className="block text-base font-medium" style={{color: brandColors.secondary}}>
            Your Company Incorporation Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar size={20} style={{color: brandColors.primary}} />
            </div>
            <input
              id="incorporation-date"
              type="text"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 text-base"
              style={{
                borderColor: '#E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                minHeight: '44px',
                fontSize: '16px'
              }}
              value={incorporationDate ? new Date(incorporationDate).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              }) : ''}
              onClick={() => setShowDatePicker(!showDatePicker)}
              placeholder="Click to select date"
              readOnly
            />
          </div>
          
          {showDatePicker && (
            <div className="mt-2 p-4 bg-white border rounded-lg shadow-lg absolute z-10">
              <div className="flex justify-between items-center mb-4">
                <select 
                  value={customMonth}
                  onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                  className="p-2 border rounded"
                  style={{borderColor: brandColors.primary}}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
                
                <select 
                  value={customYear}
                  onChange={(e) => setCustomYear(parseInt(e.target.value))}
                  className="p-2 border rounded"
                  style={{borderColor: brandColors.primary}}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="p-2 text-sm font-medium" style={{color: brandColors.secondary}}>
                    {day}
                  </div>
                ))}
                
                {generateCalendarDays().map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-2 text-center rounded-full ${day ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                    onClick={() => day && handleDateSelection(day)}
                    style={day ? {
                      backgroundColor: incorporationDate && 
                                     new Date(incorporationDate).getDate() === day && 
                                     new Date(incorporationDate).getMonth() === customMonth && 
                                     new Date(incorporationDate).getFullYear() === customYear 
                                   ? brandColors.primary : '',
                      color: incorporationDate && 
                             new Date(incorporationDate).getDate() === day && 
                             new Date(incorporationDate).getMonth() === customMonth && 
                             new Date(incorporationDate).getFullYear() === customYear 
                           ? 'white' : ''
                    } : {}}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  className="px-4 py-2 rounded text-white"
                  style={{backgroundColor: brandColors.primary}}
                  onClick={() => setShowDatePicker(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-1">
            Click to open our custom calendar for easier selection of any date
          </p>
        </div>
        
        <div className="space-y-3">
          <label htmlFor="financial-year" className="block text-base font-medium" style={{color: brandColors.secondary}}>
            Your Financial Year (As per MOA/AOA)
          </label>
          <select
            id="financial-year"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 text-base"
            style={{
              borderColor: '#E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              background: 'white url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23F47B20\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '20px',
              paddingRight: '40px',
              cursor: 'pointer'
            }}
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
          >
            {financialYearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        <button
          className="w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-base"
          style={{
            backgroundColor: brandColors.primary,
            color: 'white',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandColors.accent}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
          onClick={calculateFilingDetails}
        >
          Calculate Due Dates
        </button>
        
        {showResults && (
          <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-medium mb-6" style={{color: brandColors.secondary}}>Tax Filing Timeline</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4" 
                     style={{backgroundColor: brandColors.primary, color: 'white'}}>
                  1
                </div>
                <div>
                  <span className="font-semibold block mb-1" style={{color: brandColors.secondary}}>Your First Filing Period:</span> 
                  <span className="text-gray-700 text-lg">{firstFilingPeriod}</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4" 
                     style={{backgroundColor: brandColors.primary, color: 'white'}}>
                  2
                </div>
                <div>
                  <span className="font-semibold block mb-1" style={{color: brandColors.secondary}}>Your First Filing Due Date:</span> 
                  <span className="text-gray-700 text-lg">{filingDueDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500 text-center px-4 pb-6">
        <div className="w-full p-4 bg-gray-100 rounded-lg">
          <p className="font-medium" style={{color: brandColors.secondary}}>
            <strong>Simplify your tax filing process!</strong> Get expert assistance by reaching out to <strong style={{color: brandColors.primary}}>sales@finanshels.com</strong>. Keeping your financial statements updated before the <strong>Due Date</strong> is key to a hassle-free filing.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaxFilingTracker;