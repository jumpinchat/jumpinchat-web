import React from 'react';
import PropTypes from 'prop-types';
import ScrollArea from '../../elements/ScrollArea.react';
import YoutubePlaylistItem from './YoutubePlaylistItem.react';

const YoutubePlaylist = ({
  list,
  onRemoveItem,
}) => (
  <ScrollArea
    className="youtube__PlaylistWrapper"
    contentStyle={{ paddingBottom: '0.25em' }}
    horizontal={false}
  >
    {list.length === 0 && (
      <div className="youtube__PlaylistEmpty">
        <span className="text-sub">Playlist is empty</span>
      </div>
    )}

    {list.length > 0 && list.map((listItem, index) => (
      <YoutubePlaylistItem
        item={listItem}
        key={listItem._id}
        index={index}
        onDelete={onRemoveItem}
      />
    ))}
  </ScrollArea>
);

YoutubePlaylist.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    mediaType: PropTypes.string.isRequired,
    startedBy: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      pic: PropTypes.string.isRequired,
    }).isRequired,
    duration: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    channelId: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  })).isRequired,
  onRemoveItem: PropTypes.func.isRequired,
};

export default YoutubePlaylist;
