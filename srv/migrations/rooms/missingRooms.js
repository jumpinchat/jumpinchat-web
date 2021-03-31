const co = require('co');
const log = require('../../utils/logger.util')({ name: 'migrations.missingRooms' });
const userModel = require('../../api/user/user.model');
const roomModel = require('../../api/room/room.model');

module.exports = async function missingRoomsMigrate() {
  log.info('initiate missing room migrations');
  const cursor = userModel.find({}).cursor();
  const handleCheckRoom = async (user) => {
    log.debug({ username: user.username });
    if (!user) {
      log.debug('no user');
      return Promise.resolve({});
    }

    let room;

    try {
      room = await roomModel.findOne({ name: user.username }).exec();
    } catch (err) {
      log.fatal({ err }, 'failed to fetch room');
      throw err;
    }

    if (!room) {
      log.debug({ username: user.username }, 'room missing, creating fresh one');
      const roomSettings = {
        public: false,
        moderators: [
          {
            user_id: user._id,
            username: user.username,
            session_token: user.session_id,
            permissions: {
              mute_room_chat: true,
              mute_room_audio: true,
              apply_password: true,
              assign_operator: true,
            },
          },
        ],
      };

      const roomDoc = {
        name: user.username,
        attrs: {
          creation_ip: user.attrs.join_ip,
          owner: user._id,
        },
        settings: roomSettings,
      };

      return roomModel.create(roomDoc);
    }

    log.debug({ username: user.username }, 'room exists');

    return Promise.resolve({});
  };

  co(function* loopUsers() {
    for (let doc = yield cursor.next(); doc != null; doc = yield cursor.next()) {
      yield handleCheckRoom(doc);
    }

    log.info('migration complete');
  });
};
