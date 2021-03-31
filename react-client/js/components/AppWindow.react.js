/* global navigator,window */
import React, { Component } from 'react';
import Loading from './elements/Loading.react';
import NotCompatible from './NotCompatible.react';
import iconLibrary from '../utils/iconLibrary';

import Room from './room/Room.react';
import {
  initRoom,
  connectToRoom,
} from '../utils/RoomUtils';
import RootSaga from '../saga';
import RootSocket from '../sockets';
import { getUnreadMessages } from '../utils/UserAPI';


class AppWindow extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      room: null,
      activityToken: null,
      user: null,
      online: navigator.onLine,
    };

    iconLibrary();
    this.setOnlineStatus = this.setOnlineStatus.bind(this);
  }

  componentDidMount() {
    initRoom((err, roomState) => {
      if (err) {
        if (err === 'ERR_RECONNECT_FAIL') {
          console.warn('error reconnecting, rejoining room');
          connectToRoom(this.state);
        }

        return;
      }

      if (roomState && roomState.user && roomState.user.user_id) {
        getUnreadMessages(roomState.user.user_id);
      }


      RootSocket();

      this.setState({
        ...roomState,
        online: navigator.onLine,
      });
    });

    window.addEventListener('online', this.setOnlineStatus);
    window.addEventListener('offline', this.setOnlineStatus);

    RootSaga();
  }

  setOnlineStatus() {
    this.setState({
      online: navigator.onLine,
    });
  }

  render() {
    const {
      room,
      user,
      activityToken,
      loading,
      online,
    } = this.state;

    if (!Object.entries || window.fetch === undefined) {
      return (
        <NotCompatible
          user={user}
          userIsLoggedIn={user && !!user.user_id}
        />
      );
    }

    return (
      <React.Fragment>
        { loading && online && (
          <Loading
            loading={online}
            title="Loading room&hellip;"
            fullHeight
          />
        )}

        {loading && !online && (
          <Loading
            loading={false}
            title="Can not connect, you are offline."
            fullHeight
          />
        )}

        {!loading && (
          <Room
            room={room}
            user={user}
            activityToken={activityToken}
          />
        )}
      </React.Fragment>
    );
  }
}

export default AppWindow;
