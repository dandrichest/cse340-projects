const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const validate = require('../utilities/account-validation')
const invController = require("../controllers/invController")

// Login and Registration
router.get("/login", accountController.buildLogin)
router.post("/login", validate.loginRules(), validate.checkLoginData, utilities.handleErrors(accountController.accountLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post("/register", validate.registrationRules(), validate.checkRegData, utilities.handleErrors(accountController.handleRegister))

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).send("Could not log out.")
    }
    res.redirect("/")
  })
})

// Dashboard
router.get("/", utilities.checkJWTToken, utilities.checkLogin, accountController.buildDashboard)

// Account Management
router.get("/account", utilities.checkJWTToken, utilities.checkLogin, accountController.authorizeAccountAccess, accountController.showAccountDashboard)
router.get("/edit", utilities.checkJWTToken, utilities.checkLogin, accountController.authorizeAccountAccess, accountController.showEditAccount)
router.post("/edit", accountController.updateAccount)
router.post("/change-password", accountController.changePassword)



// Inventory
router.get("/add-classification", utilities.checkJWTToken, utilities.checkLogin, invController.authorizeInventoryAccess, invController.showAddClassification)

module.exports = router
