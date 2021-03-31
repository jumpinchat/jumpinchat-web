/* global window, document, Raven */
import 'core-js/stable';
import React from 'react';
import { render } from 'react-dom';
import AppWindow from './components/AppWindow.react';
import * as ServiceWorkerUtils from './utils/ServiceWorkerUtils';

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
}

if (process.env.NODE_ENV === 'production' && Raven) {
  Raven
    .config('https://71122020584c44f7af718dfe6d6b877d@sentry.io/186641', {
      environment: process.env.NODE_ENV,
      release: window.BUILD_NUM,
      dsn: 'https://71122020584c44f7af718dfe6d6b877d@sentry.io/186641',
      beforeSend(event) {
        // Check if it is an exception, if so, show the report dialog
        if (event.exception) {
          Raven.showReportDialog();
        }
        return event;
      },
    })
    .install();
}

ServiceWorkerUtils.initServiceWorker();

render(<AppWindow />, document.getElementById('app'));
