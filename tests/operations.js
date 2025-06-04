/**
 * Unit tests on operations.js.
 *
 * @see https://jestjs.io/docs/en/expect
 * @see https://github.com/jest-community/jest-extended#api
 * @author Steven Spiel <stevenspiel@gmail.com>
 */

/* global jest */

'use strict';

const operations = require( '../src/operations' );

it( 'exports constants for operations', () => {
  expect( operations.operations )
    .toBeObject()
    .toHaveProperty( 'PLUS' )
    .toHaveProperty( 'SELF' );
});

describe( 'getOperationName', () => {

  it( 'returns \'plus\' when given +', () => {
    expect( operations.getOperationName( '+' ) ).toBe( 'plus' );
  });

  it( 'returns false when given an invalid operation', () => {
    expect( operations.getOperationName( 'some invalid operation' ) ).toBeFalse();
  });

});
