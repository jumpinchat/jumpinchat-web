import Store from '../Store';
import { RoleDispatcher } from '../../dispatcher/AppDispatcher';
import * as types from '../../constants/ActionTypes';

export class RoleStore extends Store {
  constructor() {
    super('RoleStore');

    this.state = {
      roles: [],
      enrollments: [],
      userAddError: null,
    };
  }

  editRole(role) {
    const { _id: roleId, ...roleData } = role;
    this.state = {
      ...this.state,
      roles: this.state.roles.map((r) => {
        if (r._id === roleId) {
          return {
            ...r,
            ...roleData,
          };
        }

        return r;
      }),
    };
  }

  setRoles(roles) {
    this.state = {
      ...this.state,
      roles: roles.sort((a, b) => a.order > b.order),
    };
  }

  removeRole(roleId) {
    this.state = {
      ...this.state,
      roles: this.state.roles.filter(r => r._id !== roleId),
    };
  }

  setRoomEnrollments(enrollments) {
    this.state = {
      ...this.state,
      enrollments,
    };
  }

  setEnrollError(error) {
    this.state = {
      ...this.state,
      userAddError: error,
    };
  }
}

const roleStore = new RoleStore();

RoleDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case types.ROLE_UPDATE:
      roleStore.editRole(action.role);
      break;
    case types.ROLES_SET:
      roleStore.setRoles(action.roles);
      break;
    case types.ROLES_REMOVE:
      roleStore.removeRole(action.roleId);
      break;
    case types.ENROLLMENTS_SET:
      roleStore.setRoomEnrollments(action.enrollments);
      break;
    case types.ENROLLMENT_USER_ADD_FAILED:
      roleStore.setEnrollError(action.error);
      break;
    default:
      return true;
  }

  roleStore.emitChange();
  return true;
});

export default roleStore;
