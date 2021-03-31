import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { setReportModal } from '../../../actions/ModalActions';
import { trackEvent } from '../../../utils/AnalyticsUtil';
import { sendReport } from '../../../utils/RoomAPI';

class ReportModal extends Component {
  constructor() {
    super();
    this.state = {
      error: null,
    };
    this.setReportModal = setReportModal;
    this.sendReport = sendReport;
    this.dismissModal = this.dismissModal.bind(this);
    this.submit = this.submit.bind(this);
  }

  dismissModal() {
    this.setState({ error: null });
    this.setReportModal(false);
    trackEvent('Report', 'Close report modal');
  }

  submit(e) {
    e.preventDefault();
    this.setState({ error: null });
    const {
      room,
      reporterId,
      targetId,
      messages,
    } = this.props;
    const reason = this.reason.value;
    const description = this.description.value;

    if (!reason) {
      return this.setState({ error: 'Select a reason' });
    }

    this.sendReport(room, reporterId, targetId, reason, description, messages);
    this.setReportModal(false);
  }

  render() {
    const {
      isOpen,
    } = this.props;

    const { error } = this.state;
    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        contentLabel="Room info modal"
      >
        <div className="modal__Header">
          Report user
        </div>
        <form onSubmit={this.submit}>
          <div className="modal__Body">
            <div className="form__InputGroup">
              <label
                htmlFor="reason"
                className="form__InputLabel"
              >
                Reason
              </label>
              <select
                id="reason"
                name="reason"
                className="input form__Input form__Input-inline form__Input-floating"
                ref={(e) => { this.reason = e; }}
              >
                <option value="" disabled selected>Please select a reason</option>
                <option value="harassment">Harassing or threatening me or a user</option>
                <option value="abuse">Abusive, defamatory or racist behaviour</option>
                <option value="nudity">Nudity</option>
                <option value="explicit">Explicit or offensive broadcast</option>
                <option value="other">Other (please describe below)</option>
              </select>
            </div>

            <div className="form__InputGroup">
              <label
                htmlFor="description"
                className="form__InputLabel"
              >
                More information (optional)
              </label>
              <textarea
                id="description"
                name="description"
                cols="30"
                rows="10"
                className="input form__Input form__Input-inline form__Input-floating form__Input-textarea"
                ref={(e) => { this.description = e; }}
              />
            </div>
            {error && (
              <span className="text text-red modal__Error">{error}</span>
            )}

            <p className="text-sub">
              Your visible chat log, as well as private conversations with the user being reported,
              will be sent as part of the report.
            </p>
            <p className="text-sub">
              Report users for violating
              the <a href="/terms" target="_blank">terms of service</a>.
              Please refrain from reporting users for actions that can be
              dealt with by room moderators, such as breaking room rules.
            </p>
            <p className="text-sub">
              See the <a href="/help/reporting" target="_blank">help page</a> for more
              information about reporting.
            </p>
          </div>
          <div className="modal__Footer">
            <button
              type="submit"
              className="button button-blue button-floating modal__Action"
            >
              Send
            </button>
            <button
              type="button"
              className="button button-default button-floating modal__Action"
              onClick={this.dismissModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    );
  }
}

ReportModal.defaultProps = {
  targetId: null,
};

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  room: PropTypes.string.isRequired,
  reporterId: PropTypes.string.isRequired,
  targetId: PropTypes.string,
  messages: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.string.isRequired,
    userId: PropTypes.string,
    handle: PropTypes.string,
  })).isRequired,
};

export default ReportModal;
