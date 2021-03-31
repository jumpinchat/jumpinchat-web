/* global jest */

let storage = {};

const get = jest.fn(key => storage[key] || null);

const set = jest.fn();

function __setMockData(key, data) {
  storage = {
    ...storage,
    [key]: data,
  };
}

export {
  get,
  set,
  __setMockData,
};
