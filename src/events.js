/**
 * Handles incoming events, using Slack's Events API. See also send.js, which handles outgoing
 * messages sent back to Slack.
 *
 * @see https://api.slack.com/events-api
 */

'use strict';

const slack = require( './slack' ),
      points = require( './points' ),
      helpers = require( './helpers' ),
      messages = require( './messages' ),
      operations = require( './operations' ),
      leaderboard = require( './leaderboard' );

const camelCase = require( 'lodash.camelcase' );

/**
 * Handles an attempt by a user to 'self taco' themselves, which includes both logging the attempt
 * and letting the user know it wasn't successful.
 *
 * @param {string} user    The ID of the user (Uxxxxxxxx) who tried to self taco.
 * @param {object} event  A hash of a validated Slack 'message' event. See the documentation at
 *                        https://api.slack.com/events-api#events_dispatched_as_json and
 *                        https://api.slack.com/events/message for details.
 * @return {Promise} A Promise to send a Slack message back to the requesting channel.
 */
const handleSelfTaco = ( user, event ) => {
  console.log( user + ' tried to taco themselves' );
  const message = messages.getRandomMessage( operations.operations.SELF, user );
  return slack.sendMessage( message, event ).catch( ( error ) => {
    console.error( 'Error handling self taco: ' + error );
  } );
};

/**
 * Handles a 🌮 of a user, and then notifies the channel of the new score.
 *
 * @param {string} item      The Slack user ID (if user) or name (if thing) of the item being
 *                           operated on.
 * @param {object} event  A hash of a validated Slack 'message' event. See the documentation at
 *                        https://api.slack.com/events-api#events_dispatched_as_json and
 *                        https://api.slack.com/events/message for details.
 * @return {Promise} A Promise to send a Slack message back to the requesting channel after the
 *                   points have been updated.
 */
const handleTaco = async( item, event ) => {
  const score = await points.updateScore( item ),
        message = messages.getRandomMessage( operations.operations.PLUS, item, score );

  return slack.sendMessage( message, event ).catch( ( error ) => {
    console.error( 'Error handling taco: ' + error );
  } );
};

/**
 * Sends a random thank-you message to the requesting channel.
 *
 * @param {object} event   A hash of a validated Slack 'app_mention' event. See the docs at
 *                         https://api.slack.com/events-api#events_dispatched_as_json and
 *                         https://api.slack.com/events/app_mention for details.
 * @returns {Promise} A Promise to send the Slack message.
 */
const sayThanks = ( event ) => {

  const thankYouMessages = [
    'Don\'t mention it!',
    'You\'re welcome.',
    'No thank YOU!',
    (
      ':taco: for taking the time to say thanks!\n...' +
      'just kidding, I can\'t :taco: you. But it\'s the thought that counts, right??'
    )
  ];

  const randomKey = Math.floor( Math.random() * thankYouMessages.length ),
        message = '<@' + event.user + '> ' + thankYouMessages[ randomKey ];

  return slack.sendMessage( message, event ).catch( ( error ) => {
    console.error( 'Error saying thanks: ' + error );
  } );

};

/**
 * Sends a help message, explaining the bot's commands, to the requesting channel.
 *
 * @param {object} event   A hash of a validated Slack 'app_mention' event. See the docs at
 *                         https://api.slack.com/events-api#events_dispatched_as_json and
 *                         https://api.slack.com/events/app_mention for details.
 * @returns {Promise} A Promise to send the Slack message.
 */
const sendHelp = ( event ) => {

  const message = (
    'Sure, here\'s what I can do:\n\n' +
    '• `@someone 🌮`: Adds a taco to @someone\n' +
    '• `@HeyTaco leaderboard`: Display the leaderboard\n' +
    '• `@HeyTaco help`: Display this message\n\n' +
    'You\'ll need to invite me to a channel before I can recognize ' +
    ':taco: commands in it.'
  );

  return slack.sendMessage( message, event ).catch( ( error ) => {
    console.error( 'Error sending help: ' + error );
  } );

};

