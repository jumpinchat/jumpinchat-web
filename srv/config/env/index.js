/**
 * Created by vivaldi on 25/10/2014.
 */

const _ = require('lodash');
const path = require('path');

const all = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3232,
  deployLocation: process.env.DEPLOY_LOCATION,

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  chatcolors: [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'aqua',
    'orange',
    'redalt',
    'greenalt',
    'yellowalt',
    'bluealt',
    'purplealt',
    'aquaalt',
    'orangealt',
  ],

  uploads: {
    userProfileAvatar: {
      width: 256,
      height: 256,
      size: 1024 * 512,
    },
    roomCover: {
      width: 640,
      height: 480,
      size: 1024 * 512,
    },
    userIcon: {
      width: 48,
      height: 48,
      size: 1024 * 128,
    },
  },
  roomRegExp: '[a-zA-Z0-9-]+',
  reservedUsernames: [
    'register',
    'login',
    'help',
    'settings',
    'admin',
    'directory',
    'api',
    'terms',
    'privacy',
    'contact',
    'users',
    'group',
    'groups',
    'rooms',
    'room',
    'support',
    'messages',
    'profile',
    'ageverify',
    'closed',
    'sitemod',
  ],

  admin: {
    userList: {
      itemsPerPage: 30,
    },
  },
};

module.exports = _.merge(
  all,
    require(`./${all.env}.js`) // eslint-disable-line
);
