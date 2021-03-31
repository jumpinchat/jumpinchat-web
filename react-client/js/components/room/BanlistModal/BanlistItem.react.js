/**
 * Created by Zaccary on 28/05/2016.
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const BanListItem = ({ removeLabel, item, onRemove }) => (
  <div className="banlist__Item">
    <div className="banlist__Details">
      <div className="banlist__Handle">
        {item.handle}
        {item.username && (
          <>
            {' '}
            <span className="text-sub">
              {item.username}
            </span>
          </>
        )}
      </div>
      <div
        className="banlist__Timestamp"
        title={moment(item.timestamp).format('ddd, h:mmA')}
      >
        {moment(item.timestamp).fromNow()}
      </div>
    </div>
    <div className="banlist__Actions">
      <button
        type="button"
        className="button button-blue button-floating banlist__Action"
        onClick={onRemove}
      >
        {removeLabel}
      </button>
    </div>
  </div>
);

BanListItem.propTypes = {
  removeLabel: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  item: PropTypes.shape({
    handle: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    username: PropTypes.string,
  }).isRequired,
};

export default BanListItem;
