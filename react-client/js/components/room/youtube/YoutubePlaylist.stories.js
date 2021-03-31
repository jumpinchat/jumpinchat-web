import React from 'react';
import YoutubePlaylist from './YoutubePlaylist.react';

export default {
  title: 'components/room/youtube/youtubePlaylist',
};


const playlist = [
  {
    _id: 'id',
    mediaType: 'youtube',
    startedBy: {
      userId: 'userId',
      username: 'username',
      pic: 'https://www.placecage.com/160/160',
    },
    duration: 300,
    title: 'Some video',
    description: 'some description of the video',
    channelId: 'UC84X0epDRFdTrybxEX8ZWkA',
    link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    thumb: 'https://www.placecage.com/240/240',
    createdAt: new Date(Date.now() - (1000 * 60 * 2)).toISOString(),
  },
  {
    _id: 'id2',
    mediaType: 'youtube',
    startedBy: {
      userId: 'userId',
      username: 'username',
      pic: 'https://www.placecage.com/160/160',
    },
    duration: 420,
    title: 'Some other video',
    description: 'some description of the video',
    channelId: 'UC84X0epDRFdTrybxEX8ZWkA',
    link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    thumb: 'https://www.placecage.com/240/240',
    createdAt: new Date(Date.now() - (1000 * 60 * 5)).toISOString(),
  },
];

export const Playlist = () => (
  <div style={{ maxWidth: 320 }}>
    <YoutubePlaylist
      list={playlist}
      onRemoveItem={() => {}}
    />
  </div>
);

export const optionsOpen = () => (
  <div style={{ maxWidth: 320 }}>
    <YoutubePlaylist
      list={playlist.map(p => ({ ...p, optionsOpen: p._id === 'id2' }))}
      onRemoveItem={() => {}}
    />
  </div>
);
