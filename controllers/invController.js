const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
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
  const vehicle = await invModel.getVehicleById(invId)

  if (!vehicle) {
    const nav = await utilities.getNav()
    return res.status(404).render("inventory/noVehicle", { 
      title: "Vehicle Not Found",
      nav
    })
  }

  const detailHTML = await utilities.buildVehicleDetail(vehicle)
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}` 
  const nav = await utilities.getNav()

  res.render("inventory/detail", { 
    title,
    detailHTML,
    nav
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
  const itemData = await invModel.getInventoryById(invId)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
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



invCont.updateInventory = async function (req, res, next) {
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
  } = req.body;

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
  });

  if (updateResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.redirect(`/inv/edit/${inv_id}`);
  }
};


module.exports = invCont