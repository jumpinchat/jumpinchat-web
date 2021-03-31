const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const chaiAsPromised = require('chai-as-promised');
const { NotFoundError } = require('../../../utils/error.util');

chai.use(chaiAsPromised);

const { expect } = chai;

const getController = () => mock.reRequire('./getUserRoles.controller');

describe('addUserToRoleController', () => {
  let controller;
  let room;
  beforeEach(() => {
    room = {
      _id: 'roomId',
      attrs: {
        owner: 'bar',
      },
      users: [
        {
          _id: 'foo',
          session_id: 'session',
          ip: '1.2.3.4',
        },
      ],
    };


    mock('../role.utils', {
      getUserEnrollments: () => Promise.resolve([]),
    });

    mock('../../room/room.utils', {
      getRoomByName: sinon.stub().returns(Promise.resolve(room)),
    });

    controller = getController();
  });

  it('should return NotFoundError if room not found', async () => {
    room = null;

    mock('../../room/room.utils', {
      getRoomByName: sinon.stub().returns(Promise.resolve(room)),
    });

    controller = getController();
    await expect(controller({
      userListId: 'foo',
      roomName: 'room',
    })).to.be.rejectedWith(NotFoundError);
  });

  it('should return NotFoundError if user not found', async () => {
    await expect(controller({
      userListId: 'bar',
      roomName: 'room',
    })).to.be.rejectedWith(NotFoundError);
  });
});
