/* ********************************
 * Account Controller
 **************************** */
const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
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
      return res.redirect("/account/")
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


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      req.session.account_firstname = accountData.account_firstname
      return res.redirect("/account/")
    }
    
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function authorizeAccountAccess(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("messages", "You must be logged in to access this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.accountData = decoded
    next()
  } catch (err) {
    console.error("JWT verification failed:", err)
    req.flash("messages", "Session expired or invalid. Please log in again.")
    res.redirect("/account/login")
  }
}



async function buildDashboard(req, res) {
  const nav = await utilities.getNav()
  const firstname = req.session.account_firstname || 'User'
  res.render('account/dashboard', {
    title: `Welcome, ${firstname}`,
    nav,
    session: req.session, // 👈 this is the missing piece
    showGreeting: true,
    messages: req.flash(),
    errors: null
  })
}



async function login(req, res) {
  // After validating credentials...
  const account = { id: user.id, account_type: user.account_type, account_firstname: user.firstname }

  const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
  res.cookie("jwt", token, { httpOnly: true })
  res.redirect("/account/dashboard")
}


async function showEditAccount(req, res) {
  if (!res.locals.accountData || !res.locals.accountData.account_id) {
    req.flash("messages", "Account info missing. Please log in again.");
    return res.redirect("/account/login");
  }

  const accountId = res.locals.accountData.account_id;
  const accountData = await accountModel.getAccountById(accountId);
  const nav = await utilities.getNav();

  res.render("account/edit", {
    title: "Edit Account",
    nav,
    accountData,
    messages: req.flash("messages"),
    session: req.session
  });
}


async function showAddClassification(req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash("messages")
  });
}

async function buildManagement(req, res) {
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    messages: req.flash("messages")
  });
}

async function showAccountDashboard(req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData // assuming JWT decoded data is stored here

  res.render("account/dashboard", {
    title: "Account Management",
    nav,
    accountData,
    messages: req.flash("messages"),
    session: req.session
  })
}


async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    const updated = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    if (updated) {
      req.flash("success", "Account information updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("error", "Update failed. Please try again.");
      return res.redirect("/account/edit");
    }
  } catch (err) {
    console.error("Update error:", err);
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { account_id, account_password } = req.body;
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const updated = await accountModel.updatePassword(account_id, hashedPassword);

    if (updated) {
      req.flash("success", "Password updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("error", "Password update failed. Please try again.");
      return res.redirect("/account/edit");
    }
  } catch (err) {
    console.error("Password change error:", err);
    next(err);
  }
}



/* ********************************
 * Export Controller Functions
 **************************** */
module.exports = {
  buildLogin,
  handleLogin,
  buildRegister,
  handleRegister,
  accountLogin,
  buildDashboard,
  authorizeAccountAccess,
  showAddClassification,
  login,
  showEditAccount,
  buildManagement,
  showAccountDashboard,
  updateAccount,
  changePassword
}
