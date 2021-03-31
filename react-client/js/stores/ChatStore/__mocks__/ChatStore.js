let state = {
  ignoreList: [],
  sounds: true,
};

export default {
  getHandleByUserId: () => 'foo',
  getState: jest.fn(() => state),
  __setState: (newState) => { state = newState; },
};
