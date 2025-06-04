/**
 * HeyTaco
 * Employee recognition on Slack! 😉
 *
 * @see https://github.com/stevenspiel/heyTaco
 * @see https://expressjs.com/en/4x/api.html
 * @author Steven Spiel <stevenspiel@gmail.com>
 */

'use strict';

const app = require( './src/app' ),
      slack = require( './src/slack' );

const fs = require( 'fs' ),
      mime = require( 'mime' ),
      express = require( 'express' ),
      bodyParser = require( 'body-parser' ),
      slackClient = require( '@slack/client' );

/* eslint-disable no-process-env, no-magic-numbers */
const PORT = process.env.PORT || 8080;
// eslint-disable-next-line id-length
const SLACK_BOT_USER_OAUTH_ACCESS_TOKEN = process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN;
/* eslint-enable no-process-env, no-magic-numbers */

process.on ( 'warning', ( warning ) => {
  console.warn( warning.name ); // 'Warning'
  console.warn( warning.message ); // 'Something happened!'
  console.warn( warning.stack ); // Stack trace
  console.log( '----------------------------' );
});

/**
 * Starts the server and bootstraps the app.
 *
 * @returns {http.Server} A Node.js http.Server Object as returned by Express' listen method. See
 *                        https://expressjs.com/en/4x/api.html#app.listen and
 *                        https://nodejs.org/api/http.html#http_class_http_server for details.
 */
const start = () => {
  const server = express();
  slack.setSlackClient( new slackClient.WebClient( SLACK_BOT_USER_OAUTH_ACCESS_TOKEN ) );

  server.use( bodyParser.json() );
  server.enable( 'trust proxy' );
  server.get( '/', app.handleGet );
  server.post( '/', app.handlePost );

  // Static assets.
  server.get( '/assets/*', ( request, response ) => {
    const path = 'src/' + request._parsedUrl.path,
          type = mime.getType( path );

    response.setHeader( 'Content-Type', type );
    response.send( fs.readFileSync( path ) );
  });

  // Additional routes.
  server.get( '/leaderboard', app.handleGet );

  return server.listen( PORT, () => {
    console.log( 'App HeyTaco listening on port ' + PORT + '.' );
  });

};

start();
