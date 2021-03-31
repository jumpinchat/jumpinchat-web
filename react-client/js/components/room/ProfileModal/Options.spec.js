import React from 'react';
import { shallow } from 'enzyme';
import ProfileOptions from './Options.react';

describe('ProfileOptions', () => {
  let props;

  beforeEach(() => {
    props = {
      closeModal: jest.fn(),
      ignoreListItem: null,
      profile: {
        userListId: 'foo',
      },
      roomOwner: null,
      user: {
        isAdmin: false,
        operatorPermissions: null,
        user_id: null,
        roles: ['everyone'],
      },
      roles: [
        {
          tag: 'mods',
          permissions: {
            ban: true,
          },
        },
        {
          tag: 'notmods',
          permissions: {
            ban: false,
          },
        },
      ],
    };
  });

  describe('getCanBan', () => {
    beforeEach(() => {
      props.user.roles = ['mods'];
    });
    it('should return false if no operator permissions', () => {
      props.user.roles = ['foo'];
      const wrapper = shallow(<ProfileOptions {...props} />);
      const canBan = wrapper.instance().getCanBan();
      expect(canBan).toEqual(false);
    });

    it('should return false if user has no ban permission', () => {
      props.user.roles = ['notmods'];

      const wrapper = shallow(<ProfileOptions {...props} />);
      const canBan = wrapper.instance().getCanBan();
      expect(canBan).toEqual(false);
    });

    it('should return false if user is a permanent mod', () => {
      props.profile.operatorId = 'foo';
      props.profile.assignedBy = null;

      const wrapper = shallow(<ProfileOptions {...props} />);
      const canBan = wrapper.instance().getCanBan();
      expect(canBan).toEqual(false);
    });

    it('should return true if regular user', () => {
      props.profile.operatorId = null;
      props.profile.assignedBy = null;

      const wrapper = shallow(<ProfileOptions {...props} />);
      const canBan = wrapper.instance().getCanBan();
      expect(canBan).toEqual(true);
    });

    it('should return true if admin bans perm mod', () => {
      props.profile.operatorId = 'foo';
      props.profile.assignedBy = null;
      props.user.isAdmin = true;

      const wrapper = shallow(<ProfileOptions {...props} />);
      const canBan = wrapper.instance().getCanBan();
      expect(canBan).toEqual(true);
    });
  });

  describe('handleBan', () => {
    it('should close the modal', () => {
      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().handleBan();
      expect(props.closeModal).toHaveBeenCalled();
    });

    it('should open the ban modal', () => {
      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().setBanModal = jest.fn();
      wrapper.instance().handleBan();
      expect(wrapper.instance().setBanModal)
        .toHaveBeenCalledWith(true, props.profile.userListId);
    });
  });

  describe('handleIgnore', () => {
    it('should call unignoreUser if ignoreListItem exists', () => {
      props.ignoreListItem = {
        id: 'foo',
      };

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().unignoreUser = jest.fn();
      wrapper.instance().handleIgnore();
      expect(wrapper.instance().unignoreUser)
        .toHaveBeenCalledWith(props.ignoreListItem.id);
    });

    it('should call ignoreUser if no ignoreListItem exists', () => {
      props.ignoreListItem = null;
      props.profile.userListId = 'foo';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().ignoreUser = jest.fn();
      wrapper.instance().handleIgnore();
      expect(wrapper.instance().ignoreUser)
        .toHaveBeenCalledWith(props.profile.userListId);
    });
  });

  describe('handleReport', () => {
    it('should close the profile modal', () => {
      props.profile.userListId = 'foo';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().handleReport();
      expect(props.closeModal).toHaveBeenCalled();
    });

    it('should call setReportModal', () => {
      props.profile.userListId = 'foo';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().setReportModal = jest.fn();
      wrapper.instance().handleReport();
      expect(wrapper.instance().setReportModal)
        .toHaveBeenCalledWith(true, props.profile.userListId);
    });
  });

  describe('handlePrivateMessage', () => {
    it('should close the profile modal', () => {
      props.profile.userListId = 'foo';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().handlePrivateMessage();
      expect(props.closeModal).toHaveBeenCalled();
    });

    it('should call pmStartConversation', () => {
      props.profile.userListId = 'foo';
      props.profile.userId = 'bar';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().pmStartConversation = jest.fn();
      wrapper.instance().handlePrivateMessage();
      expect(wrapper.instance().pmStartConversation)
        .toHaveBeenCalledWith(props.profile.userListId, props.profile.userId);
    });
  });

  describe('callModAction', () => {
    it('should close the profile modal', () => {
      props.profile.userListId = 'foo';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().sendOperatorAction = jest.fn();
      wrapper.instance().callModAction();
      expect(props.closeModal).toHaveBeenCalled();
    });

    it('should call pmStartConversation', () => {
      props.profile.userListId = 'foo';

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().sendOperatorAction = jest.fn();
      wrapper.instance().callModAction('action');
      expect(wrapper.instance().sendOperatorAction)
        .toHaveBeenCalledWith('action', { user_list_id: props.profile.userListId });
    });
  });

  describe('render', () => {
    it('should show pm button if user is registered', () => {
      props.user.user_id = 'foo';
      const wrapper = shallow(<ProfileOptions {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show profile button if profile user is registered', () => {
      props.profile.username = 'foo';
      const wrapper = shallow(<ProfileOptions {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show unignore button if ignorelistitem exists', () => {
      props.ignoreListItem = { id: 'foo' };
      const wrapper = shallow(<ProfileOptions {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should should show ban button', () => {
      props.roles = props.roles.map((role) => {
        if (role.tag === 'mods') {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              ban: true,
            },
          };
        }

        return role;
      });
      props.user.roles = ['mods'];

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().getCanBan = jest.fn(() => true);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should should show kick button', () => {
      props.roles = props.roles.map((role) => {
        if (role.tag === 'mods') {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              kick: true,
            },
          };
        }

        return role;
      });
      props.user.roles = ['mods'];

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().getCanBan = jest.fn(() => true);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should should show silence button', () => {
      props.roles = props.roles.map((role) => {
        if (role.tag === 'mods') {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              muteUserChat: true,
            },
          };
        }

        return role;
      });
      props.user.roles = ['mods'];

      const wrapper = shallow(<ProfileOptions {...props} />);
      wrapper.instance().getCanBan = jest.fn(() => true);
      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });
});
