/* ********************************
 * Account Controller
 **************************** */
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const regValidate = require("../utilities/account-validation")
const bcrypt = require("bcryptjs")

/* ********************************
 * Deliver login view
 **************************** */
async function buildLogin(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash("messages")
  })
}

/* ********************************
 * Handle Login form POST
 **************************** */
async function handleLogin(req, res) {
  const { email, password } = req.body
  const nav = await utilities.getNav()

  try {
    const accountData = await accountModel.getAccountByEmail(email)

    if (!accountData) {
      req.flash("messages", [{ type: "error", text: "Email not found." }])
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash("messages")
      })
    }

    const isValid = bcrypt.compareSync(password, accountData.account_password)

    if (isValid) {
      req.flash("messages", [{ type: "success", text: "Login successful!" }])
      return res.redirect("/dashboard")
    } else {
      req.flash("messages", [{ type: "error", text: "Incorrect password." }])
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash("messages")
      })
    }

  } catch (error) {
    console.error("Login error:", error)
    req.flash("messages", [{ type: "error", text: "Something went wrong during login." }])
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash("messages")
    })
  }
}

/* ********************************
 * Deliver registration view
 **************************** */
async function buildRegister(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    messages: req.flash("messages")
  })
}

/* ********************************
 * Handle registration form POST
 **************************** */
async function handleRegister(req, res) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  const nav = await utilities.getNav()

  // Check if email already exists
  const existingAccount = await accountModel.getAccountByEmail(account_email)
  if (existingAccount) {
    req.flash("messages", [{ type: "error", text: "Email exists. Please log in or use a different email." }])
    return res.status(409).render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }

  // Hash password
  let hashedPassword
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("messages", [{ type: "error", text: "Error processing password." }])
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }

  // Register account
  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("messages", [{ type: "success", text: `Welcome, ${account_firstname}! Please log in.` }])
      return res.redirect("/account/login")
    } else {
      req.flash("messages", [{ type: "error", text: "Registration failed. Please try again." }])
      return res.redirect("/account/register")
    }

  } catch (error) {
    console.error("Registration error:", error)
    req.flash("messages", [{ type: "error", text: "Something went wrong during registration." }])
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }
}

/* ********************************
 * Export Controller Functions
 **************************** */
module.exports = {
  buildLogin,
  handleLogin,
  buildRegister,
  handleRegister
}
