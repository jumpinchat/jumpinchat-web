const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const chaiAsPromised = require('chai-as-promised');
const config = require('../../../config/env');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('selectJanusServer', () => {
  const getController = () => mock.reRequire('./selectJanusServer');
  beforeEach(() => {
    const avgVals = {
      [config.janus.serverIds[0]]: { average: 5, total: 10 },
      [config.janus.serverIds[1]]: { average: 10, total: 20 },
      [config.janus.serverIds[2]]: { average: 20, total: 30 },
      [config.janus.serverIds[3]]: { average: 20, total: 100 },
    };

    mock('./getAvgUsersInRoom', server => Promise.resolve(avgVals[server]));
  });

  it('should pick server with lowest user average', async () => {
    const controller = getController();

    let val;
    try {
      val = await controller();
    } catch (err) {
      throw err;
    }

    expect(val).to.equal(config.janus.serverIds[0]);
  });

  it('should work when some values are zero', async () => {
    const avgVals = {
      [config.janus.serverIds[0]]: { average: 5, total: 10 },
      [config.janus.serverIds[1]]: { average: 10, total: 20 },
      [config.janus.serverIds[2]]: { average: 0, total: 0 },
      [config.janus.serverIds[3]]: { average: 0, total: 0 },
    };

    mock('./getAvgUsersInRoom', server => Promise.resolve(avgVals[server]));
    const controller = getController();

    let val;
    try {
      val = await controller();
    } catch (err) {
      throw err;
    }

    expect(val).to.equal('janus3');
  });
});
