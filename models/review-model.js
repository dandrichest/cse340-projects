const pool = require("../database/")

/* Get all reviews for a vehicle */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = "SELECT * FROM review WHERE inv_id = $1 ORDER BY review_date DESC"
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    throw error
  }
}

/* Add a new review */
async function addReview(inv_id, reviewer_name, review_text, review_rating) {
  try {
    const sql = `
      INSERT INTO review (inv_id, reviewer_name, review_text, review_rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *`
    const result = await pool.query(sql, [inv_id, reviewer_name, review_text, review_rating])
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

module.exports = { getReviewsByInvId, addReview }