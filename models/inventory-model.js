const pool = require("../database")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  const sql = 'SELECT * FROM classification ORDER BY classification_name'
  return pool.query(sql)
}

/* ***************************
 *  Get all inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_color, i.inv_image, i.inv_thumbnail, c.classification_name
    FROM inventory i
    JOIN classification c ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_make, i.inv_model
  `
  const result = await pool.query(sql, [classification_id])
  return result.rows
}

/* ***************************
 *  Get vehicle by inventory id (with classification name)
 * ************************** */
async function getVehicleById(invId) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM inventory i
    JOIN classification c ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1
  `
  const result = await pool.query(sql, [invId])
  return result.rows[0]
}

/* ***************************
 *  Get inventory item by ID only
 * ************************** */
async function getInventoryItemById(invId) {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory WHERE inv_id = $1",
      [invId]
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function insertClassification(name) {
  const sql = 'INSERT INTO classification (classification_name) VALUES ($1)'
  return pool.query(sql, [name])
}

/* ***************************
 *  Insert new inventory item
 * ************************** */
async function insertInventory(vehicleData) {
  const sql = `
    INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `
  const data = [
    vehicleData.inv_make,
    vehicleData.inv_model,
    vehicleData.inv_year,
    vehicleData.inv_description,
    vehicleData.inv_image,
    vehicleData.inv_thumbnail,
    vehicleData.inv_price,
    vehicleData.inv_miles,
    vehicleData.inv_color,
    vehicleData.classification_id
  ]

  return await pool.query(sql, data)
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  getInventoryItemById,
  insertClassification,
  insertInventory,
  updateInventory
}
