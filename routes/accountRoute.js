/* ********************************
* Account Routes
* Deliver login view
**************************** */
// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')


/* ********************************
* Deliver login view
* Login view activity
**************************** */
router.get("/login", accountController.buildLogin);
router.post("/login", utilities.handleErrors(accountController.handleLogin));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
router.get("/register", utilities.handleErrors(accountController.buildRegister));




module.exports = router;