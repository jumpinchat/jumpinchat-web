import * as types from '../constants/ActionTypes';
import { RoleDispatcher } from '../dispatcher/AppDispatcher';

export function editRole(role) {
  RoleDispatcher.handleAction({
    actionType: types.ROLE_UPDATE,
    role,
  });
}

export function setRoles(roles) {
  RoleDispatcher.handleAction({
    actionType: types.ROLES_SET,
    roles,
  });
}

export function fetchRoles(roomName) {
  RoleDispatcher.handleAction({
    actionType: types.ROLES_FETCH,
    roomName,
  });
}

export function saveRoles(roles) {
  RoleDispatcher.handleAction({
    actionType: types.ROLES_SAVE,
    roles,
  });
}

export function removeRole(roleId) {
  RoleDispatcher.handleAction({
    actionType: types.ROLES_REMOVE,
    roleId,
  });
}

export function setRoomEnrollments(enrollments) {
  RoleDispatcher.handleAction({
    actionType: types.ENROLLMENTS_SET,
    enrollments,
  });
}

export function getRoomEnrollments() {
  RoleDispatcher.handleAction({
    actionType: types.ENROLLMENTS_FETCH,
  });
}

export function addRoomUserEnrollment(username) {
  RoleDispatcher.handleAction({
    actionType: types.ENROLLMENT_USER_ADD,
    username,
  });
}

export function addRoomUserEnrollmentFailed(error) {
  RoleDispatcher.handleAction({
    actionType: types.ENROLLMENT_USER_ADD_FAILED,
    error,
  });
}

export function enrollUser(roleId, userId) {
  RoleDispatcher.handleAction({
    actionType: types.ENROLL_USER,
    roleId,
    userId,
  });
}

export function unenrollUser(enrollmentId) {
  RoleDispatcher.handleAction({
    actionType: types.UNENROLL_USER,
    enrollmentId,
  });
}

export default null;
