import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {
  setMediaSelectionModal,
  setMediaSelectionModalType,
  setMediaDeviceId,
  setMediaSelectionModalLoading,
} from '../../actions/ModalActions';
import { setBroadcastQuality } from '../../actions/UserActions';
import { setClientAudioPtt, setDefaultAudioPtt } from '../../actions/CamActions';
import { saveBroadcastQuality } from '../../utils/UserAPI';
import { publish } from '../../utils/CamUtil';
import MediaSource from './MediaSource.react';
import ScrollArea from '../elements/ScrollArea.react';
import Switch from '../elements/Switch.react';
import Loading from '../elements/Loading.react';
import { trackEvent } from '../../utils/AnalyticsUtil';

class MediaSelectionModal extends Component {
  constructor(props) {
    super(props);
    this.publish = publish.bind(null, props.isGold);
    this.setMediaSelectionModal = setMediaSelectionModal;
    this.setMediaSelectionModalLoading = setMediaSelectionModalLoading;
    this.setMediaSelectionModalType = setMediaSelectionModalType;
    this.setMediaDeviceId = setMediaDeviceId;
    this.setClientAudioPtt = setClientAudioPtt;
    this.setDefaultAudioPtt = setDefaultAudioPtt;
    this.selectDevice = this.selectDevice.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangeQuality = this.handleChangeQuality.bind(this);
    this.deviceInfo = { video: null, audio: null };
  }

  componentDidUpdate(prevProps) {
    const {
      modal: {
        open,
        selectedDevices,
      },
      videoQuality,
      audioPtt,
      forcePtt,
    } = this.props;

    const {
      modal: {
        open: prevOpen,
        selectedDevices: prevSelectedDevices,
      },
    } = prevProps;

    if (open && !prevOpen) {
      this.setDefaultAudioPtt(forcePtt);
    }

    if (selectedDevices.audio && selectedDevices.audio !== prevSelectedDevices.audio) {
      trackEvent('MediaSelect', 'publishing media');
      this.setMediaSelectionModalLoading(true);
      this.publish(videoQuality, selectedDevices.video, selectedDevices.audio, !audioPtt);
    }
  }

  selectDevice(deviceId, type) {
    this.setMediaDeviceId(deviceId, type);

    if (type === 'video') {
      this.setMediaSelectionModalType('audio');
    } else {
      this.setMediaSelectionModalType('video');
    }
  }

  handleChangeQuality() {
    const { qualityOptions } = this.props;
    const { value } = this.qualitySelect;
    const qualityObject = qualityOptions.find(option => option.id === value);
    setBroadcastQuality(qualityObject);
    saveBroadcastQuality(value);
  }

  closeModal() {
    this.setMediaSelectionModalType('video');
    this.setMediaSelectionModal(false);
  }

