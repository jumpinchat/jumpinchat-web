const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const chaiAsPromised = require('chai-as-promised');
const { PermissionError } = require('../../../utils/error.util');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('updateRoomRoleController', () => {
  mock.stopAll();
  const getController = () => mock.reRequire('./updateRoomRole.controller');

  let roleModelUpdate;
  let roleUtilStubs;
  let roleCreateStub;
  let emitStub;
  let ioStub;

  beforeEach(() => {
    roleModelUpdate = sinon.stub().resolves({});
    roleCreateStub = sinon.stub().resolves({});
    emitStub = sinon.spy();

    ioStub = {
      to: () => ({
        emit: emitStub,
      }),
    };

    mock('../role.model', {
      update: roleModelUpdate,
    });

    roleUtilStubs = {
      getSocketIo: () => ioStub,
      getAllRoomRoles: () => Promise.resolve([]),
      getUserEnrollments: () => Promise.resolve([]),
      getUserHasRolePermissions: () => Promise.resolve(true),
      validateTag: () => true,
    };
    mock('../role.utils', roleUtilStubs);

    mock('./createRole.controller', roleCreateStub);
    mock('../../room/room.utils', {
      getRoomByName: sinon.stub().returns(Promise.resolve({
        _id: 'foo',
        attrs: {
          owner: 'user',
        },
      })),
    });
  });

  it('should succeed if user has manage role permissions', async () => {
    roleUtilStubs = {
      ...roleUtilStubs,
      getUserEnrollments: () => Promise.resolve([
        {
          role: {
            permissions: {
              manageRoles: true,
            },
          },
        },
      ]),
    };
    mock('../role.utils', roleUtilStubs);
    const controller = getController();

    try {
      await controller({
        roomName: 'foo',
        userId: 'notowner',
        roles: [
          {
            _id: 'newRole',
            name: 'newRole',
            tag: 'tag',
            permissions: {},
          },
        ],
      });
    } catch (err) {
      throw err;
    }
  });

  it('should create new roles if they do not exist', async () => {
    roleUtilStubs = {
      ...roleUtilStubs,
      getAllRoomRoles: () => Promise.resolve([
        {
          _id: 'oldRole',
          permissions: {},
        },
      ]),
    };
    mock('../role.utils', roleUtilStubs);
    const controller = getController();
    try {
      await controller({
        roomName: 'foo',
        userId: 'user',
        roles: [
          {
            _id: 'newRole',
            name: 'newRole',
            tag: 'tag',
            permissions: {},
          },
        ],
      });
    } catch (err) {
      throw err;
    }

    expect(roleCreateStub.callCount).to.equal(1);
  });

  it('should update roles if they exist', async () => {
    roleUtilStubs = {
      ...roleUtilStubs,
      getAllRoomRoles: () => Promise.resolve([
        {
          _id: 'oldRole',
          name: 'oldrole',
          tag: 'tag',
          permissions: {},
        },
      ]),
    };
    mock('../role.utils', roleUtilStubs);
    const controller = getController();
    try {
      await controller({
        roomName: 'foo',
        userId: 'user',
        roles: [
          {
            _id: 'oldRole',
            name: 'oldrole',
            tag: 'tag',
            permissions: {},
          },
        ],
      });
    } catch (err) {
      throw err;
    }

    expect(roleModelUpdate.callCount).to.equal(1);
  });

  it('should update and create roles', async () => {
    roleUtilStubs = {
      ...roleUtilStubs,
      getAllRoomRoles: () => Promise.resolve([
        {
          _id: 'olderRole',
          permissions: {},
        },
        {
          _id: 'oldRole',
          permissions: {},
        },
      ]),
    };
    mock('../role.utils', roleUtilStubs);

    const controller = getController();
    try {
      await controller({
        roomName: 'foo',
        userId: 'user',
        roles: [
          {
            _id: 'oldRole',
            name: 'oldRole',
            tag: 'foo',
            permissions: {},
          },
          {
            _id: 'newRole',
            name: 'newRole',
            tag: 'bar',
            permissions: {},
          },
        ],
      });
    } catch (err) {
      throw err;
    }

    expect(roleModelUpdate.callCount).to.equal(1);
    expect(roleCreateStub.callCount).to.equal(1);
  });
});
