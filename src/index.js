const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

app.use(express.json());

// URL del proveedor de claves públicas de Azure AD
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
});

// Función para obtener la clave pública (usada para firmar el token)
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send('Token requerido');
  }

  const tokenWithoutBearer = token.replace('Bearer ', '');

  // Verificar el token
  jwt.verify(tokenWithoutBearer, getKey, {
    algorithms: ['RS256'],
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    audience: clientId,
  }, function (err, decoded) {
    if (err) {
      return res.status(401).send('Token no válido');
    }
    req.user = decoded;
    next();
  });
}

app.get('/protected', verifyToken, (req, res) => {
  console.log(req.user);
  res.send(`Hola ${req.user.name}, tienes acceso!`);
});

app.post('/user', async (req, res) => {
  const email = req.body.email;

  try {
    // Solicitar un token de acceso para Graph API
    const graphTokenResponse = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, new URLSearchParams({
      client_id: clientId,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }));
    const graphToken = graphTokenResponse.data.access_token;
    
    const response = await axios.get(`https://graph.microsoft.com/v1.0/users?$filter=userPrincipalName eq '${email}'`, {
      headers: {
        'Authorization': `Bearer ${graphToken}`
      }
    });
    
    if (response.data.value.length === 0) {
      return res.status(404).send('Correo electrónico no encontrado en el directorio');
    }
    
    // Usuario encontrado
    res.send(response.data.value[0]);
  } catch (error) {
    console.error('Error al verificar el correo electrónico en AD:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(port, () => {
  console.log('Servidor corriendo en el puerto 3000');
});