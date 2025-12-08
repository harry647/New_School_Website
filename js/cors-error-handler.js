/**
 * CORS Error Handler for Bar Union School Website
 * Handles CORS errors gracefully and prevents them from breaking the site
 */

(function() {
    'use strict';

    // Override fetch to handle CORS errors
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        // Log external requests for debugging
        if (typeof url === 'string' && (url.includes('reasonlabsapi.com') || url.includes('ab.reasonlabsapi.com'))) {
            console.warn('External request detected:', url);
        }
        
        return originalFetch.apply(this, args)
            .then(response => {
                if (!response.ok && response.type === 'opaque') {
                    console.warn('CORS blocked request:', url);
                }
                return response;
            })
            .catch(error => {
                // Handle CORS errors gracefully
                if (error.message && error.message.includes('CORS')) {
                    console.warn('CORS error handled gracefully:', url);
                    // Return a mock response to prevent breaking the application
                    return new Response(JSON.stringify({ 
                        error: 'CORS error', 
                        message: 'External service temporarily unavailable' 
                    }), {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                throw error;
            });
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason;
        
        // Check for CORS-related errors
        if (error && (
            error.message && error.message.includes('CORS') ||
            error.message && error.message.includes('Failed to fetch') ||
            error.name === 'TypeError' && error.message.includes('Failed to convert')
        )) {
            console.warn('CORS-related error handled:', error.message);
            event.preventDefault(); // Prevent the error from showing in console
            return;
        }
        
        // Handle network errors for external services
        if (error && error.message && error.message.includes('reasonlabsapi.com')) {
            console.warn('External service error handled:', error.message);
            event.preventDefault();
            return;
        }
    });

    // Service worker handling
    if ('serviceWorker' in navigator) {
        // Unregister any existing service workers that might be causing issues
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            registrations.forEach(function(registration) {
                if (registration.active && registration.active.scriptURL.includes('2sw.js')) {
                    console.warn('Removing problematic service worker:', registration.active.scriptURL);
                    registration.unregister();
                }
            });
        }).catch(function(error) {
            console.warn('Service worker cleanup error:', error);
        });
    }

    console.log('CORS error handler initialized');
})();