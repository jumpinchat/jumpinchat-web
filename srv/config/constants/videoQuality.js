module.exports = {
  VIDEO_240: {
    id: 'VIDEO_240',
    label: '240p',
    dimensions: {
      width: 320,
      height: 240,
    },
    frameRate: 15,
    bitRate: 128 * 1000,
  },
  VIDEO_480: {
    id: 'VIDEO_480',
    label: '480p',
    dimensions: {
      width: 640,
      height: 480,
    },
    frameRate: 30,
    bitRate: 1024 * 1000,
  },
  VIDEO_720: {
    id: 'VIDEO_720',
    label: '720p',
    dimensions: {
      width: 960,
      height: 720,
    },
    frameRate: 30,
    bitRate: 2048 * 1000,
  },
  VIDEO_720_60: {
    id: 'VIDEO_720_60',
    label: '720p 60fps',
    dimensions: {
      width: 960,
      height: 720,
    },
    frameRate: 60,
    bitRate: 4096 * 1000,
  },
  VIDEO_1080: {
    id: 'VIDEO_1080',
    label: '1080p',
    dimensions: {
      width: 1920,
      height: 1080,
    },
    frameRate: 30,
    bitRate: 4096 * 1000,
  },
  VIDEO_1080_60: {
    id: 'VIDEO_1080_60',
    label: '1080p 60fps',
    dimensions: {
      width: 1920,
      height: 1080,
    },
    frameRate: 60,
    bitRate: 8192 * 1000,
  },
  // VIDEO_4K: {
  //  id: 'VIDEO_4K',
  //  label: '4k',
  //  dimensions: {
  //    width: 3840,
  //    height: 2160,
  //  },
  //  frameRate: 30,
  //  bitRate: 20480 * 1000,
  // },
};
