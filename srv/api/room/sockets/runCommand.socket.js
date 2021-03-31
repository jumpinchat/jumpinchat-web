/**
 * Created by Zaccary on 24/05/2016.
 */

const moment = require('moment');
const log = require('../../../utils/logger.util')({ name: 'runCommand.socket' });
const roomController = require('../room.controller');
const utils = require('../../../utils/utils');
const errors = require('../../../config/constants/errors');
const RoomUtils = require('../room.utils');
const changeHandleSocket = require('./changeHandle.socket');
const handleCloseBroadcastSocket = require('./handleCloseBroadcast.socket');
const fetchBanlistSocket = require('./fetchBanlist.socket');
const handleBanUserSocket = require('./handleBanUser.socket');
const handleUnbanUserSocket = require('./handleUnbanUser.socket');
const privateMessageSocket = require('./privateMessage.socket');
const handleSilenceUserSocket = require('./handleSilenceUser.socket');
const handleClearFeedSocket = require('./handleClearFeed.socket');
const handleKickUserSocket = require('./handleKickUser.socket');
const handleSetTopicSocket = require('./handleSetTopic.socket');

function getTargetUser(socket, handle, cb) {
  return RoomUtils.getSocketCacheInfo(socket.id, (err, socketInfo) => {
    if (err) {
      log.error({ err }, 'failed to get socket cache info');
      return cb(utils.messageFactory({
        context: 'chat',
        message: 'Failed to run command',
      }));
    }

    if (!socketInfo) {
      log.error({ socket, handle }, 'socket info not found');
      return cb(utils.messageFactory({
        context: 'chat',
        message: 'Failed to run command',
      }));
    }

    return RoomUtils.getRoomById(socketInfo.room_id, (err, targetRoom) => {
      if (err) {
        log.fatal({ err, roomId: socketInfo.room_id }, 'failed to get room');
        return cb(utils.messageFactory({
          context: 'chat',
          message: 'Failed to run command',
        }));
      }

      if (!targetRoom) {
        return cb(utils.messageFactory({
          context: 'chat',
          name: 'ERR_NO_ROOM',
          message: 'Room has gone, press F5 to pay respects',
        }));
      }

      const targetUser = targetRoom.users
        .find(user => user.handle === handle || user.username === handle);

      if (!targetUser) {
        const error = new Error(`'${handle}' doesn't appear to be a user`);
        error.name = 'ERR_NO_USER';
        return cb(utils.messageFactory({
          context: 'chat',
          name: 'ERR_NO_USER',
          message: `'${handle}' doesn't appear to be a user`,
        }));
      }

      return cb(null, targetUser, targetRoom);
    });
  });
}

function getHistoricalUser(socket, handle) {
  return new Promise((resolve, reject) => RoomUtils.getSocketCacheInfo(socket.id, async (err, socketInfo) => {
    if (err) {
      log.error({ err }, 'failed to get socket cache info');
      return reject(new Error('failed to fetch user'));
    }

    try {
      const historyEntry = await RoomUtils.getHistoryEntryByNames(socketInfo.room_id, handle, handle);
      if (historyEntry) {
        return resolve(historyEntry.user);
      }

      log.error('no history entry');
      const error = new Error('ERR_NO_USER');
      error.message = `${handle} doesn't appear to be a user`;
      return reject(error);
    } catch (err) {
      log.fatal({ err }, 'failed to fetch history entry');
      return reject(err);
    }
  }));
}

function getBanlistItem(socket, handle, cb) {
  return RoomUtils.getSocketCacheInfo(socket.id, (err, socketInfo) => {
    if (err) {
      log.error({ err }, 'failed to get socket cache info');
      return cb({
        context: 'chat',
        message: 'Failed to run command',
      });
    }


    return RoomUtils.getRoomById(socketInfo.room_id, (err, targetRoom) => {
      if (err) {
        log.fatal({ err, roomId: socketInfo.room_id }, 'failed to get room');
        return cb(utils.messageFactory({
          context: 'chat',
          message: 'Failed to run command',
        }));
      }

      const banlistItem = targetRoom.banlist.find(b => b.handle === handle);

      if (!banlistItem) {
        return cb(utils.messageFactory({
          context: 'chat',
          message: `'${handle}' doesn't appear to be in the banlist`,
        }));
      }

      return cb(null, { banlistId: banlistItem._id, handle });
    });
  });
}

