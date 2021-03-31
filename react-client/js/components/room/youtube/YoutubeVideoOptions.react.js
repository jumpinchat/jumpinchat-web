import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import WrappedListItems from '../../elements/ListItems.react';
import {
  setYoutubeVideo,
  setYoutubeOptions,
} from '../../../actions/YoutubeActions';

class YoutubeVideoOptions extends Component {
  constructor(props) {
    super(props);
    this.setYoutubeVideo = setYoutubeVideo;
    this.setYoutubeOptions = setYoutubeOptions;
    this.handleCloseVideo = this.handleCloseVideo.bind(this);
    this.handleToggleOptions = this.handleToggleOptions.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    this.options = [];
  }

  componentWillMount() {
    this.options = this.createListOptions();
  }

  handleCloseVideo() {
    this.setYoutubeVideo(null);
  }

  handleToggleOptions(e) {
    e.stopPropagation();
    this.setYoutubeOptions(!this.props.open);
  }

  handleClickOutside() {
    this.setYoutubeOptions(false);
  }

  createListOptions() {
    return [
      {
        text: 'Hide video',
        props: {
          onClick: this.handleCloseVideo,
        },
      },
      {
        text: 'Sync video',
        props: {
          onClick: this.props.onSync,
        },
      },
    ];
  }

  render() {
    const { open } = this.props;
    return (
      <TetherComponent
        attachment="bottom center"
        constraints={[{
          to: 'scrollParent',
          attachment: 'together',
        }]}
      >
        <button
          className="button button-default cams__OptionsTrigger"
          onClick={this.handleToggleOptions}
        >
          Options
        </button>
        {
          open && (
            <WrappedListItems
              options={this.options}
              onClickOutside={this.handleClickOutside}
            />
          )
        }
      </TetherComponent>
    );
  }
}

YoutubeVideoOptions.defaultProps = {
  open: false,
};

YoutubeVideoOptions.propTypes = {
  open: PropTypes.bool,
  onSync: PropTypes.func.isRequired,
};

export default YoutubeVideoOptions;
