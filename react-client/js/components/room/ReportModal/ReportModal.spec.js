import React from 'react';
import { shallow } from 'enzyme';
import ReportModal from './ReportModal.react';

describe('<ReportModal />', () => {
  let props;
  beforeEach(() => {
    props = {
      isOpen: false,
      reporterId: 'foo',
      room: 'room',
      messages: [{ message: 'bar' }],
    };
  });

  describe('dismissModal', () => {
    it('should clear error from state', () => {
      const wrapper = shallow(<ReportModal {...props} />);
      wrapper.instance().setState = jest.fn();
      wrapper.instance().dismissModal();
      expect(wrapper.instance().setState).toHaveBeenCalledWith({ error: null });
    });

    it('should set report modal state to false', () => {
      const wrapper = shallow(<ReportModal {...props} />);
      wrapper.instance().setReportModal = jest.fn();
      wrapper.instance().dismissModal();
      expect(wrapper.instance().setReportModal).toHaveBeenCalledWith(false);
    });
  });

  describe('submit', () => {
    let event;
    beforeEach(() => {
      event = { preventDefault: jest.fn() };
    });

    it('should set error state to null', () => {
      const wrapper = shallow(<ReportModal {...props} />);
      wrapper.instance().setState = jest.fn();
      wrapper.instance().reason = { value: false };
      wrapper.instance().description = { value: false };
      wrapper.instance().submit(event);
      expect(wrapper.instance().setState).toHaveBeenCalledWith({ error: null });
    });

    it('should set error if no reason selected', () => {
      const wrapper = shallow(<ReportModal {...props} />);
      wrapper.instance().setState = jest.fn();
      wrapper.instance().reason = { value: false };
      wrapper.instance().description = { value: false };
      wrapper.instance().submit(event);
      expect(wrapper.instance().setState)
        .toHaveBeenCalledWith({ error: 'Select a reason' });
    });

    it('should send a report', () => {
      props.targetId = 'target';
      const wrapper = shallow(<ReportModal {...props} />);
      wrapper.instance().sendReport = jest.fn();
      wrapper.instance().reason = { value: 'foo' };
      wrapper.instance().description = { value: 'bar' };
      wrapper.instance().submit(event);
      expect(wrapper.instance().sendReport)
        .toHaveBeenCalledWith('room', 'foo', 'target', 'foo', 'bar', [{ message: 'bar' }]);
    });
  });

  describe('render', () => {
    it('should show error message', () => {
      const wrapper = shallow(<ReportModal {...props} />);
      wrapper.setState({ error: 'err' });

      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });
});
