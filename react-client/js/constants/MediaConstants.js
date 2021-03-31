export const defaultVideoConstraints = {
  width: 320,
  height: 240,
  frameRate: {
    ideal: 15,
    max: 30,
  },
};

export const goldVideoConstraints = {
  width: 960,
  height: 720,
  frameRate: {
    ideal: 30,
    max: 30,
  },
};

export const getVideoConstraints = config => ({
  width: {
    min: 320,
    ideal: config.dimensions.width,
    max: config.dimensions.width,
  },
  height: {
    min: 240,
    ideal: config.dimensions.height,
    max: config.dimensions.height,
  },
  frameRate: {
    ideal: config.frameRate,
    max: config.frameRate,
  },
});

export const goldVideoBitrate = 1024 * 1000;
