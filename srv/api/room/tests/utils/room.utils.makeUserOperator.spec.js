/* global it,describe */

const { expect } = require('chai');
const makeUserOperator = require('../../utils/room.utils.makeUserOperator');

describe('Make user moderator', () => {
  it('should add a temporary operator', () => {
    const opts = {
      session_token: 'session',
      type: 'temp',
    };

    const result = makeUserOperator(opts);
    expect(result).to.eql({
      assignedBy: null,
      permissions: null,
      session_token: 'session',
    });
  });

  it('should set assignedBy', () => {
    const opts = {
      session_token: 'session',
      type: 'temp',
    };

    const result = makeUserOperator(opts, 'user');
    expect(result).to.eql({
      assignedBy: 'user',
      permissions: null,
      session_token: 'session',
    });
  });
});
