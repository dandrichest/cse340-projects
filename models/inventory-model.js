const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = {getClassifications}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT * FROM inventory
    WHERE classification_id = $1
    ORDER BY inv_make, inv_model
  `;
  const result = await pool.query(sql, [classification_id]);
  return result.rows;
}


/* ***************************
 *  Get vehicle by inventory id
 * ************************** */
async function getVehicleById(invId) {
  try {
    const sql = `
      SELECT * 
      FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `
    const result = await pool.query(sql, [invId])
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error:", error)
    throw error
  }
}

async function getInventoryItemById(invId) {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory WHERE inv_id = $1",
      [invId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}


// Insert Classification
async function insertClassification(name) {
  const sql = 'INSERT INTO classification (classification_name) VALUES ($1)'
  return pool.query(sql, [name])
}

// Insert Inventory Item
async function insertInventory(vehicleData) {
  const sql = `
    INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

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
  ];

  return await pool.query(sql, data);
}

// Get Classifications
async function getClassifications() {
  const sql = 'SELECT * FROM classification ORDER BY classification_name'
  return pool.query(sql)
}

// Get Inventory by Classification ID
async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT * FROM inventory
    WHERE classification_id = $1
    ORDER BY make, model
  `
  return pool.query(sql, [classification_id])
}



async function updateInventory(data) {
  try {
    const sql = `
  INSERT INTO inventory (
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *;
`;

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
];

return await pool.query(sql, data);

  } catch (error) {
    return null;
  }
}


module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, getInventoryItemById , updateInventory, insertClassification, insertInventory };
