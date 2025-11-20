/**
 * Global Error Handler
 * Silently handles all errors to prevent "error response" messages
 */

(function() {
    'use strict';

    // Prevent unhandled promise rejections from showing errors
    window.addEventListener('unhandledrejection', function(event) {
        // Check if it's a fetch/network/abort error
        const reason = event.reason;
        const errorMessage = reason && (reason.message || reason.toString() || '');
        
        if (errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('404') ||
            errorMessage.includes('AbortError') ||
            errorMessage.includes('aborted') ||
            errorMessage.includes('Partial not found') ||
            errorMessage.includes('Error response') ||
            errorMessage.includes('error response') ||
            reason && reason.name === 'AbortError') {
            // Silently prevent fetch/network/abort related promise rejections
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        // Let other promise rejections through (for debugging real issues)
    }, true);

    // Prevent error events from showing in console
    window.addEventListener('error', function(event) {
        // Only prevent fetch/network errors
        const errorMessage = event.message || event.error?.message || '';
        if (errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('404') ||
            errorMessage.includes('AbortError') ||
            errorMessage.includes('aborted') ||
            errorMessage.includes('Error response') ||
            errorMessage.includes('error response') ||
            errorMessage.includes('Partial not found')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        // Let other errors through (for debugging real issues)
    }, true);

    // Override console.error for fetch-related errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        // Filter out fetch/network/abort errors
        if (message.includes('Failed to fetch') ||
            message.includes('NetworkError') ||
            message.includes('404') ||
            message.includes('AbortError') ||
            message.includes('aborted') ||
            message.includes('Partial not found') ||
            message.includes('Error loading partial') ||
            message.includes('Error response') ||
            message.includes('error response') ||
            message.includes('File not found')) {
            // Silently ignore
            return;
        }
        // Log other errors normally
        originalConsoleError.apply(console, args);
    };

    // Override console.warn for fetch-related warnings
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ');
        // Filter out fetch/network/abort warnings
        if (message.includes('Failed to fetch') ||
            message.includes('NetworkError') ||
            message.includes('404') ||
            message.includes('AbortError') ||
            message.includes('aborted') ||
            message.includes('Partial not found') ||
            message.includes('Error loading partial') ||
            message.includes('Error response') ||
            message.includes('error response') ||
            message.includes('File not found')) {
            // Silently ignore
            return;
        }
        // Log other warnings normally
        originalConsoleWarn.apply(console, args);
    };

})();

