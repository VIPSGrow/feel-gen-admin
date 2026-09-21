import React from 'react';

/** * 1. TYPE DEFINITIONS
 * Ensuring strict typing for API responses and HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ServerResponse<T = any> {
  status: boolean;
  success:boolean;
  message: string;
  e_code?: number;
  data?: T | null;
}

// Ensure the environment variable is picked up correctly in production
// const host: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const host: string = process.env.NEXT_PUBLIC_API_URL || 'https://backend.feelsafeco.in';
// const host:string = 'https://backend.feelsafeco.in';

/**
 * 2. TYPE GUARDS & CHECKS
 */
const isFormData = (body: any): body is FormData => {
  return typeof window !== 'undefined' && body instanceof FormData;
};

export const isUri = (string: unknown): boolean => {
  if (typeof string !== 'string') return false;
  return ['http', 'https', 'ftp', 'file'].some(protocol => string.startsWith(protocol));
};

/**
 * 3. FORMATTING UTILITIES
 */

export const formattedAmountCommas = (value: number): string => {
  let amount: string = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  
  return amount;
};


export const formattedAmount = (value: number): string => {
  let amount: string;
  if (value >= 100000) { // 1 Lakh
    amount = formatInIndianUnits(value);
  } else {
    amount = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  return amount;
};
export const formattedAmountPoints = (value: number): string => {
  let amount: string;
  if (value >= 100000) { // 1 Lakh
    amount = formatInIndianUnits(value);
  }
  if (value >= 1000) { // 1 Lakh
    amount = formatInIndianUnits(value);
  }
   else {
    amount = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  return amount;
};

export function formatInIndianUnits(amount: number): string {
  const numAmount = Number(amount);

  if (numAmount >= 10000000) { // 1 Crore
    return (numAmount / 10000000).toFixed(2) + ' Cr';
  } else if (numAmount >= 100000) { // 1 Lakh
    return (numAmount / 100000).toFixed(2) + ' L';
  } else if (numAmount >= 1000) { // 1 Thousand
    return (numAmount / 1000).toFixed(2) + 'K';
  } else {
    return numAmount.toLocaleString('en-IN');
  }
}

export const getCurrencyIcon = (value: string): string => {
  return value === 'INR' ? '₹' : '';
};

export const date_formate = (isoDate: string | number | Date): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB'); // Results in "DD/MM/YYYY"
};

export const time_format = (isoDate: string | number | Date): string => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export const time_diff = (
  isoDate1: string | Date, 
  isoDate2: string | Date, 
  s_time: string | null = null, 
  e_time: string | null = null
): string => {
  const date1 = new Date(isoDate1).getTime();
  const date2 = new Date(isoDate2).getTime();

  let diffMs = Math.abs(date2 - date1);
  let totalMins = diffMs / (1000 * 60);

  if (s_time) {
    totalMins += parseFloat(s_time.replace('mins', '').trim()) || 0;
  }

  if (e_time) {
    totalMins += parseFloat(e_time.replace('mins', '').trim()) || 0;
  }

  const diffHrs = Math.floor(totalMins / 60);
  const diffMins = Math.floor(totalMins % 60);

  return `${diffHrs} hr ${diffMins} min`;
};

/**
 * 4. UI COMPONENT PROPS HELPERS
 */
export const buttonProps = (
  children: React.ReactNode, 
  color: any, 
  variant: any, 
  sx: object, 
  icon?: React.ReactNode, 
  size?: any
) => ({
  children,
  color,
  variant,
  sx,
  startIcon: icon ? icon : null,
  size
});

export const buttonIconProps = (
  icon: React.ReactNode, 
  color: any, 
  variant: any, 
  className?: string
) => ({
  icon,
  color,
  variant,
  className,
  sx: {
    borderRadius: '9999px',
    px: 1.5,
    fontSize: '1rem'
  }
});

/**
 * 5. CORE API HANDLER
 * Uses Generics <T> to allow typing of the expected data response
 */
const serverCallFuction = async <T = any>(
  method: HttpMethod = 'GET',
  endPoints: string = '',
  body: any = null
): Promise<T | ServerResponse> => {
  try {
    // Check for token in localStorage (safe for Next.js/Browser)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const token = storedToken || '';
    
    let headers: Record<string, string> = {
      'x-auth-token': token
    };

    if (token) {
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // If body is NOT FormData, we send JSON headers
    if (body && !isFormData(body)) {
      headers['Content-Type'] = 'application/json';
    } else if (!body) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      method: method,
      headers: headers,
      body: body ? (isFormData(body) ? body : JSON.stringify(body)) : null
    };

    console.log(`[API Call]: ${method} ${host}/${endPoints}`);

    const response = await fetch(`${host}/${endPoints}`, requestOptions);
    const contentType = response.headers.get('content-type');
    
    let dataresp: any = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      dataresp = text ? JSON.parse(text) : {};
    }

    if (response.ok) {
      return dataresp as T;
    } else {
      return { 
        status: false, 
        e_code: response.status, 
        message: dataresp?.message || 'Something went wrong!' 
      };
    }
  } catch (e: any) {
    console.error('Error in calling endpoint:', e);

    return {
      status: false,
      message: e.message || 'Something went wrong',
      data: null
    };
  }
};

export default serverCallFuction;


export const downloadFile = async <T = any>(
  method: HttpMethod = 'GET',
  endPoints: string = '',
  body: any = null
): Promise<T | ServerResponse> => {
  try {
    // Check for token in localStorage (safe for Next.js/Browser)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const token = storedToken || '';
    
    let headers: Record<string, string> = {
      'x-auth-token': token
    };

    // If body is NOT FormData, we send JSON headers
    if (body && !isFormData(body)) {
      headers['Content-Type'] = 'application/json';
    } else if (!body) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      method: method,
      headers: headers,
      body: body ? (isFormData(body) ? body : JSON.stringify(body)) : null
    };

    console.log(`[API Call]: ${method} ${host}/${endPoints}`);

    const response = await fetch(`${host}/${endPoints}`, requestOptions);
    const contentType = response.headers.get('content-type');
    
    

    if (response.ok) {
      return response.blob() as unknown as T;
    } else {
      return {
        status: false,
        e_code: response.status,
        message: 'Something went wrong!'
      }
    }
  } catch (e: any) {
    console.error('Error in calling endpoint:', e);

    return {
      status: false,
      message: e.message || 'Something went wrong',
      data: null
    };
  }
};



/**
 * 6. BASE64 ENCODING/DECODING
 * Built-in check for Node.js (Buffer) and Browser/Mobile (atob/btoa)
 */
export const Decode64 = (encoded: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } else {
    return atob(encoded);
  }
};

export const Endcode64 = (string: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(string).toString('base64');
  } else {
    return btoa(string);
  }
};