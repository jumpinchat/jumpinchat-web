const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

describe('ytApiQuery', () => {
  let requestStub;
  const getController = () => mock.reRequire('./ytApiQuery');
  beforeEach(() => {
    requestStub = sinon.stub().yields(null, { statusCode: 200 }, { items: [] });
    mock('request', requestStub);
    mock('./getCurrentCred', () => Promise.resolve('foo'));
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('it should call api with correct key', async () => {
    const controller = getController();

    try {
      await controller('http://api', {});
    } catch (err) {
      throw err;
    }

    expect(requestStub.firstCall.args[0]).to.eql({
      method: 'GET',
      url: 'http://api?key=foo',
      json: true,
    });
  });

  it('should reject with provider error if yt quota error', async () => {
    requestStub = sinon.stub().yields(null, { statusCode: 429 }, {
      error: {
        errors: [{
          reason: 'dailyLimitExceeded',
        }],
      },
    });

    mock('request', requestStub);
    const controller = getController();

    try {
      await controller('foo', {});
      throw new Error('no error happened');
    } catch (err) {
      expect(err.name).to.equal('ExternalProviderError');
    }
  });

  it('should resolve with item array', async () => {
    const controller = getController();

    try {
      const result = await controller('foo', {});
      expect(result).to.eql([]);
    } catch (err) {
      throw err;
    }
  });
});
