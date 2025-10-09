const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")

router.get("/inv/detail/:inv_id/reviews", reviewController.showReviews)
router.post("/inv/detail/:inv_id/reviews", reviewController.submitReview)

module.exports = router