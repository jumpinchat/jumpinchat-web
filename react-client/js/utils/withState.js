import React from 'react';

export const StateContext = React.createContext({});

StateContext.displayName = 'StateContext';

export const withState = (Component) => {
  const WrappedComponent = props => (
    <StateContext.Consumer>
      {state => <Component {...props} {...state} />}
    </StateContext.Consumer>
  );

  WrappedComponent.displayName = Component.name;

  return WrappedComponent;
};
