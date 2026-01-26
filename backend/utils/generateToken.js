const jwt = require('jsonwebtoken');

/**
 * generateToken:
 * Creates a signed JSON Web Token (JWT) using the user's unique ID.
 * This token is sent back to the client after a successful login or registration.
 * 
 * @param {string} id - The MongoDB _id of the user.
 * @returns {string} - The signed JWT string.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token remains valid for 30 days
  });
};

module.exports = generateToken;
