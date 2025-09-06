exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { code, code_verifier, redirect_uri } = JSON.parse(event.body);
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

    // A check to make sure the environment variable is set in Netlify
    if (!CLIENT_ID) {
      throw new Error("SPOTIFY_CLIENT_ID environment variable not set.");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        code_verifier: code_verifier,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Spotify API Error:', errorBody);
      return { statusCode: response.status, body: JSON.stringify(errorBody) };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ access_token: data.access_token }),
    };
  } catch (error) {
    console.error('Internal Server Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};