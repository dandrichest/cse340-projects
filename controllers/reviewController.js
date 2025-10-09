const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

/* Show reviews and form for a vehicle */
async function showReviews(req, res) {
  const inv_id = req.params.inv_id
  const nav = await utilities.getNav() // <-- get nav
  const vehicle = await invModel.getVehicleById(inv_id)
  if (!vehicle) return res.status(404).render("errors/error", { title: "Not Found", message: "Vehicle not found." })

  const reviews = await reviewModel.getReviewsByInvId(inv_id)
  res.render("review", {
    title: `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav, // <-- pass nav!
    vehicle,
    reviews,
    errors: [],
    form: {}
  })
}

/* Handle review submission */
async function submitReview(req, res) {
  const inv_id = req.params.inv_id
  const nav = await utilities.getNav() // <-- get nav
  const { reviewer_name, review_text, review_rating } = req.body
  const errors = []

  // Validation
  if (!reviewer_name || reviewer_name.trim().length < 2) errors.push("Name is required.")
  if (!review_text || review_text.trim().length < 5) errors.push("Review text is required.")
  if (!review_rating || isNaN(review_rating) || review_rating < 1 || review_rating > 5) errors.push("Rating must be 1-5.")

  if (errors.length) {
    const vehicle = await invModel.getInventoryByInvId(inv_id)
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    return res.render("review", {
      title: `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav, // <-- pass nav!
      vehicle,
      reviews,
      errors,
      form: { reviewer_name, review_text, review_rating }
    })
  }

  await reviewModel.addReview(inv_id, reviewer_name.trim(), review_text.trim(), parseInt(review_rating))
  res.redirect(`/inv/detail/${inv_id}/reviews`)
}

module.exports = { showReviews, submitReview }