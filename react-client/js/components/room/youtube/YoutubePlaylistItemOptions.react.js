import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import WrappedListItems from '../../elements/ListItems.react';
import { setPlaylistItemOptions } from '../../../actions/YoutubeActions';

export const playlistItemActions = {
  ITEM_REMOVE: 'ITEM_REMOVE',
};

class YoutubePlaylistItemOptions extends Component {
  constructor() {
    super();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.createListOptions = this.createListOptions.bind(this);
    this.handleToggleOptions = this.handleToggleOptions.bind(this);
    this.handleSelectOption = this.handleSelectOption.bind(this);
    this.setPlaylistItemOptions = setPlaylistItemOptions;
  }

  handleClickOutside() {
    this.setPlaylistItemOptions(null);
  }

  handleToggleOptions(e) {
    e.stopPropagation();
    const {
      id,
      open,
    } = this.props;
    this.setPlaylistItemOptions(open ? null : id);
  }

  handleSelectOption(action, index) {
    const { onSelectAction } = this.props;

    onSelectAction(action, index);
    this.setPlaylistItemOptions(null);
  }

  createListOptions() {
    const {
      id,
      onSelectAction,
    } = this.props;

    return [
      {
        text: 'Remove video',
        props: {
          onClick: () => this.handleSelectOption(playlistItemActions.ITEM_REMOVE, id),
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
          className="button youtube__PlaylistItemAction"
          onClick={this.handleToggleOptions}
          type="button"
        >
          <FontAwesomeIcon
            icon={['far', 'ellipsis-v']}
          />
        </button>
        {
          open && (
            <WrappedListItems
              options={this.createListOptions()}
              onClickOutside={this.handleClickOutside}
            />
          )
        }
      </TetherComponent>
    );
  }
}

YoutubePlaylistItemOptions.propTypes = {
  id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onSelectAction: PropTypes.func.isRequired,
};

export default YoutubePlaylistItemOptions;
