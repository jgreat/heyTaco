/**
 * Unit tests on the helpers in helpers.js.
 *
 * @see https://jestjs.io/docs/en/expect
 * @see https://github.com/jest-community/jest-extended#api
 * @author Steven Spiel <stevenspiel@gmail.com>
 */

/* global jest */

'use strict';

const helpers = require( '../src/helpers' );

const MILLISECONDS_TO_SECONDS = 1000;

describe( 'extractCommand', () => {

  const commands = [
    'test-command',
    'something-else',
    'another-command'
  ];

  it( 'returns a valid command from a message containing only that command', () => {
    const message = '<@U12345678> test-command';
    expect( helpers.extractCommand( message, commands ) ).toEqual( 'test-command' );
  });

  it( 'returns a valid command from the start of a message', () => {
    const message = '<@U12345678> test-command would be great';
    expect( helpers.extractCommand( message, commands ) ).toEqual( 'test-command' );
  });

  it( 'returns a valid command from the middle of a message', () => {
    const message = '<@U12345678> can I have a test-command please';
    expect( helpers.extractCommand( message, commands ) ).toEqual( 'test-command' );
  });

  it( 'returns a valid command from the end of a message', () => {
    const message = '<@U12345678> I would love to see a test-command';
    expect( helpers.extractCommand( message, commands ) ).toEqual( 'test-command' );
  });

  it( 'returns the first valid command in a message with multiple', () => {
    const message = '<@U12345678> looking for something-else rather than a test-command';
    expect( helpers.extractCommand( message, commands ) ).toEqual( 'something-else' );
  });

  it( 'returns the first valid command in a message with multiple (with order switched)', () => {
    const message = '<@U12345678> looking for a test-command rather than something-else';
    expect( helpers.extractCommand( message, commands ) ).toEqual( 'test-command' );
  });

  it( 'returns false if it cannot find a valid command in a message', () => {
    const message = '<@U12345678> there is nothing actionable here';
    expect( helpers.extractCommand( message, commands ) ).toBeFalse();
  });

});

describe( 'extractTacoData', () => {
  it( 'extracts a user and amount from the start of a message', () => {
    expect( helpers.extractTacoData( '<@U87654321> :taco: that was awesome' ) ).toEqual(
      ['U87654321']
    );
  });

  it( 'extracts a user and amount from the start of a message', () => {
    expect( helpers.extractTacoData( '<@U87654321>:taco: that was awesome' ) ).toEqual(
      ['U87654321']
    );
  });

  it( 'extracts a user and amount from the start of a message', () => {
    expect( helpers.extractTacoData( '<@U87654321> gets a :taco:' ) ).toEqual(
      ['U87654321']
    );
  });

  it( 'extracts a user and amount from the start of a message', () => {
    expect( helpers.extractTacoData( '<@U87654321> :taco: and <@U87654322> :taco:' ) ).toEqual(
      ['U87654321', 'U87654322']
    );
  });
}); // extractTacoData.

describe( 'getTimeBasedToken', () => {

  it( 'returns a string', () => {
    expect( helpers.getTimeBasedToken( helpers.getTimestamp() ) ).toBeString();
  });

  it( 'throws if a timestamp is not provided', () => {
    expect( () => {
      helpers.getTimeBasedToken();
    }).toThrow();
  });

  it( 'provides a different token if called with a different timestamp', () => {
    const token1 = helpers.getTimeBasedToken( '123456789' );
    const token2 = helpers.getTimeBasedToken( '123123123' );
    expect( token1 ).not.toEqual( token2 );
  });

});

describe( 'getTimestamp', () => {

  it( 'returns an integer', () => {
    expect( helpers.getTimestamp() )
      .toBeNumber()
      .not.toBeString();
  });

  it( 'returns the current unix epoch', () => {
    const now = Math.floor( Date.now() / MILLISECONDS_TO_SECONDS );
    expect( helpers.getTimestamp() ).toBeWithin( now - 5, now + 1 );
  });

});

describe( 'isPlural', () => {

  const table = [
    [ true, -11 ],
    [ true, -2 ],
    [ false, -1 ],
    [ true, 0 ],
    [ false, 1 ],
    [ true, 2 ],
    [ true, 11 ]
  ];

  it.each( table )( 'returns %p for %d', ( result, number ) => {
    expect( helpers.isPlural( number ) ).toBe( result );
  });

});

describe( 'isTimeBasedTokenStillValid', () => {

  it( 'returns true for a token created just now', () => {
    const now = helpers.getTimestamp(),
          token = helpers.getTimeBasedToken( now );

    expect( helpers.isTimeBasedTokenStillValid( token, now ) ).toBeTrue();
  });

  it( 'returns true for a token created an hour ago', () => {
    const now = helpers.getTimestamp(),
          oneHourAgo = now - 60 * 60,
          token = helpers.getTimeBasedToken( oneHourAgo.toString() );

    expect( helpers.isTimeBasedTokenStillValid( token, oneHourAgo.toString() ) ).toBeTrue();
  });

  it( 'returns false for a token created with a different timestamp', () => {
    const now = helpers.getTimestamp(),
          token = helpers.getTimeBasedToken( ( now - 1 ).toString() );

    expect( helpers.isTimeBasedTokenStillValid( token, now ) ).toBeFalse();
  });

  it( 'returns false for a token created in the future', () => {
    const now = helpers.getTimestamp(),
          theFuture = now + 10,
          token = helpers.getTimeBasedToken( theFuture );

    expect( helpers.isTimeBasedTokenStillValid( token, theFuture ) ).toBeFalse();
  });

  it( 'returns false for a token created two days ago', () => {
    const now = helpers.getTimestamp(),
          twoDaysAgo = now - 60 * 60 * 24 * 2,
          token = helpers.getTimeBasedToken( twoDaysAgo.toString() );

    expect( helpers.isTimeBasedTokenStillValid( token, twoDaysAgo.toString() ) ).toBeFalse();
  });

}); // IsTimeBasedTokenStillValid.

describe( 'isUser', () => {

  it( 'returns true for a Slack user ID', () => {
    expect( helpers.isUser( 'U00000000' ) ).toBeTrue();
  });

  it( 'returns false for something other than a Slack user ID', () => {
    expect( helpers.isUser( 'SomethingRandom' ) ).toBeFalse();
  });

});

describe( 'maybeLinkItem', () => {

  it( 'returns an item as-is if it is not a Slack user ID', () => {
    const item = 'something';
    expect( helpers.maybeLinkItem( item ) ).toBe( item );
  });

  it( 'returns an item linked with Slack mrkdwn if it looks like a Slack user ID', () => {
    const item = 'U12345678';
    expect( helpers.maybeLinkItem( item ) ).toBe( '<@' + item + '>' );
  });

}); // MaybeLinkItem.
