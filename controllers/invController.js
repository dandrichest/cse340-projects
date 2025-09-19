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



module.exports = invCont