// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")
const utilities = require("../utilities/")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build the vehicle detail view
router.get("/detail/:invId", invController.buildDetailView);
// intentional error route
router.get("/trigger-error", errorController.throwError)
// Route to build the edit inventory item view
//router.get("/edit/:invId", utilities.handleErrors(invController.showEditVehicle));

// Get inventory by classificationId JSON response
router.get("/getInventory/:classification_id", invController.getInventoryJSON)


// Add Classification
router.post('/classification', invController.addClassification)

// Add Inventory
router.get('/add-inventory', invController.buildAddInventoryView)

// Management View
router.get('/inv', invController.buildManagementView);
router.get("/inv/", invController.showInventoryDashboard);
router.get("/management", invController.authorizeInventoryAccess, invController.showInventoryDashboard)
// Update Inventory Item
router.post("/update", utilities.handleErrors(invController.updateInventory));
//inventory management.
router.get("/", invController.showInventoryDashboard)



router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Protected routes
router.get("/add-classification", invController.authorizeInventoryAccess, invController.showAddClassification)
router.post("/add-classification", invController.authorizeInventoryAccess, invController.addClassification)

router.get("/edit/:id", invController.authorizeInventoryAccess, invController.showEditVehicle)
//router.post("/edit/:id", invController.authorizeInventoryAccess, invController.updateVehicle)
//


router.post("/delete/:id", invController.authorizeInventoryAccess, invController.deleteVehicle)

// Public routes (no middleware)
router.get("/classification/:id", invController.showClassification)
router.get("/detail/:id", invController.showVehicleDetail)




module.exports = router;