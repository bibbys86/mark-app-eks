// Enhanced fetch wrapper for Datadog APM correlation
const enhancedFetch = async (url, options = {}) => {
  // Get RUM context for APM correlation (only if RUM is available)
  let rumContext = null;
  if (typeof window !== 'undefined' && window.DD_RUM) {
    try {
      rumContext = window.DD_RUM.getInternalContext();
    } catch (error) {
      console.warn('Failed to get RUM context:', error);
    }
  }
  
  const headers = {
    ...options.headers,
    // Add Datadog trace headers for APM correlation if available
    ...(rumContext && {
      'x-datadog-trace-id': rumContext.trace_id || '',
      'x-datadog-parent-id': rumContext.span_id || '',
    })
  }

  return fetch(url, {
    ...options,
    headers
  })
}

// Export enhanced fetch for global use
if (typeof window !== 'undefined') {
  window.enhancedFetch = enhancedFetch;
}

const formatLogMessage = (level, message, data = {}, error = null) => {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'mark-shop-frontend',
    ...data
  };

  if (error) {
    logData.error = {
      message: error.message,
      stack: error.stack
    };
  }

  return JSON.stringify(logData);
};

const logger = {
  info: (message, data = {}) => {
    console.log(formatLogMessage('info', message, data));
    
    // Send to Datadog RUM if available
    if (typeof window !== 'undefined' && window.DD_RUM) {
      try {
        window.DD_RUM.addAction('log.info', {
          message,
          ...data
        });
      } catch (error) {
        console.warn('Failed to send to RUM:', error);
      }
    }
  },

  error: (message, error = null, data = {}) => {
    console.error(formatLogMessage('error', message, data, error));
    
    // Send to Datadog RUM if available
    if (typeof window !== 'undefined' && window.DD_RUM) {
      try {
        window.DD_RUM.addError(error || new Error(message), {
          ...data
        });
      } catch (err) {
        console.warn('Failed to send error to RUM:', err);
      }
    }
  },

  warn: (message, data = {}) => {
    console.warn(formatLogMessage('warn', message, data));
    
    // Send to Datadog RUM if available
    if (typeof window !== 'undefined' && window.DD_RUM) {
      try {
        window.DD_RUM.addAction('log.warn', {
          message,
          ...data
        });
      } catch (error) {
        console.warn('Failed to send warning to RUM:', error);
      }
    }
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLogMessage('debug', message, data));
    }
  }
};

export default logger;
export { enhancedFetch }; 