import React from 'react';
import { shallow } from 'enzyme';
import VideoVolumeControl from './VideoVolumeControl.react';

describe('<VideoVolumeControl />', () => {
  let props;
  beforeEach(() => {
    props = {
      volume: 0,
      showControl: false,
      onChange: jest.fn(),
      onSetControl: jest.fn(),
      onClickOutside: jest.fn(),
    };
  });

  describe('onChangeVolume', () => {
    it('should call onChange', () => {
      const wrapper = shallow(<VideoVolumeControl {...props} />);
      wrapper.instance().onChangeVolume(100);
      expect(props.onChange).toHaveBeenCalledWith(100);
    });
  });

  describe('render', () => {
    it('should not show volume control if showControl is false', () => {
      const wrapper = shallow(<VideoVolumeControl {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show volume control if showControl is true', () => {
      props.showControl = true;
      const wrapper = shallow(<VideoVolumeControl {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show correct icon when volume > 0', () => {
      props.volume = 100;
      const wrapper = shallow(<VideoVolumeControl {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });
});
