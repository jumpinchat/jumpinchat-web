/* global window */

export function set(key, value) {
  if (window.localStorage) {
    try {
      const jsonValue = JSON.stringify(value);
      window.localStorage.setItem(key, jsonValue);
    } catch (e) {
      throw e;
    }
  }
}

export function get(key, defaultValue) {
  if (window.localStorage) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key));

      if ((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
      }

      return value;
    } catch (e) {
      throw e;
    }
  }

  return undefined;
}
