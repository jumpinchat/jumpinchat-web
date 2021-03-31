const mongoose = require('mongoose');
const PlaylistModel = require('./playlist.model');

module.exports.getMediaByRoomId = function getMediaByRoomName(room) {
  return new Promise(async (resolve, reject) => {
    try {
      const playlist = await PlaylistModel
        .findOne({ room })
        .populate({
          path: 'media.startedBy',
          select: ['username', 'profile.pic'],
        })
        .exec();

      if (playlist) {
        return resolve(playlist);
      }

      const newPlaylist = await PlaylistModel.create({
        room,
      });
      return resolve(newPlaylist);
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports.removePlaylistByRoomId = function removePlaylistByRoomId(room) {
  return PlaylistModel.deleteOne({ room }).exec();
};
