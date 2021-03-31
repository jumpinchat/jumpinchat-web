import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';
import TetherComponent from 'react-tether';
import { seekVideo } from '../../../utils/YoutubeAPI';

momentDurationFormat(moment);

class YoutubeProgress extends PureComponent {
  static getFormattedTime(seconds) {
    return moment
      .duration(seconds, 'seconds')
      .format('hh:mm:ss', {
        stopTrim: 'm',
      });
  }

  constructor() {
    super();
    this.state = {
      seekX: null,
      seekTime: 0,
      formattedTime: null,
    };
    this.progress = null;

    this.setSeekTargetPos = this.setSeekTargetPos.bind(this);
    this.resetSeekTargetPos = this.resetSeekTargetPos.bind(this);
    this.applySeek = this.applySeek.bind(this);
  }

  componentDidMount() {
    this.progress.addEventListener('mousemove', this.setSeekTargetPos, false);
    this.progress.addEventListener('click', this.applySeek, false);
    this.progress.addEventListener('mouseout', this.resetSeekTargetPos, false);
  }

  componentWillUnmount() {
    this.progress.removeEventListener('mousemove', this.setSeekTargetPos);
    this.progress.removeEventListener('click', this.applySeek);
    this.progress.removeEventListener('mouseout', this.resetSeekTargetPos);
  }

  setSeekTargetPos(e) {
    const { duration } = this.props;
    const elem = e.target;
    const seekPercentage = e.offsetX / elem.offsetWidth;
    const baseSeekTime = Math.round(duration * seekPercentage);
    const seekTime = baseSeekTime > 0 ? baseSeekTime : 0;
    const formattedTime = YoutubeProgress.getFormattedTime(seekTime);
    this.setState({
      seekTime,
      formattedTime,
      seekX: e.offsetX - 4,
    });
  }

  resetSeekTargetPos() {
    this.setState({
      seekX: null,
    });
  }

  applySeek() {
    const { seekTime } = this.state;
    seekVideo(seekTime);
  }

  render() {
    const { duration, currentTime } = this.props;
    const { seekX, formattedTime } = this.state;

    return (
      <div className="youtube__Progress">
        <div
          className="youtube__ProgressBarWrapper"
          ref={(e) => { this.progress = e; }}
        >
          <div className="youtube__ProgressBarBackground">
            <div
              className="youtube__ProgressBar"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          {!!seekX && (
            <TetherComponent
              attachment="top center"
              constraints={[{
                to: 'scrollParent',
                attachment: 'together',
              }]}
            >
              <div
                className="youtube__ProgressBarSeek"
                style={{ transform: `translateX(${seekX}px)` }}
              />
              <div className="youtube__ProgressBarSeekTooltip">
                {formattedTime}
              </div>
            </TetherComponent>
          )}
        </div>


        <div className="youtube__Countdown">
          <span>
            {moment
              .duration(currentTime, 'seconds')
              .format('hh:mm:ss', {
                stopTrim: 'm',
              })
            }
          </span>
          {'/'}
          <span>{moment.duration(duration, 'seconds').format('hh:mm:ss')}</span>
        </div>
      </div>
    );
  }
}

YoutubeProgress.propTypes = {
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default YoutubeProgress;
