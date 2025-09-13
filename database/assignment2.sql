-- Insert a new record into the account table
INSERT INTO "account" (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

UPDATE "account" SET account_type = 'Admin' WHERE account_firstname = 'Troy';

DELETE FROM "account" WHERE account_firstname = 'Troy';

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors','a huge interior');

SELECT
    inv_make,
    inv_model
FROM
    inventory
INNER JOIN classification
    ON classification_name = 'Sport';

UPDATE inventory
SET 
  inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');