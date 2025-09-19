// controllers/errorController.js
async function throwError(req, res, next) {
  try {
    // Intentionally throw an error
    throw new Error("This is an intentional 500 error for testing.")
  } catch (err) {
    next(err) // Pass error to middleware
  }
}

module.exports = { throwError }
