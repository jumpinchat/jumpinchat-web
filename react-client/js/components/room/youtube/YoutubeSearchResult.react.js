import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  setYoutubeVideoPlaying,
} from '../../../utils/YoutubeAPI';
import { setYoutubeSearchModal } from '../../../actions/YoutubeActions';

class YoutubeSearchResult extends Component {
  constructor(props) {
    super(props);
    this.setYoutubeSearchModal = setYoutubeSearchModal;
    this.setYoutubeVideoPlaying = setYoutubeVideoPlaying;
    this.handleSelectResult = this.handleSelectResult.bind(this);
  }

  handleSelectResult() {
    this.props.onPlayVideo(this.props.result);
  }

  render() {
    const { result } = this.props;
    return (
      <button
        type="button"
        className="youtube__Result"
        onClick={this.handleSelectResult}
      >
        <img
          className="youtube__ResultThumbnail"
          src={result.thumb.url}
          alt={result.title}
        />
        <div className="youtube__ResultInfo">
          <span className="youtube__ResultTitle">{result.title}</span>
        </div>
      </button>
    );
  }
}

YoutubeSearchResult.propTypes = {
  result: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumb: PropTypes.shape({
      url: PropTypes.string.isRequired,
    }).isRequired,
  }),
  onPlayVideo: PropTypes.func.isRequired,
};

YoutubeSearchResult.defaultProps = {
  result: {},
};

export default YoutubeSearchResult;
