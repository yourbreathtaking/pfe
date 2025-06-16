// netlify/functions/proxy-wms.js
const fetch = require('node-fetch'); // Si Node.js < 18, sinon fetch est global

exports.handler = async function(event, context) {
  const { path, queryStringParameters } = event;

  // Reconstruire le chemin GeoServer à partir de la requête Netlify Function
  // Exemple: /geoserver/Midelt/wms
  const geoserverPath = path.replace('/.netlify/functions/proxy-wms', '');

  // Adresse IP de votre VM GeoServer sur GCP
  const geoserverBaseUrl = 'http://34.82.90.5:8080'; // Utilisation de HTTP ici

  // Reconstruire l'URL complète de GeoServer
  const geoserverUrl = `<span class="math-inline">\{geoserverBaseUrl\}</span>{geoserverPath}?${new URLSearchParams(queryStringParameters).toString()}`;

  try {
    const response = await fetch(geoserverUrl);

    // Vérifiez si la requête GeoServer a réussi
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `GeoServer responded with status ${response.status}`,
      };
    }

    // Pour les images WMS, il faut retourner le binaire directement
    const buffer = await response.buffer(); // Obtenir le corps de la réponse comme un buffer

    // Assurez-vous de renvoyer le bon Content-Type
    const contentType = response.headers.get('Content-Type');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType || 'image/png', // Par défaut image/png si non défini
        'Access-Control-Allow-Origin': '*', // CORS pour autoriser votre frontend Netlify
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: buffer.toString('base64'), // Le corps doit être en base64 pour Netlify Functions
      isBase64Encoded: true, // Indiquer que le corps est en base64
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to proxy WMS request', details: error.message }),
    };
  }
};