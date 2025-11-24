// src/utils/cookieUtils.js - Production Subdomain Cookie Management

/**
 * Production Cookie Configuration for govthostelcare.me subdomain setup
 * 
 * Subdomain Architecture:
 * - Frontend: govthostelcare.me (main domain)
 * - API: api.govthostelcare.me (backend subdomain)
 * - Admin: admin.govthostelcare.me (admin panel subdomain)
 * - Warden: warden.govthostelcare.me (warden panel subdomain)
 * 
 * Cookie Domain: .govthostelcare.me (allows sharing across all subdomains)
 * SameSite: lax (since all services are on same domain, not third-party)
 */

// Environment detection
const isProduction = import.meta.env.MODE === 'production' || 
                    window.location.hostname.includes('govthostelcare.me');

const isDevelopment = !isProduction;

// Cookie configuration based on environment
const cookieConfig = {
  domain: isProduction ? '.govthostelcare.me' : null,
  secure: isProduction,
  sameSite: 'lax',  // Same-site policy since all services on same domain
  path: '/'
};

/**
 * Set cookie with production subdomain support
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value  
 * @param {number} days - Expiration in days (optional)
 * @param {object} options - Additional cookie options
 */
export const setCookie = (name, value, days = 1, options = {}) => {
  const finalOptions = { ...cookieConfig, ...options };
  
  let cookieString = `${name}=${encodeURIComponent(value)}; path=${finalOptions.path}`;
  
  if (days > 0) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${expires.toUTCString()}`;
  }
  
  if (finalOptions.domain) {
    cookieString += `; domain=${finalOptions.domain}`;
  }
  
  if (finalOptions.secure) {
    cookieString += '; secure';
  }
  
  cookieString += `; samesite=${finalOptions.sameSite}`;
  
  if (finalOptions.httpOnly) {
    cookieString += '; httponly';
  }
  
  document.cookie = cookieString;
  
  if (isProduction) {
    console.log(`🍪 Production cookie set: ${name} (domain: ${finalOptions.domain})`);
  }
};

/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

/**
 * Delete cookie with proper domain handling
 * @param {string} name - Cookie name
 * @param {object} options - Additional options
 */
export const deleteCookie = (name, options = {}) => {
  const finalOptions = { ...cookieConfig, ...options };
  
  // Set expiration to past date
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${finalOptions.path}`;
  
  if (finalOptions.domain) {
    cookieString += `; domain=${finalOptions.domain}`;
  }
  
  if (finalOptions.secure) {
    cookieString += '; secure';
  }
  
  cookieString += `; samesite=${finalOptions.sameSite}`;
  
  document.cookie = cookieString;
  
  if (isProduction) {
    console.log(`🗑️ Production cookie deleted: ${name} (domain: ${finalOptions.domain})`);
  }
};

/**
 * Nuclear cookie clearing for production logout
 * Clears cookies across all possible domain variations
 */
export const nuclearClearCookies = () => {
  const allCookies = [
    'user_access_token', 'user_refresh_token',
    'admin_access_token', 'admin_refresh_token',
    'warden_access_token', 'warden_refresh_token',
    'access_token', 'refresh_token',
    'sessionid', 'csrftoken', 'auth_token',
    'session'
  ];
  
  if (isProduction) {
    // Clear with multiple domain variations for maximum compatibility
    const domains = ['.govthostelcare.me', 'govthostelcare.me', null];
    
    allCookies.forEach(cookieName => {
      domains.forEach(domain => {
        deleteCookie(cookieName, { domain });
      });
    });
    
    console.log('🧨 Nuclear cookie clearing completed (production subdomain-aware)');
  } else {
    // Development clearing
    allCookies.forEach(cookieName => {
      deleteCookie(cookieName);
    });
    
    console.log('🧨 Nuclear cookie clearing completed (development)');
  }
  
  // Also clear localStorage for good measure
  const localStorageKeys = [
    'user_data', 'admin_data', 'warden', 'shid', 'auth_token'
  ];
  
  localStorageKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Check if cookies are working properly in production
 * @returns {boolean} True if cookies are supported and working
 */
export const testCookieSupport = () => {
  const testName = 'cookie_test';
  const testValue = 'test_value';
  
  setCookie(testName, testValue);
  const retrieved = getCookie(testName);
  deleteCookie(testName);
  
  const isWorking = retrieved === testValue;
  
  if (!isWorking && isProduction) {
    console.warn('⚠️ Cookie support test failed in production!');
    console.warn('This might indicate CORS or SameSite policy issues.');
  }
  
  return isWorking;
};

/**
 * Get current environment configuration info
 * @returns {object} Environment and cookie configuration
 */
export const getEnvironmentInfo = () => {
  return {
    environment: isProduction ? 'production' : 'development',
    hostname: window.location.hostname,
    cookieDomain: cookieConfig.domain,
    cookieSecure: cookieConfig.secure,
    cookieSameSite: cookieConfig.sameSite,
    subdomainSetup: isProduction,
    testResult: testCookieSupport()
  };
};

/**
 * Log environment info for debugging
 */
export const debugCookieEnvironment = () => {
  const info = getEnvironmentInfo();
  console.group('🍪 Cookie Environment Debug');
  Object.entries(info).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();
};

// Auto-debug in development
if (isDevelopment) {
  debugCookieEnvironment();
}

export default {
  setCookie,
  getCookie,
  deleteCookie,
  nuclearClearCookies,
  testCookieSupport,
  getEnvironmentInfo,
  debugCookieEnvironment,
  isProduction,
  isDevelopment,
  cookieConfig
};
