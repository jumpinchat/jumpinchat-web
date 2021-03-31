/**
 * Created by vivaldi on 25/10/2014.
 */

module.exports = {
  appPath: 'react-client',
  analytics: {
    fb: '',
    ga: '',
  },
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/tc',
    options: {
      server: {
        poolSize: process.env.MONGODB_POOL || 10,
      },
    },
  },
  redis: {
    uri: process.env.REDIS_URI || 'redis://user:redis@localhost:6379/',
    socketExpire: 60 * 60 * 10,
    lastSeenExpire: 1,
  },
  janus: {
    ws_uri_internal: process.env.JANUS_WS_URI_INTERNAL || ':8188',
    http_uri_internal: process.env.JANUS_HTTP_URI_INTERNAL || ':8088/janus',
    http_uri: process.env.JANUS_HTTP_URI || ':8088/janus',
    http_admin_uri_internal: process.env.JANUS_HTTP_URI_INTERNAL || 'http://localhost:7888/admin',
    ws_uri: process.env.JANUS_WS_URI || ':8188',
    serverIds: process.env.JANUS_SERVER_IDS
      ? process.env.JANUS_SERVER_IDS.split(',')
      : ['janus', 'janus2', 'janus3', 'janus4'],
    room: {
      bitrate: parseInt(process.env.JANUS_BITRATE, 10) || 256 * 1000,
      roomSize: parseInt(process.env.JANUS_ROOM_SIZE, 10) || 12,
      codec: process.env.JANUS_CODEC || 'vp8',
    },
    token: {
      expire: 60 * 60 * 24,
      secret: process.env.JANUS_TOKEN_SECRET || 'janus',
      plugins: process.env.JANUS_PLUGINS || 'janus.plugin.videoroom',
    },
  },
  turn: {
    uris: [
      'turn.jumpin.chat',
      'turn2.jumpin.chat',
      'turn3.jumpin.chat',
    ],
    ttl: process.env.TURN_TTL || 60 * 60 * 24,
  },
  auth: {
    cookieSecret: 'foo',
    secureSessionCookie: false,
    jwt_secret: 'jwtsecret',
    turnSecret: 'janus',
    activityTokenTimeout: 1000 * 60 * 60 * 24,
    cookieTimeout: 1000 * 60 * 60 * 24 * 180,
  },
  room: {
    banTimeout: 1000 * 60 * 60 * 24,
    guestModTimeout: 1000 * 60 * 60 * 24,
    ignoreTimeout: 1000 * 60 * 5,
  },
  report: {
    bucket: 'jic-report-screenshots',
    logTimeout: 60 * 10,
    limit: 2,
    limitExpire: 60 * 3,
  },
  ageVerification: {
    bucket: 'jic-age-verification',
    timeout: 60 * 10,
    deniedTimeout: 1000 * 60 * 60 * 24 * 14,
  },
  verification: {
    emailTimeout: 1000 * 60 * 60 * 1,
    pwResetTimeout: 1000 * 60 * 60 * 1,
  },
  yt: {
    key: process.env.YT_API_KEY || 'foo',
    cacheExpire: 60 * 10,
    detailCacheExpire: 60 * 11,
  },
  siteban: {
    defaultExpire: 60 * 5,
  },
  aws: {
    ses: {
      accessKey: process.env.AWS_SES_ACCESS_KEY || '',
      secret: process.env.AWS_SES_SECRET || '',
      region: process.env.AWS_SES_REGION || 'us-east-1',
      sendLimit: 14, // messages per second
    },
    s3: {
      jicUploads: {
        accessKey: process.env.AWS_S3_UPLOADS_ACCESS_KEY,
        secret: process.env.AWS_S3_UPLOADS_SECRET,
        bucket: process.env.AWS_S3_UPLOADS_BUCKET,
      },
    },
  },
  push: {
    publicKey: 'BDC5n0moH2QgSOByTOTdOuBV2Gip5kzy1EZCvhabU8YfVVyaJNI3NkVXOq2OiRtgBWJEhk8jkXaek2Tk85uyipw',
    privateKey: '2aok-65bgHeGevxa8LkT9nCTdmeAwgoEgChTY7dapRw',
    gcmAPIKey: process.env.GCM_API_KEY,
  },
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SK || 'sk_test_CL67LFZDQcYNq9dXF2f5qeWM',
    },
  },
};
