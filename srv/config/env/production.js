module.exports = {
  appPath: 'dist',
  analytics: {
    fb: process.env.DEPLOY_LOCATION === 'production' ? '000000000000000' : '',
    ga: process.env.DEPLOY_LOCATION === 'production' ? 'UA-00000000-0' : '',
  },
  mongo: {
    uri: process.env.MONGODB_URI,
    options: {
      poolSize: process.env.MONGODB_POOL || 10,
      autoIndex: false, // Don't build indexes
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
    },
  },
  redis: {
    uri: process.env.REDIS_URI,
    socketExpire: 60 * 60 * 10,
    lastSeenExpire: 60 * 5,
  },
  janus: {
    ws_uri_internal: process.env.JANUS_WS_URI_INTERNAL,
    http_uri_internal: process.env.JANUS_HTTP_URI_INTERNAL,
    https_uri: process.env.JANUS_HTTPS_URI,
    http_admin_uri_internal: process.env.JANUS_HTTP_URI_INTERNAL,
    wss_uri: process.env.JANUS_WSS_URI,
    serverIds: process.env.JANUS_SERVER_IDS.split(','),
    room: {
      bitrate: parseInt(process.env.JANUS_BITRATE, 10) || 128 * 1000,
      roomSize: parseInt(process.env.JANUS_ROOM_SIZE, 10) || 12,
      codec: process.env.JANUS_CODEC || 'vp8',
    },
    token: {
      expire: 60 * 60 * 24,
      secret: process.env.JANUS_TOKEN_SECRET,
      plugins: process.env.JANUS_PLUGINS || 'janus.plugin.videoroom',
    },
  },
  turn: {
    uris: process.env.TURN_URIS.split(','),
    ttl: process.env.TURN_TTL || 60 * 60 * 24,
  },
  auth: {
    sharedSecret: process.env.SHARED_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    secureSessionCookie: false,
    jwt_secret: process.env.JWT_SECRET,
    turnSecret: 'janus',
    activityTokenTimeout: 1000 * 60 * 60 * 24,
    cookieTimeout: 1000 * 60 * 60 * 24 * 180,
    rateLimitDuration: 1000 * 30,
  },
  room: {
    banTimeout: 1000 * 60 * 60 * 24,
    guestModTimeout: 1000 * 60 * 60 * 24,
    ignoreTimeout: 1000 * 60 * 60 * 24,
    historyTimeout: 60 * 60 * 24,
    defaultSilenceTimeout: 120,
    floodTimeout: 10, // 10 seconds
    floodRefresh: 2,
    floodLimit: 5,
    banLimit: 4464, // hours
  },
  report: {
    bucket: 'jic-report-screenshots',
    logTimeout: 60 * 60 * 24 * 7,
    limit: 3,
    limitExpire: 60 * 30,
  },
  ageVerification: {
    bucket: 'jic-age-verification',
    timeout: 60 * 60 * 24 * 7,
    deniedTimeout: 1000 * 60 * 60 * 24 * 14,
  },
  verification: {
    emailTimeout: 1000 * 60 * 60 * 24 * 7,
    pwResetTimeout: 1000 * 60 * 60 * 24,
  },
  emailServiceUri: process.env.EMAIL_URL,
  yt: {
    keys: process.env.YT_API_KEY.split(','),
    key: process.env.YT_API_KEY,
    cacheExpire: 60 * 60 * 24 * 7,
    detailCacheExpire: 60 * 60 * 24 * 31,
  },
  siteban: {
    defaultExpire: 60 * 60 * 24 * 2,
  },
  admin: {
    stats: {
      ttl: 60 * 15,
    },
  },
  aws: {
    ses: {
      accessKey: process.env.AWS_SES_ACCESS_KEY,
      secret: process.env.AWS_SES_SECRET,
      region: process.env.AWS_SES_REGION || 'us-east-1',
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
    publicKey: process.env.PUSH_PUB,
    privateKey: process.env.PUSH_PRIV,
    gcmAPIKey: process.env.GCM_API_KEY,
  },
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SK,
      whKey: process.env.STRIPE_WH_KEY,
    },
  },
  messages: {
    cacheTimeout: 15,
    pageSize: 20,
    convoListSize: 10,
  },
  slack: {
    hookUrl: '',
  },
};
