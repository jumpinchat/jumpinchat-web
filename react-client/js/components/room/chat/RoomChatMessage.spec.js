import React from 'react';
import { shallow } from 'enzyme';
import { RoomChatMessage } from './RoomChatMessage.react';


describe('<RoomChatMessage />', () => {
  let roomChatMessage;
  let props;
  beforeEach(() => {
    props = {
      userState: {
        user: {
          roles: ['everybody'],
        },
      },
      message: {
        message: 'foo',
        handle: 'bar',
        timestamp: new Date('2017-03-12T22:09:59.419Z'),
        color: 'foo',
      },
      handle: 'bar',
      username: 'baz',
    };
    roomChatMessage = new RoomChatMessage();
  });

  describe('chat message', () => {
    it('should add a color class if message has a color prop', () => {
      expect(shallow(<RoomChatMessage {...props} />).first().props().className)
        .toEqual('chat__Message foo');
    });

    it('should contain a handle', () => {
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageHandle').text()).toEqual('bar');
    });

    it('should contain a message', () => {
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody').length).toEqual(1);
    });

    it('should contain correct message', () => {
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should highlight current user when @mentioned', () => {
      props.message.message = '@bar: message';
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-userHighlight').length).toEqual(1);
    });

    it('should highlight current user when @mentioned and requires escape', () => {
      props.handle = 'bar[12';
      props.message.message = '@bar[12: message';
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-userHighlight').length).toEqual(1);
    });

    it('should append "admin" badge if message is from an admin user', () => {
      props.message.isAdmin = true;
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should append "site mod" badge if message is from site mod', () => {
      props.message.isSiteMod = true;
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should only show "admin" badge', () => {
      props.message.isAdmin = true;
      props.message.isSiteMod = true;
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });

  describe('status message', () => {
    let statusMessage;
    beforeEach(() => {
      statusMessage = {
        message: 'foo',
        timestamp: new Date('2017-03-12T22:09:59.419Z'),
        status: true,
      };

      props = {
        ...props,
        message: statusMessage,
      };
    });

    it('should render a status message', () => {
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-status').length).toEqual(1);
    });

    it('should render an error message if error is set', () => {
      props.message = { ...statusMessage, error: true };
      const wrapper = shallow(<RoomChatMessage {...props} />);

      expect(wrapper.find('.chat__MessageBody-error').length).toEqual(1);
    });

    it('should render an info message if message type is info', () => {
      props.message = { ...statusMessage, type: 'info' };
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-info').length).toEqual(1);
    });

    it('should render an info message if message type is success', () => {
      props.message = { ...statusMessage, type: 'success' };
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-success').length).toEqual(1);
    });

    it('should render an info message if message type is alert', () => {
      props.message = { ...statusMessage, type: 'alert' };
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-alert').length).toEqual(1);
    });

    it('should render an info message if message type is warning', () => {
      props.message = { ...statusMessage, type: 'warning' };
      const wrapper = shallow(<RoomChatMessage {...props} />);
      expect(wrapper.find('.chat__MessageBody-warning').length).toEqual(1);
    });
  });
});
