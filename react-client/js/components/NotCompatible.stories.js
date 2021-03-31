import React from 'react';
import NotCompatible from './NotCompatible.react';

export default {
  title: 'components/NotCompatible',
};

export const notCompatible = () => (
  <NotCompatible />
);
export const darkTheme = () => (
  <div className="dark">
    <NotCompatible />
  </div>
);
