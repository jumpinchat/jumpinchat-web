/* global window,jest,describe,expect,beforeEach,it */
import { set, get } from './localStorage';

describe('localStorage util', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
    window.localStorage.clear();
  });

  describe('set', () => {
    it('should set an item in localStorage', () => {
      set('foo', { foo: 'bar' });
      const spy = jest.spyOn(Storage.prototype, 'setItem');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('foo', '{"foo":"bar"}');
    });
  });

  describe('get', () => {
    it('should return a javascript object', () => {
      window.localStorage.setItem('foo', '{"foo":"bar"}');
      expect(get('foo')).toEqual({ foo: 'bar' });
    });

    it('should call `getItem` with the correct key', () => {
      get('foo');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('foo');
    });

    it('should return default value if no value set in storage', () => {
      console.info({ vals: window.localStorage });
      const val = get('foo', 'bar');
      expect(val).toEqual('bar');
    });
  });
});
