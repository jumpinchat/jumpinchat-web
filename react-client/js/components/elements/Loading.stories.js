import React from 'react';
import Loading from './Loading.react';

export default {
  title: 'components/elements/Loading',
};

export const loadingNoTitle = () => (
  <Loading
    loading
  />
);

export const loadingIdle = () => (
  <Loading
    loading={false}
  />
);

export const loadingWithTitle = () => (
  <Loading
    loading
    title="Foo title"
  />
);

export const loadingFullHeight = () => (
  <Loading
    loading
    fullHeight
    title="Foo title"
  />
);
