/* global Raven */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { addNotification } from '../actions/NotificationActions';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    addNotification({
      color: 'red',
      message: 'An application error has occurred',
      autoClose: false,
    });

    if (error instanceof 'Error') {
      Raven.captureException(error, { extra: info });
    }
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <p>Sorry, something went wrong</p>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
