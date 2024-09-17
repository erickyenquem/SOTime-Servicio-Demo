const jwt = require('jsonwebtoken');
const { getKey } = require('../utils/jwtHelper');
const { tenantId, clientId } = require('../config');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send('Token requerido');
  }

  const tokenWithoutBearer = token.replace('Bearer ', '');

  jwt.verify(tokenWithoutBearer, getKey, {
    algorithms: ['RS256'],
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    audience: clientId,
  }, (err, decoded) => {
    if (err) {
      return res.status(401).send('Token no válido');
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;