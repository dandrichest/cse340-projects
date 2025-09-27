// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build the vehicle detail view
router.get("/detail/:invId", invController.buildDetailView);
// intentional error route
router.get("/trigger-error", errorController.throwError)
//inventory management.
router.get("/", invController.buildManagementView)
// Route to build the edit inventory item view
router.get("/edit/:invId", utilities.handleErrors(invController.buildEditInventoryView));
// Update inventory item
router.post("/update", utilities.handleErrors(invController.updateInventory));
// Get inventory by classificationId JSON response
router.get("/getInventory/:classification_id", invController.getInventoryJSON)
// Management View
router.get('/management', invController.buildManagementView)
router.get('/inv', invController.buildManagementView);

// Add Classification
router.get('/add-classification', invController.buildAddClassificationView)
router.post('/classification', invController.addClassification)

// Add Inventory
router.get('/add-inventory', invController.buildAddInventoryView)
router.post('/inventory', invController.addInventory)


module.exports = router;