  render() {
    const {
      error,
      modal,
      forcePtt,
      isGold,
      videoQuality,
      qualityOptions,
      audioPtt,
    } = this.props;

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={modal.open}
        onRequestClose={this.closeModal}
        contentLabel="Media selection modal"
      >
        <div className="modal__Header">
          Choose {modal.mediaType} source
          <button
            type="button"
            className="modal__Button modal__Button-close"
            onClick={this.closeModal}
          >
            <i className="fa fa-times" />
          </button>
        </div>
        <div className="modal__Body modal__Body--noPadding">
          {modal.loading && (
            <div className="modal__LoadingContainer">
              <Loading
                title="Loading&hellip;"
                loading
              />
            </div>
          )}
          {!modal.loading && (
            <Fragment>
              {modal.mediaType === 'video' && videoQuality && isGold && (
                <form className="mediaSources__QualitySelect">
                  <label
                    className="form__InputLabel"
                    htmlFor="qualitySelect"
                  >
                    Video quality
                    <select
                      id="qualitySelect"
                      className="input form__Input form__Input-inline form__Input-floating"
                      name="qualitySelect"
                      ref={(e) => { this.qualitySelect = e; }}
                      value={videoQuality.id}
                      onChange={this.handleChangeQuality}
                    >
                      {qualityOptions.map(option => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </form>
              )}
              {modal.mediaType === 'video' && (
                <ScrollArea
                  className="mediaSources__SourceListWrapper"
                  contentClassName="mediaSources__SourceList"
                  contentStyle={{ paddingBottom: '0.25em' }}
                  horizontal={false}
                >
                  {modal.deviceList.video.map(device => (
                    <MediaSource
                      device={device}
                      key={device.deviceId}
                      onSelectDevice={this.selectDevice}
                      type="video"
                      isGold={isGold}
                      videoQuality={videoQuality}
                    />
                  ))}

                  {navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && (
                    <MediaSource
                      onSelectDevice={() => this.selectDevice('screen', 'video')}
                      device={{ label: 'Share screen' }}
                      type="screen"
                      isGold={isGold}
                      videoQuality={videoQuality}
                    />
                  )}

                  <MediaSource
                    onSelectDevice={() => this.selectDevice(null, 'video')}
                    device={{ label: 'No video' }}
                    type="video"
                    isGold={isGold}
                    videoQuality={videoQuality}
                  />
                </ScrollArea>
              )}

              {
                modal.mediaType === 'audio' && (
                  <Fragment>
                    <ScrollArea
                      className="scroll-shadow mediaSources__SourceListWrapper"
                      contentStyle={{ paddingBottom: '0.25em' }}
                      contentClassName="mediaSources__SourceList"
                      horizontal={false}
                    >
                      {modal.deviceList.audio.map(device => (
                        <MediaSource
                          device={device}
                          key={device.deviceId}
                          onSelectDevice={this.selectDevice}
                          type="audio"
                          isGold={isGold}
                          videoQuality={videoQuality}
                        />
                      ))}
                    </ScrollArea>

                    <div className="mediaSources__ScreenShareContainer">
                      <Switch
                        label="Push to talk"
                        checked={forcePtt ? true : audioPtt}
                        id="mediaPttCheckbox"
                        onChange={checked => this.setClientAudioPtt(checked)}
                        disabled={forcePtt}
                      />

                      {forcePtt && (
                        <span className="modal__SubText">
                          Push-to-talk is forced in this room
                        </span>
                      )}
                    </div>
                  </Fragment>
                )
              }

              {modal.mediaType === 'video'
                && !modal.deviceList.video.length
                && (
                  <span className="text text-red modal__Error">No video sources</span>
                )}

              {modal.mediaType === 'audio'
                && !modal.deviceList.audio.length
                && (
                  <span className="text text-red modal__Error">No audio sources</span>
                )}

              {error && <span className="text text-red modal__Error">{error.message}</span>}

              <div className="modal__SubText">
                Inappropriate broadcasts will be terminated as
                per the
                {' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  terms&nbsp;and&nbsp;conditions
                </a>
              </div>
            </Fragment>
          )}
        </div>
      </Modal>
    );
  }
}

MediaSelectionModal.defaultProps = {
  error: null,
  videoQuality: null,
  isGold: false,
  qualityOptions: [],
};

const videoQualityType = PropTypes.shape({
  label: PropTypes.string,
  id: PropTypes.string,
  dimensions: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  frameRate: PropTypes.number,
});

MediaSelectionModal.propTypes = {
  modal: PropTypes.shape({
    open: PropTypes.bool,
    deviceList: PropTypes.shape({
      video: PropTypes.array,
      audio: PropTypes.array,
    }),
    selectedDevices: PropTypes.shape({
      video: PropTypes.string,
      audio: PropTypes.string,
    }),
    mediaType: PropTypes.string,
    loading: PropTypes.bool,
  }).isRequired,
  forcePtt: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  isGold: PropTypes.bool,
  videoQuality: videoQualityType,
  qualityOptions: PropTypes.arrayOf(videoQualityType),
  audioPtt: PropTypes.bool.isRequired,
};

export default MediaSelectionModal;
