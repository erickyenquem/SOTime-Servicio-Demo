const jwksClient = require('jwks-rsa');
const { tenantId } = require('../config');

// Cliente para obtener las claves de Azure AD
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
});

// Función para obtener la clave de firma del token
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

module.exports = { getKey };