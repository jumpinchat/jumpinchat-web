import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';

class Tooltip extends PureComponent {
  static getPosition(position = '') {
    let [vertical, horizontal = 'center'] = position.split(' ');

    if (vertical === 'left' || vertical === 'right') {
      horizontal = vertical;
      vertical = 'middle';
    }

    return `${vertical} ${horizontal}`;
  }

  static invertPosition(position) {
    let [vertical, horizontal] = position.split(' ');

    if (vertical === 'top') {
      vertical = 'bottom';
    } else if (vertical === 'bottom') {
      vertical = 'top';
    }

    if (horizontal === 'right') {
      horizontal = 'left';
    } else if (horizontal === 'left') {
      horizontal = 'right';
    }

    return `${vertical} ${horizontal}`;
  }

  constructor() {
    super();

    this.handleShowTooltip = this.handleShowTooltip.bind(this);
    this.handleHideTooltip = this.handleHideTooltip.bind(this);

    this.state = {
      visible: false,
    };

    this.defaultId = `tooltip-${Math.round(Math.random() * 1e5)}`;
    this.visibleTimeout = null;
  }

  componentDidMount() {
    this.target.addEventListener('mouseenter', this.handleShowTooltip, false);
    this.target.addEventListener('mouseleave', this.handleHideTooltip, false);
  }

  componentWillUnmount() {
    this.target.removeEventListener('mouseenter', this.handleShowTooltip);
    this.target.removeEventListener('mouseleave', this.handleHideTooltip);
  }

  handleHideTooltip() {
    clearTimeout(this.visibleTimeout);
    this.setState({ visible: false });
  }

  handleShowTooltip() {
    this.visibleTimeout = setTimeout(() => this.setState({ visible: true }), 250);
  }

  render() {
    const { children, text, position } = this.props;
    const { visible } = this.state;
    const childrenProps = {
      'aria-describedby': this.defaultId,
      ...children.props,
    };

    const targetPosition = Tooltip.getPosition(position);
    const attachmentPosition = Tooltip.invertPosition(targetPosition);

    return (
      <TetherComponent
        attachment={attachmentPosition}
        targetAttachment={targetPosition}
        constraints={[
          {
            to: 'window',
            attachment: 'together',
            pin: true,
          },
        ]}
      >
        {React.cloneElement(children, {
          ref: (e) => { this.target = e; },
          ...childrenProps,
        })}
        {visible && (
          <div
            className="tooltip__Content"
            role="tooltip"
            id={this.defaultId}
          >
            {text}
          </div>
        )}
      </TetherComponent>
    );
  }
}

Tooltip.defaultProps = {
  position: 'top center',
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

export default Tooltip;
