/**
 * Created by Zaccary on 30/05/2016.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import {
  setStreamOptionsState,
  resumeRemoteStream,
  hangupRemoteStream,
} from '../../../actions/CamActions';
import { withState } from '../../../utils/withState';
import WrappedListItems from '../../elements/ListItems.react';
import { sendOperatorAction } from '../../../utils/RoomAPI';

export class RoomCamOptions extends Component {
  constructor(props) {
    super(props);

    this.bitrateTimer = null;
    this.setStreamOptionsState = setStreamOptionsState;
    this.resumeRemoteStream = resumeRemoteStream;
    this.hangupRemoteStream = hangupRemoteStream;
    this.sendOperatorAction = sendOperatorAction;

    this.handleSetOptionsOpen = this.handleSetOptionsOpen.bind(this);
    this.handleHideCam = this.handleHideCam.bind(this);
    this.handleBanUser = this.handleBanUser.bind(this);
    this.handleCloseBroadcast = this.handleCloseBroadcast.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);


    this.state = {
      bitrate: null,
    };
  }

  componentDidMount() {
    this.initBitrateTimer();
  }

  componentWillUnmount() {
    if (this.bitrateTimer) {
      clearInterval(this.bitrateTimer);
    }
  }

  getOptions() {
    const {
      clientUser,
      roleState: { roles },
      feed,
    } = this.props;

    const getRolePermissions = permission => roles
      .filter(role => clientUser.roles.includes(role.tag))
      .some(role => role.permissions[permission]);

    const { bitrate } = this.state;

    const {
      isAdmin,
    } = clientUser;

    const optionsObj = [
      {
        text: feed.userClosed ? 'Restore cam' : 'Hide cam',
        props: {
          onClick: this.handleHideCam,
        },
      },
    ];


    let modOptions = [];
    if (isAdmin || getRolePermissions('ban')) {
      modOptions = [
        ...modOptions,
        {
          text: 'Ban user',
          props: {
            onClick: this.handleBanUser,
          },
        },
      ];
    }

    if (isAdmin || getRolePermissions('closeCam')) {
      modOptions = [
        ...modOptions,
        {
          text: 'Close broadcast',
          props: {
            onClick: this.handleCloseBroadcast,
          },
        },
      ];
    }

    modOptions.forEach((option) => {
      optionsObj.unshift(option);
    });

    if (bitrate) {
      optionsObj.push({
        key: 'bitrate',
        text: `bitrate: ${bitrate}`,
        element: 'div',
      });
    }

    return optionsObj;
  }

  handleHideCam() {
    const { feed } = this.props;
    this.setStreamOptionsState(feed.userId);
    if (feed.userClosed) {
      this.resumeRemoteStream(feed.userId);
    } else {
      this.hangupRemoteStream(feed.userId);
    }
  }

  handleBanUser() {
    const { user } = this.props;
    this.sendOperatorAction('ban', { user_list_id: user._id });
  }

  handleCloseBroadcast() {
    const { user } = this.props;
    this.sendOperatorAction('closeBroadcast', { user_list_id: user._id });
  }

  handleClickOutside() {
    this.setStreamOptionsState(null);
  }

  handleSetOptionsOpen(e) {
    e.stopPropagation();
    const { feed } = this.props;
    this.setStreamOptionsState(feed.userId);
  }


  initBitrateTimer() {
    const { feed } = this.props;

    if (feed.remoteFeed) {
      this.bitrateTimer = setInterval(() => {
        const bitrate = feed.remoteFeed.getBitrate();
        this.setState({
          bitrate,
        });
      }, 1000);
    }
  }

  render() {
    const { open, user } = this.props;

    if (!user || user.is_client_user) {
      return null;
    }

    const options = this.getOptions();

    return (
      <TetherComponent
        attachment="top center"
        constraints={[{
          to: 'scrollParent',
          attachment: 'together',
        }]}
      >
        <button
          className="button button-default cams__OptionsTrigger"
          onClick={this.handleSetOptionsOpen}
          type="button"
        >
          Options
        </button>
        {open && (
          <WrappedListItems
            options={options}
            onClickOutside={this.handleClickOutside}
          />
        )}
      </TetherComponent>

    );
  }
}

RoomCamOptions.defaultProps = {
  clientUser: {},
  user: {},
  open: false,
  feed: null,
};

RoomCamOptions.propTypes = {
  clientUser: PropTypes.object,
  user: PropTypes.object,
  open: PropTypes.bool,
  feed: PropTypes.object,
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      permissions: PropTypes.objectOf(PropTypes.bool),
    })),
  }).isRequired,
};

export default withState(RoomCamOptions);
