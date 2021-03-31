import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { getUserProfile } from '../../../utils/UserAPI';
import { withState } from '../../../utils/withState';
import { setProfileModal } from '../../../actions/ModalActions';
import { setLoading } from '../../../actions/ProfileActions';
import Sidebar from './Sidebar.react';
import Options from './Options.react';
import Info from './Info.react';

class ProfileModal extends Component {
  constructor() {
    super();
    this.setProfileModal = setProfileModal;
    this.setLoading = setLoading;
    this.getUserProfile = getUserProfile;
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      profile: {
        userId,
      },
      open,
    } = this.props;

    if (userId && (!prevProps.open && open)) {
      this.setLoading(true);
      this.getUserProfile(userId);
    }
  }

  getUserName() {
    const { profile } = this.props;

    if (profile.username) {
      return profile.username;
    }

    return profile.handle;
  }

  closeModal() {
    this.setProfileModal(false);
  }

  render() {
    const {
      open,
      loading,
      profile,
      ignoreListItem,
      userState: { user },
      roomOwner,
      roleState: { roles },
    } = this.props;

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={open}
        onRequestClose={this.closeModal}
        contentLabel="User profile"
      >
        <div className="modal__Header">
          {this.getUserName()}
          <button
            className="modal__Button modal__Button-close"
            type="button"
            onClick={this.closeModal}
          >
            <i className="fa fa-times" />
          </button>
        </div>
        <div className="modal__Body">
          {loading && (
            <div className="youtube__Loading">
              <img
                alt="loading results"
                src="/img/loading.svg"
                className="youtube__LoadingIndicator"
              />
            </div>
          )}
          <div className="profile">
            {!loading && (
              <Fragment>
                <Sidebar profile={profile} />
                <div className="profile__Body">
                  <Info profile={profile} />
                  <Options
                    profile={profile}
                    ignoreListItem={ignoreListItem}
                    closeModal={this.closeModal}
                    roomOwner={roomOwner}
                    user={user}
                    roles={roles}
                  />
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

ProfileModal.defaultProps = {
  roomOwner: null,
  ignoreListItem: null,
  profile: {},
};

ProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  userState: PropTypes.shape({
    user: PropTypes.shape({
      user_id: PropTypes.string,
      operator_id: PropTypes.string,
      operatorPermissions: PropTypes.objectOf(PropTypes.bool),
      isAdmin: PropTypes.bool,
      roles: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
  profile: PropTypes.shape({
    userType: PropTypes.string,
    userId: PropTypes.string,
    pic: PropTypes.string,
    handle: PropTypes.string.isRequired,
    username: PropTypes.string,
    joinDate: PropTypes.string,
    lastSeen: PropTypes.string,
    trophies: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      image: PropTypes.string,
    })),
    assignedBy: PropTypes.string,
    operatorId: PropTypes.string,
  }),
  loading: PropTypes.bool.isRequired,
  ignoreListItem: PropTypes.shape({
    id: PropTypes.string,
  }),
  roomOwner: PropTypes.string,
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default withState(ProfileModal);