const handlers = {

  /**
   * Handles standard incoming 'message' events sent from Slack.
   *
   * Assumes basic validation has been done before receiving the event. See handleEvent().
   *
   * @param {object} event  A hash of a validated Slack 'message' event. See the documentation at
   *                        https://api.slack.com/events-api#events_dispatched_as_json and
   *                        https://api.slack.com/events/message for details.
   * @return {Promise} A Promise to send a Slack message back to the requesting channel.
   */
  message: async( event ) => {
    // Extract the relevant data from the message text.
    const users = helpers.extractTacoData( event.text );

    return Promise.all(users.map(async (user) => {
      // Bail if the user is trying to Taco themselves...
      if ( user === event.user ) {
        return handleSelfTaco( event.user, event );
      }

      // Otherwise, let's go!
      return handleTaco( user, event );
    }))
  }, // Message event.

  /**
   * Handles 'app_mention' events sent from Slack, primarily by looking for known app commands, and
   * then handing the command off for processing.
   *
   * @param {object} event   A hash of a validated Slack 'app_mention' event. See the docs at
   *                         https://api.slack.com/events-api#events_dispatched_as_json and
   *                         https://api.slack.com/events/app_mention for details.
   * @return {boolean|Promise} Either `false` if the event cannot be handled, or a Promise - usually
   *                        to send a Slack message back to the requesting channel - which will be
   *                        handled by the command's own handler.
   */
  appMention: ( event ) => {

    const appCommandHandlers = {
      leaderboard: leaderboard.handler,
      help: sendHelp,
      thx: sayThanks,
      thanks: sayThanks,
      thankyou: sayThanks,
      'thank you': sayThanks,
      'Thank you': sayThanks,
      ':thumbsup:': sayThanks
    };

    const validCommands = Object.keys( appCommandHandlers ),
          appCommand = helpers.extractCommand( event.text, validCommands );

    if ( appCommand ) {
      return appCommandHandlers[appCommand]( event );
    }

    const defaultMessage = (
      'Sorry, I\'m not quite sure what you\'re asking me. I\'m not very smart - there are only a ' +
      'few things I\'ve been trained to do. Send me `help` for more details.'
    );

    return slack.sendMessage( defaultMessage, event );

  }
};

/**
 * Determines whether incoming events from Slack can be handled by this app, and if so,
 * passes the event off to its handler function.
 *
 * @param {object} event   A hash of a Slack event. See the documentation at
 *                         https://api.slack.com/events-api#events_dispatched_as_json and
 *                         https://api.slack.com/events/message for details.
 * @return {boolean|Promise} Either `false` if the event cannot be handled, or a Promise as returned
 *                        by the event's handler function.
 */
const handleEvent = ( event ) => {

  // If the event has no type, something has gone wrong.
  if ( 'undefined' === typeof event.type ) {
    console.warn( 'Event data missing' );
    return false;
  }

  // If the event has a subtype, we don't support it.
  // TODO: We could look at this in the future, in particular, the bot_message subtype, which would
  //       allow us to react to messages sent by other bots. However, we'd have to be careful to
  //       filter appropriately, because otherwise we'll also react to messages from ourself.
  //       Because the 'help' output contains commands in it, that could look interesting!
  if ( 'undefined' !== typeof event.subtype ) {
    console.warn( 'Unsupported event subtype: ' + event.subtype );
    return false;
  }

  // If there's no text with the event, there's not a lot we can do.
  if ( 'undefined' === typeof event.text || ! event.text.trim() ) {
    console.warn( 'Event text missing' );
    return false;
  }

  // Don't respond to bots (especially THIS bot, which could cause an infinite loop)
  if ( event.bot_id ) {
    return false;
  }

  // Providing we have a handler for the event, let's handle it!
  const eventName = camelCase( event.type );
  if ( handlers[ eventName ] instanceof Function ) {
    return handlers[ eventName ] ( event );
  }

  console.warn( 'Invalid event received: ' + event.type );
  return false;

};

module.exports = {
  handleSelfTaco,
  handleTaco,
  sayThanks,
  sendHelp,
  handlers,
  handleEvent
};
