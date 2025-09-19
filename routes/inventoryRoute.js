// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build the vehicle detail view
router.get("/detail/:invId", invController.buildDetailView);
// intentional error route
router.get("/trigger-error", errorController.throwError)

module.exports = router;