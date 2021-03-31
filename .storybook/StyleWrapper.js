import React from 'react';
import Helmet from 'react-helmet';
import '../react-client/styles/main.scss';
import '../react-client/styles/cssVars.scss';
import iconLibrary from '../react-client/js/utils/iconLibrary';

export default ({ children }) => {
  iconLibrary();

  return (
    <>
      <Helmet>
        <style>
          {`.dark {
            background-color: var(--color-dark0);
            color: var(--color-light0);
          }`}
        </style>
      </Helmet>
      {children}
    </>
  );
};
