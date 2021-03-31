/**
 * Created by Zaccary on 20/06/2015.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withState } from '../../../utils/withState';
import RoomUserListItem from './RoomUserListItem.react';
import ScrollArea from '../../elements/ScrollArea.react';

function sortCollectionByHasProp(array, roles) {
  const sortedRoles = roles.sort((a, b) => a.order < b.order);
  const segmentedUsers = {
    admin: [],
    siteMods: [],
    ...sortedRoles
      .map(role => ({
        [role.tag]: [],
      }))
      .reduce((acc, v) => ({
        ...acc,
        ...v,
      }), {}),
    noRole: [],
  };

  array.forEach((item) => {
    if (item.isAdmin) {
      segmentedUsers.admin.push(item);
    } else if (item.isSiteModerator) {
      segmentedUsers.siteMods.push(item);
    } else {
      const topUserRole = item.roles[item.roles.length - 1];
      if (topUserRole && segmentedUsers[topUserRole]) {
        segmentedUsers[topUserRole].push(item);
      } else {
        segmentedUsers.noRole.push(item);
      }
    }
  });

  return [
    ...segmentedUsers.admin,
    ...segmentedUsers.siteMods,
    ...sortedRoles.map(r => r.tag).reduce((acc, v) => ([
      ...acc,
      ...segmentedUsers[v],
    ]), []),
    ...segmentedUsers.noRole,
  ];
}

export const RoomUserList = ({
  room,
  users,
  optionOpen,
  user: clientUser,
  showUserList,
  ignoreList,
  roleState: {
    roles,
  },
}) => {
  const sortedUsers = sortCollectionByHasProp(users, roles);

  return (
    <ScrollArea
      className={classnames('chat__UserList', {
        'chat__UserList--open': showUserList,
      })}
      horizontal={false}
    >
      {sortedUsers.map(user => (
        <RoomUserListItem
          room={room}
          user={user}
          key={user._id}
          clientUser={clientUser}
          optionOpen={optionOpen}
          ignoreListItem={ignoreList.find(i => i.userListId === user._id)}
        />
      ))}
    </ScrollArea>
  );
};

RoomUserList.defaultProps = {
  room: null,
  users: [],
  user: null,
  optionOpen: null,
  showUserList: true,
  ignoreList: [],
};

RoomUserList.propTypes = {
  room: PropTypes.object,
  users: PropTypes.array,
  user: PropTypes.object,
  optionOpen: PropTypes.string,
  showUserList: PropTypes.bool,
  ignoreList: PropTypes.arrayOf(PropTypes.shape({
    userListId: PropTypes.string.isRequired,
    userId: PropTypes.string,
    createdAt: PropTypes.string,
  })),
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      order: PropTypes.number,
      tag: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
};

export default withState(RoomUserList);
