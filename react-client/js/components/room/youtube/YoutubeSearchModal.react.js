import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollArea from '../../elements/ScrollArea.react';
import {
  getSearch,
  setYoutubeVideoPlaying,
} from '../../../utils/YoutubeAPI';
import {
  setYoutubeSearchModal,
  clearYoutubeSearch,
} from '../../../actions/YoutubeActions';
import YoutubeSearchResult from './YoutubeSearchResult.react';

class YoutubeSearchModal extends Component {
  constructor(props) {
    super(props);

    this.getSearch = getSearch;
    this.setYoutubeVideoPlaying = setYoutubeVideoPlaying;
    this.clearYoutubeSearch = clearYoutubeSearch;
    this.setYoutubeSearchModal = setYoutubeSearchModal.bind(this);
    this.handlePlayVideo = this.handlePlayVideo.bind(this);
    this.handleClearInput = this.handleClearInput.bind(this);

    this._focusInput = this._focusInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handlePlayVideo({ videoId, title }) {
    this.setYoutubeVideoPlaying(videoId, title);
    this.setYoutubeSearchModal(false);
    this.clearYoutubeSearch();
  }

  handleClearInput(e) {
    e.preventDefault();
    e.stopPropagation();
    this.clearYoutubeSearch();
    this.input.value = '';
  }

  _focusInput() {
    this.input.focus();
  }

  handleSearch(e) {
    e.preventDefault();
    const { value } = this.input;

    if (value.trim().length > 2) {
      this.getSearch(value);
    }
  }

  render() {
    const {
      error,
      results,
      resultsLoading,
    } = this.props;

    return (
      <div>
        <form className="form form-inline" onSubmit={this.handleSearch}>
          <div className="form__InputContainer">
            <input
              type="text"
              className="input form__Input form__Input-inline form__Input-clear youtube__SearchInput"
              ref={(e) => { this.input = e; }}
            />
            <button
              type="button"
              className="button form__InputClear"
              title="clear search"
              onClick={this.handleClearInput}
              tabIndex="-1"
            >
              <FontAwesomeIcon
                icon={['far', 'times']}
              />
            </button>
          </div>
          <button
            className="button button-blue"
            type="submit"
          >
            Search
          </button>
        </form>

        <span className="text-sub form__InputHint">
          Enter a URL or video ID (e.g. youtube.com/watch?v=dQw4w9WgXcQ)
        </span>

        {resultsLoading && (
          <div className="youtube__Loading">
            <img
              alt="loading results"
              src="/img/loading.svg"
              className="youtube__LoadingIndicator"
            />
          </div>
        )}

        {error && <span className="text text-red modal__Error">{error.message}</span>}
        {results.length > 0 && (
          <ScrollArea
            className="youtube__ResultsContainer"
            contentStyle={{ paddingBottom: '0.25em' }}
            horizontal={false}
          >
            {results.map(result => (
              <YoutubeSearchResult
                key={result.videoId}
                result={result}
                onPlayVideo={this.handlePlayVideo}
              />
            ))}
          </ScrollArea>
        )}
      </div>
    );
  }
}

YoutubeSearchModal.defaultProps = {
  results: [],
  error: null,
};

YoutubeSearchModal.propTypes = {
  results: PropTypes.array,
  error: PropTypes.object,
  resultsLoading: PropTypes.bool.isRequired,
};

export default YoutubeSearchModal;
