const moment = require('moment-timezone');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const { types } = require('./trophies');

describe('trophyUtils', () => {
  let momentMock;
  const trophyModel = {
    find: sinon.stub().yields(null, {
      exec: sinon.stub().yields(null),
    }),
  };
  let userUtils;

  const trophies = [
    {
      type: types.TYPE_OCCASION,
      conditions: {
        date: {
          day: 1,
          month: 1,
          year: 2018,
        },
      },
    },
    {
      type: types.TYPE_MEMBER_DURATION,
      conditions: {
        duration: {
          years: 1,
        },
      },
    },
    {
      type: 'foo',
    },
  ];

  function getController(overrides = {}) {
    const mocks = {
      'moment-timezone': overrides.momentMock || momentMock,
      './trophy.model': Object.assign(trophyModel, overrides.trophyModel),
      '../user/user.utils': Object.assign(userUtils, overrides.userUtils),
      '../message/utils/metaSendMessage.util': sinon.stub().returns(Promise.resolve()),
    };

    return proxyquire('./trophy.utils.js', mocks);
  }

  beforeEach(() => {
    momentMock = moment;
    momentMock.prototype = () => moment('2018-01-01T00:00:00.000Z');
    sinon.useFakeTimers(new Date('2018-01-01T00:00:00.000Z').getTime());

    userUtils = {
      getUserById: sinon.stub().yields(null, {}),
    };
  });

  describe('checkDateMatchesCondition', () => {
    it('should return true if date and month matches', () => {
      const { checkDateMatchesCondition } = getController({
        momentMock,
      });

      const condition = {
        date: 1,
        month: 1,
      };

      expect(checkDateMatchesCondition(condition)).to.equal(true);
    });

    it('should return true if date, month and year matches', () => {
      const { checkDateMatchesCondition } = getController({
        momentMock,
      });

      const condition = {
        date: 1,
        month: 1,
        year: 2018,
      };

      expect(checkDateMatchesCondition(condition)).to.equal(true);
    });

    it('should return false if date does not match', () => {
      const { checkDateMatchesCondition } = getController();

      const condition = {
        date: 10,
        month: 1,
      };

      expect(checkDateMatchesCondition(condition)).to.equal(false);
    });

    it('should return false if month does not match', () => {
      const { checkDateMatchesCondition } = getController();

      const condition = {
        date: 1,
        month: 10,
      };

      expect(checkDateMatchesCondition(condition)).to.equal(false);
    });

    it('should return false if year does not match', () => {
      const { checkDateMatchesCondition } = getController();

      const condition = {
        date: 1,
        month: 1,
        year: 2019,
      };

      expect(checkDateMatchesCondition(condition)).to.equal(false);
    });
  });

  describe('checkMembershipDuration', () => {
    it('should return an array of applicable trophies', () => {
      const { checkMembershipDuration } = getController();

      const joinDate = new Date('2016-01-01T00:00:00.000Z');

      expect(checkMembershipDuration(joinDate, trophies)).to.eql([trophies[1]]);
    });
  });

  describe('checkOccasion', () => {
    it('should return occasion matching current date', () => {
      const { checkOccasion } = getController({
        momentMock,
      });

      expect(checkOccasion(trophies)).to.eql([trophies[0]]);
    });

    it('should return occasion matching current date if in tz range', () => {
      sinon.useFakeTimers(new Date('2017-12-31T18:00:00.000Z').getTime());
      const { checkOccasion } = getController({
        momentMock,
      });

      expect(checkOccasion(trophies)).to.eql([trophies[0]]);
    });
  });

  describe('dedupe', () => {
    it('should not remove unique trophies', async () => {
      userUtils = {
        getUserById: sinon.stub().returns(Promise.resolve({
          trophies: [
            {
              trophyId: 'foo',
            },
            {
              trophyId: 'bar',
            },
          ],
          save: sinon.stub().returns(Promise.resolve()),
        })),
      };

      const { dedupe } = getController({ userUtils });
      const res = await dedupe('foo');
      expect(res).to.eql([
        {
          trophyId: 'foo',
        },
        {
          trophyId: 'bar',
        },
      ]);
    });

    it('should remove duplicate trophies', async () => {
      userUtils = {
        getUserById: sinon.stub().returns(Promise.resolve({
          trophies: [
            {
              trophyId: 'foo',
            },
            {
              trophyId: 'bar',
            },
            {
              trophyId: 'bar',
            },
          ],
          save: sinon.stub().returns(Promise.resolve()),
        })),
      };

      const { dedupe } = getController({ userUtils });
      const res = await dedupe('foo');
      expect(res).to.eql([
        {
          trophyId: 'foo',
        },
        {
          trophyId: 'bar',
        },
      ]);
    });
  });
});
