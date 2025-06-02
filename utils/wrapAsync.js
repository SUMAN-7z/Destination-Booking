// Export a function that takes an asynchronous route handler or middleware function as input
// This is a higher-order function that helps manage async errors in Express apps
module.exports = (fn) => {
  // Return a new function with the standard Express middleware signature (req, res, next)
  return function (req, res, next) {
    /*
     * Call the passed-in async function (fn) with the request, response, and next objects.
     * If the async function throws an error or returns a rejected Promise,
     * .catch(next) ensures that the error is passed to Express's built-in error-handling middleware.
     *
     * Without this wrapper, you'd have to use try/catch in every async route or middleware to handle errors.
     */
    fn(req, res, next).catch(next);
  };
};
