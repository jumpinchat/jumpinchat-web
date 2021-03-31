import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary.react';

export default (Component) => {
  const WrappedComponent = props => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = Component.name;

  return WrappedComponent;
};
