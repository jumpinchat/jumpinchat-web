const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const chaiAsPromised = require('chai-as-promised');
const { ValidationError } = require('../../../utils/error.util');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('createRoleController', () => {
  let controller;
  let roleUtilsStubs;
  let emitStub;
  let ioStub;
  mock.stopAll();
  const getController = () => mock.reRequire('./createRole.controller');

  beforeEach(() => {
    emitStub = sinon.spy();

    ioStub = {
      to: () => ({
        emit: emitStub,
      }),
    };
    roleUtilsStubs = {
      getSocketIo: () => ioStub,
      getAllRoomRoles: () => Promise.resolve([]),
      getUserHasRolePermissions: sinon.stub().resolves(true),
      validateTag: () => true,
    };
    mock('../role.model', {
      create: role => Promise.resolve(role),
    });
    mock('../role.utils', roleUtilsStubs);
    mock('../../room/room.utils', {
      getRoomByName: sinon.stub().returns(Promise.resolve({
        _id: 'foo',
        attrs: {
          owner: 'bar',
        },
      })),
    });

    controller = getController();
  });

  it('should error if room name is missing', async () => {
    await expect(controller({
      name: undefined,
      roomName: 'foo',
    })).to.be.rejectedWith(ValidationError);

    await expect(controller({
      name: '',
      roomName: 'foo',
    })).to.be.rejectedWith(ValidationError);

    await expect(controller({
      name: ' ',
      roomName: 'foo',
    })).to.be.rejectedWith(ValidationError);
  });

  it('should error if role name is too long', async () => {
    await expect(controller({
      name: new Array(65).fill('a').join(''),
      roomName: 'foo',
    })).to.be.rejectedWith(ValidationError);
  });

  it('should set room owner ID if no user supplied', async () => {
    try {
      const role = await controller({
        name: 'role',
        roomName: 'room',
      });

      expect(role.createdBy).to.equal('bar');
    } catch (err) {
      throw err;
    }
  });

  describe('tag', () => {
    it('should error if tag too long', async () => {
      await expect(controller({
        name: 'Such a role name',
        roomName: 'room',
        tag: new Array(33).fill('a').join(''),
        permissions: {},
      })).to.be.rejectedWith(ValidationError);
    });

    it('should set tag from role name if not supplied', async () => {
      try {
        const role = await controller({
          name: 'Such a role name',
          roomName: 'room',
          permissions: {},
        });

        expect(role.tag).to.equal('such_a_role_name');
      } catch (err) {
        throw err;
      }
    });

    it('should throw an error if tag already exists', async () => {
      mock('../role.utils', {
        ...roleUtilsStubs,
        getAllRoomRoles: () => Promise.resolve([
          {
            tag: 'foo_tag',
          },
        ]),
      });

      controller = getController();

      await expect(controller({
        name: 'Such a role name',
        roomName: 'room',
        tag: 'foo_tag',
      })).to.be.rejectedWith(ValidationError);
    });
  });
});
