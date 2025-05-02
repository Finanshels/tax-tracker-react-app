import React from 'react';

const Card = ({ className, children, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-100 max-w-3xl mx-auto ${className || ''}`} 
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={`px-8 py-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 
      className={`text-2xl font-bold text-center mb-3 ${className || ''}`} 
      {...props}
    >
      {children}
    </h3>
  );
};

const CardDescription = ({ className, children, ...props }) => {
  return (
    <p 
      className={`text-center text-gray-600 mb-6 ${className || ''}`} 
      {...props}
    >
      {children}
    </p>
  );
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={`px-8 py-4 space-y-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={`px-8 py-6 text-center ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };