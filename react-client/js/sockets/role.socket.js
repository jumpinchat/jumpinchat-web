import * as roleActions from '../actions/RoleActions';
import SocketUtils from '../utils/SocketUtil';


export default () => {
  SocketUtils.listen('roles::update', () => {
    roleActions.fetchRoles();
  });
};
