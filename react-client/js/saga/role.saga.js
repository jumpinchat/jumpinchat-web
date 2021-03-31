import request from 'superagent';
import { RoleDispatcher } from '../dispatcher/AppDispatcher';
import roleStore from '../stores/RoleStore';
import roomStore from '../stores/RoomStore';
import * as roleActions from '../actions/RoleActions';
import { addNotification } from '../actions/NotificationActions';
import * as types from '../constants/ActionTypes';
import { ALERT_COLORS } from '../constants/AlertMap';

function handleRequestError(response) {
  if (response.text) {
    return addNotification({
      color: ALERT_COLORS.ERROR,
      message: response.text,
    });
  }

  if (response.body) {
    return addNotification({
      color: ALERT_COLORS.ERROR,
      message: response.body,
    });
  }

  return addNotification({
    color: ALERT_COLORS.ERROR,
    message: 'Request error',
  });
}

function fetchRoles(action) {
  const roomName = action.roomName || roomStore.getRoom().name;
  request
    .get(`/api/role/room/${roomName}/all`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: err.message,
        });
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      return roleActions.setRoles(response.body);
    });
}

function saveRoles({ roles }) {
  const roomName = roomStore.getRoom().name;
  // remove temp IDs from new roles
  const filteredRoles = roles.map((role) => {
    if (role.new) {
      return {
        ...role,
        _id: undefined,
      };
    }

    return role;
  });

  request
    .put(`/api/role/room/${roomName}`, { roles: filteredRoles })
    .end((err, response) => {
      if (err) {
        if (response) {
          return handleRequestError(response);
        }

        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: err.message,
        });
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      addNotification({
        color: ALERT_COLORS.SUCCESS,
        message: 'Roles updated',
      });
      return roleActions.setRoles(response.body);
    });
}

function removeRole({ roleId }) {
  const { roles } = roleStore.getState();
  const roomName = roomStore.getRoom().name;
  const role = roles.find(r => r._id === roleId);

  if (role && (role.new || role.permanent)) {
    return false;
  }

  return request
    .delete(`/api/role/room/${roomName}/role/${roleId}`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: err.message,
        });
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      return addNotification({
        color: ALERT_COLORS.SUCCESS,
        message: 'Roles updated',
      });
    });
}

function getEnrollmentList() {
  const roomName = roomStore.getRoom().name;

  return request
    .get(`/api/role/room/${roomName}/enrollments`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: err.message,
        });
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      return roleActions.setRoomEnrollments(response.body);
    });
}

function addUser({ username }) {
  const { enrollments } = roleStore.getState();

  roleActions.addRoomUserEnrollmentFailed(null);

  if (!username) {
    return false;
  }

  return request
    .get(`/api/user/${username}`)
    .end((err, response) => {
      if (err) {
        roleActions.addRoomUserEnrollmentFailed((response && response.text) || err.message);
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      const hasUser = enrollments.some(e => e.userId === response.body.userId);

      if (!hasUser) {
        return roleActions.setRoomEnrollments([
          {
            ...response.body,
            roles: [],
            new: true,
          },
          ...enrollments,
        ]);
      }

      return addNotification({
        color: ALERT_COLORS.WARNING,
        message: 'User added already',
      });
    });
}

function enrollUser({ roleId, userId }) {
  console.log('enrollUser', { roleId, userId });
  const roomName = roomStore.getRoom().name;
  return request
    .post('/api/role/enroll', { roleId, userId, roomName })
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: err.message,
        });
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      return getEnrollmentList();
    });
}

function unenrollUser({ enrollmentId }) {
  const roomName = roomStore.getRoom().name;
  return request
    .delete(`/api/role/room/${roomName}/enrollment/${enrollmentId}`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: err.message,
        });
      }

      if (response.status >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: response.text,
        });
      }

      return getEnrollmentList();
    });
}

export default function RoleSaga() {
  RoleDispatcher.register(({ action }) => {
    const { actionType } = action;

    switch (actionType) {
      case types.ROLES_FETCH:
        fetchRoles(action);
        break;
      case types.ROLES_SAVE:
        saveRoles(action);
        break;
      case types.ROLES_REMOVE:
        removeRole(action);
        break;

      case types.ENROLLMENTS_FETCH:
        getEnrollmentList(action);
        break;
      case types.ENROLLMENT_USER_ADD:
        addUser(action);
        break;
      case types.ENROLL_USER:
        enrollUser(action);
        break;
      case types.UNENROLL_USER:
        unenrollUser(action);
        break;
      default:
        break;
    }
  });
}