module.exports = function runCommandSocket(socket, io) {
  const changeHandle = changeHandleSocket(socket, io);
  const handleCloseBroadcast = handleCloseBroadcastSocket(socket, io);
  const fetchBanlist = fetchBanlistSocket(socket, io);
  const handleUnbanUser = handleUnbanUserSocket(socket, io);
  const handleBanUser = handleBanUserSocket(socket, io);
  const privateMessage = privateMessageSocket(socket, io);
  const handleSilenceUser = handleSilenceUserSocket(socket, io);
  const handleClearFeed = handleClearFeedSocket(socket, io);
  const handleKickUser = handleKickUserSocket(socket, io);
  const handleSetTopic = handleSetTopicSocket(socket, io);

  /**
   * returns help information for a specific command, if
   * one is specified. If no command is specified, it
   * returns info for all commands.
   *
   * @param {string} command
   */
  function commandHelp(command = null) {
    let messages;
    switch (command) {
      case 'nick':
        messages = ['/nick <new nickname> - change your nickname to the one supplied'];
        break;
      case 'color':
        messages = ['/color - change your chat text to a random new color'];
        break;
      case 'shrug':
        messages = ['/shrug - ¯\\_(ツ)_/¯'];
        break;
      case 'me':
        messages = ['/me <action> - emote an action'];
        break;
      case 'pm':
      case 'msg':
        messages = [`/${command} <nickname> <message> - send a private message to a user`];
        break;
      case 'topic':
        messages = ['/topic - prints the room topic and displays who set it'];
        break;
      case 'help':
      case '?':
        messages = [
          '/help (<command>) - get help with a specific command, or all commands if none is sent',
        ];
        break;
      default:
        messages = [
          ' ',
          'Chat commands are the following:',
          ...commandHelp('nick'),
          ...commandHelp('color'),
          ...commandHelp('shrug'),
          ...commandHelp('me'),
          ...commandHelp('msg'),
          ...commandHelp('topic'),
          ...commandHelp('help'),
        ];
        break;
    }

    return messages;
  }


  function modCommandHelp(command = null) {
    let messages;
    switch (command) {
      case 'close':
        messages = ['/close <handle|username> - close a broadcast'];
        break;
      case 'kick':
        messages = ['/kick <handle|username> - kick a user by their handle or username'];
        break;
      case 'ban':
        messages = ['/ban <handle|username> <duration(hours)> - ban a user by their handle or username'];
        break;
      case 'unban':
        messages = ['/unban <handle|username> - unban a user by their handle or username'];
        break;
      case 'silence':
        messages = ['/silence <handle|username> - silence a user for 2 minutes'];
        break;
      case 'clear':
        messages = ['/clear - remove all messages from the chat feed'];
        break;
      case 'topic':
        messages = ['/topic <topic> - set the room topic'];
        break;
      default:
        messages = [
          ' ',
          'Moderator commands are the following:',
          ...modCommandHelp('close'),
          ...modCommandHelp('kick'),
          ...modCommandHelp('ban'),
          ...modCommandHelp('unban'),
          ...modCommandHelp('silence'),
          ...modCommandHelp('clear'),
          ...modCommandHelp('topic'),
        ];
        break;
    }

    return messages;
  }

  /**
   * run a user command sent though chat
   *
   * @param socketId
   * @param commandArr
   * @param cb
   * @returns {*}
   */
  return function runCommand(msg) {
    // implied that the message matches the regexp for commands
    // as determined in the socket listener.
    let value = null;

    if (!msg.message) {
      return socket.emit('client::error',
        utils.messageFactory({
          context: 'chat',
          error: 'ERR_NO_MESSAGE',
          message: 'command message body missing',
        }));
    }

    if (msg.message.value) {
      if (msg.message.value.length > 256) {
        return socket.emit('client::error',
          utils.messageFactory({
            context: 'chat',
            error: 'PayloadSizeError',
            message: 'Message payload is too large, maximum size is 256 characters',
          }));
      }

      value = msg.message.value.trim();
    }

    log.debug({ command: msg.message.command, value }, 'runCommand');

    // find out if it's a legitimate command
    switch (msg.message.command) {
      case 'nick':
        if (!value) {
          return socket.emit('client::error',
            utils.messageFactory({
              context: 'chat',
              error: 'ERR_NO_HANDLE',
              message: 'nick missing',
            }));
        }

        changeHandle({ handle: value }, 'chat');
        break;
      case 'color':
        roomController.changeColor(socket.id, null, (err, result) => {
          if (err) {
            log.error({ err }, 'error changing color');
            return socket.emit('client::error',
              utils.messageFactory({
                context: 'chat',
                message: err.message,
                error: err.error,
              }));
          }

          socket.emit('room::status',
            utils.messageFactory({
              message: 'Chat color changed',
              color: result.color,
            }));

          socket.emit('self::user', { user: { color: result.color } });
          io.to(result.room).emit('room::updateUser', { user: result.user, color: result.color });
        });

        break;
      case 'shrug':
        RoomUtils.getSocketCacheInfo(socket.id, (err, socketInfo) => {
          if (err) {
            log.fatal({ err }, 'error getting socket info');
            return socket.emit('client::error',
              utils.messageFactory({
                context: 'chat',
                message: 'something went wrong ¯\\_(ツ)_/¯',
              }));
          }

          if (!socketInfo) {
            log.fatal('no socket info');
            return socket.emit('client::error',
              utils.messageFactory({
                context: 'chat',
                message: 'something went wrong ¯\\_(ツ)_/¯',
              }));
          }

          io.to(socketInfo.name).emit('room::message',
            utils.messageFactory({
              message: '¯\\_(ツ)_/¯',
              color: socketInfo.color,
              handle: socketInfo.handle,
              userId: socketInfo.userListId,
            }));
        });

        break;
      case 'me':
        if (!value) {
          return socket.emit('client::error',
            utils.messageFactory({
              context: 'chat',
              error: 'ERR_NO_MESSAGE',
              message: 'You actually need to do something...',
            }));
        }

        RoomUtils.getSocketCacheInfo(socket.id, (err, socketInfo) => {
          if (err) {
            log.fatal({ err }, 'error getting socket info');
            return socket.emit('client::error',
              utils.messageFactory({
                context: 'chat',
                message: 'something went wrong',
              }));
          }

          if (!socketInfo) {
            log.error({ socketId: socket.id }, 'socket info missing');
            return socket.emit('client::error',
              utils.messageFactory({
                context: 'chat',
                message: 'Invalid session, please refresh',
              }));
          }

          io.to(socketInfo.name).emit('room::status',
            utils.messageFactory({
              message: `* ${socketInfo.handle} ${value}`,
              color: socketInfo.color,
              handle: socketInfo.handle,
              userId: socketInfo.userListId,
            }));
        });

        break;

      case 'msg':
      case 'pm': {
        if (!value) {
          return socket.emit('client::error',
            utils.messageFactory({
              context: 'chat',
              error: 'ERR_NO_VALUE',
              message: 'missing nickname or username',
            }));
        }

        const [handle, message] = value.match(/^(\S+)\s?(.*)/).slice(1);

        if (!message) {
          return socket.emit('client::error',
            utils.messageFactory({
              context: 'chat',
              error: 'ERR_NO_VALUE',
              message: 'Missing message',
            }));
        }

        return getTargetUser(socket, handle, (err, targetUser, targetRoom) => {
          if (err) {
            log.error({ err }, 'could not get target user');
            return socket.emit('client::error', err);
          }

          return privateMessage({
            room: targetRoom.name,
            userListId: targetUser._id,
            message,
          });
        });
      }

      case 'close':
        if (!value) {
          return socket.emit('client::error',
            utils.messageFactory({
              context: 'chat',
              error: 'ERR_NO_HANDLE',
              message: 'missing nickname or username',
            }));
        }

        getTargetUser(socket, value, (err, targetUser) => {
          if (err) {
            return socket.emit('client::error', err);
          }

          return handleCloseBroadcast({ user_list_id: targetUser._id }, (err) => {
            if (err) {
              return socket.emit('client::error', utils.messageFactory({
                context: 'chat',
                message: 'Failed to close broadcast',
              }));
            }
          });
        });
        break;
      case 'banlist':
        fetchBanlist();
        break;
      case 'silence':
        if (!value) {
          return socket.emit('client::error',
            utils.messageFactory({
              context: 'chat',
              error: 'ERR_NO_HANDLE',
              message: 'missing nickname or username',
            }));
        }

        getTargetUser(socket, value, (err, targetUser) => {
          if (err) {
            return socket.emit('client::error', err);
          }

          return handleSilenceUser({ user_list_id: String(targetUser._id) }, (err) => {
            if (err) {
              log.error({ err }, 'failed to silence user');
              return socket.emit('client::error', {
                context: 'chat',
                message: 'Failed to silence user',
              });
            }
          });
        });
        break;
      case 'kick': {
        if (!value) {
          return socket.emit('client::error', utils.messageFactory({
            context: 'chat',
            error: 'ERR_NO_HANDLE',
            message: 'missing nickname or username',
          }));
        }

        const [handle] = value.split(' ');

        const kickCallback = targetUser => handleKickUser({ user_list_id: String(targetUser) }, (err) => {
          if (err) {
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'Failed to kick user',
            }));
          }
        });

        getTargetUser(socket, handle, async (err, targetUser) => {
          if (err) {
            if (err.name === 'ERR_NO_USER') {
              return socket.emit('client::error', utils.messageFactory({
                context: 'chat',
                message: 'User not found',
              }));
            }

            return socket.emit('client::error', err);
          }

          return kickCallback(targetUser._id);
        });
        break;
      }
      case 'ban': {
        if (!value) {
          return socket.emit('client::error', utils.messageFactory({
            context: 'chat',
            error: 'ERR_NO_HANDLE',
            message: 'missing nickname or username',
          }));
        }

        const [handle, duration] = value.split(' ');

        log.debug({ handle, duration }, 'ban user command');

        const banCallback = targetUser => handleBanUser({ user_list_id: String(targetUser), duration }, (err) => {
          if (err) {
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'Failed to ban user',
            }));
          }
        });

        getTargetUser(socket, handle, async (err, targetUser) => {
          if (err && err.name === 'ERR_NO_USER') {
            try {
              const historicalUser = await getHistoricalUser(socket, handle);
              if (!historicalUser) {
                return socket.emit('client::error', utils.messageFactory({
                  context: 'chat',
                  message: 'User not found',
                }));
              }

              return banCallback(historicalUser.userListId);
            } catch (historicalErr) {
              return socket.emit('client::error', utils.messageFactory({
                context: 'chat',
                message: historicalErr.message || 'failed to ban user',
              }));
            }
          } else if (err) {
            return socket.emit('client::error', err);
          }

          return banCallback(targetUser._id);
        });
        break;
      }
      case 'unban': {
        if (!value) {
          socket.emit('client::error',
            {
              context: 'chat',
              error: 'ERR_NO_HANDLE',
              message: 'missing nickname or username',
            });
          break;
        }

        getBanlistItem(socket, value, (err, data) => {
          if (err) {
            return socket.emit('client::error', err);
          }

          return handleUnbanUser(data);
        });
        break;
      }

      case 'topic':
        return RoomUtils.getSocketCacheInfo(socket.id, async (err, socketInfo) => {
          if (err) {
            log.fatal({ err }, 'failed to get socket cache info');
            return socket.emit('client::error', err);
          }

          if (!socketInfo) {
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              ...errors.ERR_SRV,
            }));
          }

          if (value) {
            return handleSetTopic({
              userListId: socketInfo.userListId,
              roomName: socketInfo.name,
              topic: value,
            });
          }


          try {
            const {
              settings: {
                topic,
              },
            } = await RoomUtils.getRoomByName(socketInfo.name);

            let topicMessages = [
              'no topic set',
            ];

            if (topic.text) {
              const topicTime = moment(topic.updatedAt).format('DD/MM/YYYY');
              topicMessages = [
                ' ',
                `room topic: ${topic.text}`,
                `set by ${topic.updatedBy.username} on ${topicTime}`,
                ' ',
              ];
            }

            return topicMessages
              .forEach(message => socket.emit('room::status', utils.messageFactory({ message })));
          } catch (err) {
            log.fatal({ err }, 'failed to get topic');
            return socket.emit('client::error', err);
          }
        });

      case 'clear':
        handleClearFeed();
        break;
      case 'lastseen':
        break;
      case 'modhelp':
        modCommandHelp(value).forEach((line) => {
          socket.emit('room::status',
            utils.messageFactory({
              message: line,
            }));
        });
        break;
      case 'help':
      case '?':
        commandHelp(value).forEach((line) => {
          socket.emit('room::status',
            utils.messageFactory({
              message: line,
            }));
        });
        break;

      default:
        socket.emit('room::status',
          utils.messageFactory({
            message: `'/${msg.message.command}' is not a command, use '/help' to see a list of available commands`,
          }));
        break;
    }
  };
};
