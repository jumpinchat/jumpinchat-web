const exceptions = {
  ValueMissingError: {
    name: 'ValueMissingError',
    message: 'Required value is missing',
  },
};

module.exports = {
  ...exceptions,
  ERR_AUTH: {
    code: 'ERR_AUTH',
    message: 'User is not authorized',
  },

  // file upload
  ERR_FILE_TYPE: {
    code: 'ERR_FILE_TYPE',
    message: 'Invalid file type',
  },
  ERR_FILE_LIMIT: {
    code: 'ERR_FILE_LIMIT',
    message: 'File size or number limit reached',
  },
  ERR_UPLOAD_FAILED: {
    code: 'ERR_UPLOAD_FAILED',
    message: 'Error uploading file',
  },

  ERR_NO_USER: {
    code: 'ERR_NO_USER',
    message: 'no user found',
  },
  ERR_NO_ROOM: {
    code: 'ERR_NO_ROOM',
    message: 'room does not exist',
  },
  ERR_NO_ROOM_ID: {
    code: 'ERR_NO_ROOM_ID',
    message: 'missing room ID',
  },
  ERR_NO_USER_LIST_ID: {
    code: 'ERR_NO_USER_LIST_ID',
    message: 'user not found in room',
  },
  ERR_NO_OP_TYPE: {
    code: 'ERR_NO_OP_TYPE',
    message: 'no moderator type',
  },
  ERR_NO_HANDLE: {
    code: 'ERR_NO_HANDLE',
    message: 'handle missing',
  },
  ERR_HANDLE_EXISTS: {
    code: 'ERR_HANDLE_EXISTS',
    message: 'handle already in use',
  },
  ERR_HANDLE_VALIDATION: {
    code: 'ERR_HANDLE_VALIDATION',
    message: 'handle uses invalid characters',
  },
  ERR_HANDLE_LENGTH: {
    code: 'ERR_HANDLE_LENGTH',
    message: 'handle too long',
  },
  ERR_USER_BANNED: {
    code: 'ERR_USER_BANNED',
    message: 'You are banned, and can not complete this action',
  },
  ERR_NO_USER_SESSION: {
    code: 'ERR_NO_USER_SESSION',
    message: 'no user session',
  },
  ERR_YT_DEFAULT: {
    code: 'ERR_YT_DEFAULT',
    message: 'Can\'t play video for some reason',
  },
  ERR_YT_BAD_PARAMS: {
    code: 'ERR_YT_BAD_PARAMS',
    message: 'Invalid parameters, can\'t play video',
  },
  ERR_YT_NO_HTML5: {
    code: 'ERR_YT_NO_HTML5',
    message: 'Video can not be played in HTML5 player',
  },
  ERR_YT_NO_VIDEO: {
    code: 'ERR_YT_NO_VIDEO',
    message: 'Video not found',
  },
  ERR_YT_NO_EMBED: {
    code: 'ERR_YT_NO_EMBED',
    message: 'Video can\'t be played while embedded',
  },
  ERR_NOT_OWNER: {
    code: 'ERR_NOT_OWNER',
    message: 'Only the room owner can perform this action',
  },
  ERR_SRV: {
    code: 'ERR_SRV',
    message: 'An unexpected server error has occurred',
  },
  ERR_INVALID_BODY: {
    code: 'ERR_INVALID_BODY',
    message: '',
  },
  ERR_NO_PERMISSION: {
    code: 'ERR_NO_PERMISSION',
    message: 'You do not have permission to perform this action',
  },
  ERR_EXISTS: {
    code: 'ERR_EXISTS',
    message: 'Item already exists',
  },
  ERR_NOT_FOUND: {
    code: 'ERR_NOT_FOUND',
    message: 'Item does not exist',
  },
  ERR_INVALID_PARAMS: {
    code: 'ERR_INVALID_PARAMS',
    message: 'Invalid parameters supplied',
  },
};
