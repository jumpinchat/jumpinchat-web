import React from 'react';
import { shallow } from 'enzyme';
import BanlistModal from './BanlistModal.react';

describe('<BanlistModal />', () => {
  let props;

  beforeEach(() => {
    props = {
      isOpen: true,
      banlist: [],
    };
  });


  describe('handleUnbanUser', () => {
    it('should send `unban` operator command', () => {
      const wrapper = shallow(<BanlistModal {...props} />);
      const opActionSpy = jest.fn();
      wrapper.instance().sendOperatorAction = opActionSpy;
      wrapper.instance().handleUnbanUser('foo', 'bar');
      expect(opActionSpy).toHaveBeenCalledWith('unban', {
        banlistId: 'foo',
        handle: 'bar',
      });
    });
  });

  describe('render', () => {
    it('should show empty message if no items', () => {
      const wrapper = shallow(<BanlistModal {...props} />);
      expect(wrapper.find('span').text()).toEqual('Banlist empty.');
    });

    it('should show banlist items', () => {
      props.banlist = [
        {
          timestamp: new Date(),
          handle: 'foo',
          _id: 'bar',
        },
      ];

      const wrapper = shallow(<BanlistModal {...props} />);
      expect(wrapper.find('BanListItem').length).toEqual(1);
    });
  });
});
