import AppSaga from './app.saga';
import UserSaga from './user.saga';
import RoleSaga from './role.saga';
import PmSaga from './pm.saga';

export default function RootSaga() {
  AppSaga();
  UserSaga();
  RoleSaga();
  PmSaga();
}
