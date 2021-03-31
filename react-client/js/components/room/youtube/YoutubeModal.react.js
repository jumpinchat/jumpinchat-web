import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import withErrorBoundary from '../../../utils/withErrorBoundary';
import {
  getSearch,
  setYoutubeVideoPlaying,
  removeVideo,
} from '../../../utils/YoutubeAPI';
import { setYoutubeSearchModal } from '../../../actions/YoutubeActions';
import YoutubePlaylist from './YoutubePlaylist.react';
import YoutubeSearch from './YoutubeSearchModal.react';

export class YoutubeModal extends Component {
  constructor(props) {
    super(props);

    this.getSearch = getSearch;
    this.setYoutubeVideoPlaying = setYoutubeVideoPlaying;
    this.removeVideo = removeVideo;
    this.setYoutubeSearchModal = setYoutubeSearchModal.bind(this);

    this.closeModal = this.closeModal.bind(this);
    this.handleRemovePlaylistItem = this.handleRemovePlaylistItem.bind(this);
  }

  handleRemovePlaylistItem(playlistId) {
    this.removeVideo(playlistId);
  }

  closeModal() {
    this.setYoutubeSearchModal(false);
  }

  render() {
    const {
      error,
      results,
      isOpen,
      resultsLoading,
      playlist,
    } = this.props;

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        onAfterOpen={this._focusInput}
        onRequestClose={this.closeModal}
        contentLabel="Search youtube videos"
      >
        <div className="modal__Header">
          Search for YouTube videos

          <button
            type="button"
            className="modal__Button modal__Button-close"
            onClick={this.closeModal}
          >
            <i className="fa fa-times" />
          </button>
        </div>
        <div className="modal__Body">
          <YoutubeSearch
            results={results}
            resultsLoading={resultsLoading}
            error={error}
          />
          {results.length === 0 && !resultsLoading && (
            <YoutubePlaylist
              list={playlist}
              error={error}
              onRemoveItem={id => this.handleRemovePlaylistItem(id)}
            />
          )}
        </div>
      </Modal>
    );
  }
}

YoutubeModal.defaultProps = {
  isOpen: false,
  results: [],
  error: null,
};

YoutubeModal.propTypes = {
  isOpen: PropTypes.bool,
  results: PropTypes.array,
  error: PropTypes.object,
  resultsLoading: PropTypes.bool.isRequired,
  playlist: PropTypes.arrayOf(PropTypes.shape({
    mediaType: PropTypes.string.isRequired,
    startedBy: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      pic: PropTypes.string.isRequired,
    }).isRequired,
    duration: PropTypes.number.isRequired,
    title: String,
    description: PropTypes.string,
    channelId: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  })).isRequired,
};

export default withErrorBoundary(YoutubeModal);
