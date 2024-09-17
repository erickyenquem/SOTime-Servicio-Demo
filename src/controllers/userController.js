const axios = require('axios');
const { tenantId, clientId, clientSecret } = require('../config');

// Función para obtener el token de Graph API
async function getGraphApiToken() {
  const response = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, new URLSearchParams({
    client_id: clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  }));
  return response.data.access_token;
}

// Verificar si el correo electrónico está en Azure AD
async function verifyUserEmail(req, res) {
  const { email } = req.body;

  try {
    const graphToken = await getGraphApiToken();
    const response = await axios.get(`https://graph.microsoft.com/v1.0/users?$filter=userPrincipalName eq '${email}'`, {
      headers: { 'Authorization': `Bearer ${graphToken}` }
    });

    if (response.data.value.length === 0) {
      return res.status(404).send('Correo electrónico no encontrado en el directorio');
    }
    
    res.send(response.data.value[0]);
  } catch (error) {
    console.error('Error al verificar el correo electrónico en AD:', error);
    res.status(500).send('Error interno del servidor');
  }
}

module.exports = {
  verifyUserEmail,
};