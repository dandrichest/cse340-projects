const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const jwt = require("jsonwebtoken")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = parseInt(req.params.classificationId)
  if (!classification_id) {
    const nav = await utilities.getNav()
    return res.status(400).render("errors/error", {
      title: "Invalid Request",
      message: "Classification ID is required and must be a number.",
      nav
    })
  }
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav(req, res, next)
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    // No need for layout: property, default is set in server.js
  })
}

// Show details for a single vehicle
invCont.buildDetailView = async function(req, res, next) {
  const invId = parseInt(req.params.invId)
  const nav = await utilities.getNav() // <-- get nav
  const vehicle = await invModel.getVehicleById(invId)
  if (!vehicle) {
    return res.status(404).render("inventory/noVehicle", { 
      title: "Vehicle Not Found",
      nav
    })
  }

  const detailHTML = await utilities.buildVehicleDetail(vehicle)
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}` 

  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
    nav, // <-- pass nav!
    vehicle,
    detailHTML // if you use it
  })
}

/* ***************************
 *  Build inventory Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    const flashMessage = req.flash('message');

    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      classificationSelect,
      flashMessage
    });
  } catch (error) {
    next(error);
  }
};

// Add Classification View
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const flashMessage = req.flash('message')

    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      flashMessage
    })
  } catch (error) {
    next(error)
  }
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const regex = /^[a-zA-Z0-9]+$/

  if (!regex.test(classification_name)) {
    req.flash('message', 'Invalid classification name. No spaces or special characters allowed.')
    return res.redirect('/inv/add-classification')
  }

  try {
    await invModel.insertClassification(classification_name)
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    req.flash('message', 'Classification added successfully.')
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      classificationSelect,
      flashMessage: req.flash('message')
    })
  } catch (error) {
    req.flash('message', 'Failed to add classification.')
    res.redirect('/inv/add-classification')
  }
}

invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(); // no argument needed
    const flashMessage = req.flash('message');

    res.render('inventory/add-inventory', {
      title: 'Add Inventory Item',
      nav,
      classificationList,
      flashMessage,
      classification_id: '',
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_miles: '',
      inv_color: ''
    });
  } catch (error) {
    next(error);
  }
};


invCont.addInventory = async function (req, res, next) {
  const vehicleData = req.body;

  try {
    await invModel.insertInventory(vehicleData);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();

    req.flash('message', 'Inventory item added successfully.');
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      classificationList,
      flashMessage: req.flash('message')
    });
  } catch (error) {
    console.error("Add Inventory Error:", error); // 👈 See the real issue
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(vehicleData.classification_id);

    req.flash('message', 'Failed to add inventory item.');
    res.render('inventory/add-inventory', {
      title: 'Add Inventory Item',
      nav,
      classificationList,
      flashMessage: req.flash('message'),
      ...vehicleData
    });
  }
};



/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData.length > 0) {
    return res.json(invData);
  } else {
    return res.json([]); // return empty array instead of throwing error
  }
};


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const invId = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(invId)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/edit-inventory", {
  title: "Edit " + itemName,
  nav,
  classificationSelect,
  flashMessage,
  errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

invCont.viewInventoryByClassification = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)

  try {
    const nav = await utilities.getNav()
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (data.rows.length === 0) {
      req.flash('message', 'No inventory items found for this classification.')
    }

    res.render('inventory/classification-view', {
      title: 'Inventory by Classification',
      nav,
      inventory: data.rows,
      flashMessage: req.flash('message')
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

  invCont.updateVehicle = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  try {
    const updateResult = await invModel.updateInventory({
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })

    if (updateResult) {
      req.flash("notice", `${inv_make} ${inv_model} was successfully updated.`)
      return res.redirect("/inventory/management")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      return res.redirect(`/inv/edit/${inv_id}`)
    }
  } catch (error) {
    console.error("Update error:", error)

    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const flashMessage = req.flash("notice")
    const itemName = `${inv_make} ${inv_model}`

    return res.render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classificationSelect,
      flashMessage,
      errors: [{ msg: "An unexpected error occurred. Please try again." }],
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  }
}



invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  const flashMessage = req.flash("message") // or whatever key you're using

  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    flashMessage
  })
}

// Middleware to protect routes

invCont.authorizeInventoryAccess = async function (req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("messages", "You must be logged in to access inventory management.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const allowedTypes = ["Employee", "Admin"]
    if (!allowedTypes.includes(decoded.account_type)) {
      req.flash("messages", "You do not have permission to access inventory management.")
      return res.redirect("/account/login")
    }

    res.locals.accountData = decoded // optional: make account data available to views
    next()
  } catch (err) {
    console.error("JWT verification failed:", err)
    req.flash("messages", "Session expired or invalid. Please log in again.")
    return res.redirect("/account/login")
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0]?.inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.showAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash("messages")
  })
}


invCont.showEditVehicle = async (req, res) => {
  const invId = parseInt(req.params.id)

  if (isNaN(invId)) {
    req.flash("notice", "Invalid vehicle ID.")
    return res.redirect("/inventory/management")
  }

  const nav = await utilities.getNav()
  const vehicleData = await invModel.getVehicleById(invId)

  if (!vehicleData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inventory/management")
  }

  const classificationSelect = await utilities.buildClassificationList(vehicleData.classification_id)

  res.render("inventory/edit-inventory", {
    title: `Edit ${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    classificationSelect,
    errors: null,
    ...vehicleData
  })
}




  invCont.deleteVehicle = async (req, res) => {
    const invId = req.params.id

    try {
      const result = await invModel.deleteInventoryItem(invId)

      if (result) {
        req.flash("messages", "Vehicle deleted successfully.")
        res.redirect("/inventory/management")
      } else {
        req.flash("messages", "Vehicle deletion failed.")
        res.redirect(`/inventory/edit/${invId}`)
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      req.flash("messages", "An error occurred.")
      res.redirect(`/inventory/edit/${invId}`)
    }
  }


  invCont.showClassification = async (req, res) => {
    const classificationId = req.params.id
    const nav = await utilities.getNav()
    const inventory = await invModel.getInventoryByClassificationId(classificationId)

    if (!inventory || inventory.length === 0) {
      req.flash("messages", "No vehicles found for this classification.")
      return res.redirect("/inventory")
    }

    res.render("inventory/classification", {
      title: "Vehicles by Classification",
      nav,
      inventory,
      messages: req.flash("messages")
    })
  }

  invCont.showVehicleDetail = async function (req, res) {
  const invId = req.params.id
  const nav = await utilities.getNav()
  const vehicle = await invModel.getVehicleById(invId)

  if (!vehicle) {
    req.flash("messages", "Vehicle not found.")
    return res.redirect("/inventory")
  }

  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
    nav,
    vehicle,
    messages: req.flash("messages")
  })
}

invCont.showInventoryDashboard = async (req, res) => {
  try {
    const nav = await require("../utilities").getNav()
    const accountData = res.locals.accountData

    // Fetch classifications
    const result = await invModel.getClassifications()
    const classifications = result.rows

    // Build the select element
    const classificationSelect = `
      <select id="classificationList" name="classification_id">
        <option value="">Choose a Classification</option>
        ${classifications.map(c => `<option value="${c.classification_id}">${c.classification_name}</option>`).join("")}
      </select>
    `

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      accountData,
      messages: req.flash("messages"),
      flashMessage: req.flash("flashMessage"),
      classificationSelect,
      session: req.session
    })
  } catch (error) {
    console.log("✅ Inventory dashboard route hit")
    console.error("Error loading inventory dashboard:", error)
    req.flash("messages", "Unable to load inventory dashboard.")
    res.redirect("/account")
  }
}






module.exports = invCont