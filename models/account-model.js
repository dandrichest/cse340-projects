const pool = require("../database")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

// Get account by email
async function getAccountByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM account WHERE account_email = $1',
      [email]
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

// Insert inventory item
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


module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, insertInventory}