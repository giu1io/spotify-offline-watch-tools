const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const config = path.join(__dirname, './../config/');
const {spotifyKeys} = require(path.join(config, 'config.json'));
const { createServer } = require("http");
const fs = require('fs');

const PORT = 8080;
const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-read-private'],
  state = 'some-state-of-my-choice';

const redirectUri = 'http://localhost:8080/callback';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri,
  clientId: spotifyKeys.clientId,
  clientSecret: spotifyKeys.clientSecret
});

const server = createServer();

const waitForResponse = new Promise((resolve) => {
  server.on("request", (request, response) => {
    const parsedUrl = new URL(`http://localhost${request.url}`);
    if(parsedUrl.searchParams.get('code')) {
        response.end("Application Authorized. Go back to the terminal window!");
        server.close();
        resolve(parsedUrl.searchParams.get('code'));
    }
    else {
      response.end("Something went wrong. Try authorizing the application again.");
    }
  });
});

function prepareServer() {
  return new Promise((resolve, reject) => {
    server.listen(PORT, (error) => {
      if(error) {
        reject(error);
      }
      else {
        resolve();
      }
    });
  })
}

async function auth() {
  await prepareServer();
  // Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  console.log('Open the following URL in your browser:');
  console.log(authorizeURL);

  const code = await waitForResponse;

  const data = await spotifyApi.authorizationCodeGrant(code);
  
  console.log('The token expires in ' + data.body['expires_in']);
  
  const {access_token, refresh_token} = data.body;

  fs.writeFileSync(path.join(config, 'tokens.json'), JSON.stringify({access_token, refresh_token}));

  console.log('Tokens have been saved in the "tokens.json" file. ');
}

auth()
  .catch(error => console.error(error));