import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import clickOutside from 'react-click-outside';

export class ListItems extends PureComponent {
  handleClickOutside() {
    this.props.onClickOutside();
  }

  render() {
    const { options } = this.props;
    return (
      <div className="dropdown__Options">
        {options.map((option) => {
          switch (option.element) {
            case 'component':
              if (!option.component) {
                throw new Error('expected a `component` property');
              }

              return {
                ...option.component,
                key: JSON.stringify(option.component.props),
              };
            case 'div':
              return (
                <div
                  key={options.key || option.text}
                  className="dropdown__Option"
                  {...option.props}
                >
                  {option.text}
                </div>
              );
            case 'a':
              return (
                <a
                  className="dropdown__Option dropdown__Option-link"
                  key={`${option.text}${option.props.href}`}
                  {...option.props}
                >
                  {option.text}
                  {option.count > 0 && (
                    <React.Fragment>
                      &nbsp;
                      <span className="pill pill--animated">{ option.count }</span>
                    </React.Fragment>
                  )}
                </a>
              );
            default:
              return (
                <button
                  className="dropdown__Option dropdown__Option-button"
                  key={option.text}
                  {...option.props}
                >
                  {option.text}
                </button>
              );
          }
        })}
      </div>
    );
  }
}

ListItems.defaultProps = {
  options: [],
};

ListItems.propTypes = {
  options: PropTypes.array,
  onClickOutside: PropTypes.func.isRequired,
};

export default clickOutside(ListItems);
