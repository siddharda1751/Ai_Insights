/**
 * Retry utility with exponential backoff.
 * Designed for transient failure recovery (network issues, temporary API unavailability).
 * 
 * Usage:
 *   const result = await retry(
 *     () => scrapeCompany('https://example.com'),
 *     { maxRetries: 3, initialDelayMs: 1000 }
 *   );
 */

/**
 * Executes an async function with exponential backoff retry logic.
 * 
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Configuration
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelayMs - Initial delay in milliseconds (default: 1000)
 * @param {Function} options.shouldRetry - Custom predicate to determine if error is retryable (default: retries all errors)
 * @param {string} options.operation - Operation name for logging
 * 
 * @returns {Promise<any>} Result of successful function execution
 * @throws {Error} Original error if all retries exhausted
 */
export const retry = async (
    fn,
    {
        maxRetries = 3,
        initialDelayMs = 1000,
        shouldRetry = () => true,
        operation = 'Operation',
    } = {}
) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if we should retry this error
            if (!shouldRetry(error)) {
                console.warn(
                    `[Retry] ${operation} failed with non-retryable error (attempt ${attempt}/${maxRetries + 1}): ${error.message}`
                );
                throw error;
            }

            // Check if we've exhausted retries
            if (attempt > maxRetries) {
                console.error(
                    `[Retry] ${operation} exhausted all retries (${maxRetries}) after ${attempt - 1} failures`
                );
                throw error;
            }

            // Calculate exponential backoff delay
            const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
            console.warn(
                `[Retry] ${operation} failed (attempt ${attempt}/${maxRetries + 1}): ${error.message}. Retrying in ${delayMs}ms...`
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
};

/**
 * Predicate: returns true if error is likely transient (should retry).
 * Used to filter out permanent failures like validation errors.
 * 
 * @param {Error} error - Error to evaluate
 * @returns {boolean} True if error appears transient
 */
export const isTransientError = (error) => {
    // Network errors (retryable)
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        return true;
    }

    // HTTP errors (check status code)
    if (error.response?.status >= 500) {
        return true; // Server errors are often transient
    }

    if (error.response?.status === 429) {
        return true; // Rate limiting is transient
    }

    // Assume network-related errors are transient
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
        return true;
    }

    // Default: treat as transient (safe for operations like scraping, API calls)
    return true;
};

/**
 * Predicate: returns false for all errors (never retry).
 * Use for validation errors, malformed data, etc.
 * 
 * @returns {boolean} Always false
 */
export const neverRetry = () => false;

/**
 * Retry configuration presets.
 */
export const RETRY_CONFIGS = {
    // For scraping (network-bound, often fails transiently)
    scraping: {
        maxRetries: 3,
        initialDelayMs: 1000,
        shouldRetry: isTransientError,
        operation: 'Scraping',
    },

    // For API calls (Gemini, external services)
    api: {
        maxRetries: 2,
        initialDelayMs: 2000,
        shouldRetry: isTransientError,
        operation: 'API Call',
    },

    // For email sending (network-bound, SMTP can be flaky)
    email: {
        maxRetries: 2,
        initialDelayMs: 3000,
        shouldRetry: isTransientError,
        operation: 'Email Sending',
    },

    // No retries — for validation, data processing
    noRetry: {
        maxRetries: 0,
        shouldRetry: neverRetry,
        operation: 'Validation',
    },
};
