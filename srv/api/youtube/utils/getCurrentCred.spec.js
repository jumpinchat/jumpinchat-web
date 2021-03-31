const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

describe('ytApiQuery', () => {
  let redisMock;
  const getController = () => mock.reRequire('./getCurrentCred');
  beforeEach(() => {
    redisMock = {
      callPromise: sinon.stub().returns(Promise.resolve('')),
    };
    mock('../../../utils/redis.util', redisMock);
    mock('../../../config/env', {
      yt: {
        keys: ['foo', 'bar'],
      },
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should set first key if no key in cache', async () => {
    const controller = getController();

    await controller();
    expect(redisMock.callPromise.calledWith('set', 'ytapikey', 'foo')).to.equal(true);
  });

  it('should use the next key if hasExpired set as true', async () => {
    redisMock = {
      callPromise: sinon.stub().withArgs('get').resolves('foo'),
    };
    mock('../../../utils/redis.util', redisMock);
    const controller = getController();

    await controller({ hasExpired: true });
    expect(redisMock.callPromise.calledWith('set', 'ytapikey', 'bar')).to.equal(true);
  });

  it('should use the first key if last key is expired', async () => {
    redisMock = {
      callPromise: sinon.stub().withArgs('get').resolves('bar'),
    };
    mock('../../../utils/redis.util', redisMock);
    const controller = getController();

    await controller({ hasExpired: true });
    expect(redisMock.callPromise.calledWith('set', 'ytapikey', 'foo')).to.equal(true);
  });

  it('should return key from cache if set', async () => {
    redisMock = {
      callPromise: sinon.stub().withArgs('get').resolves('foo'),
    };
    mock('../../../utils/redis.util', redisMock);
    const controller = getController();

    const key = await controller({ hasExpired: false });
    expect(key).to.equal('foo');
  });
});
