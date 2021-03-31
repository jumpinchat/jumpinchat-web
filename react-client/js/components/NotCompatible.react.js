import React from 'react';
import RoomHeader from './room/RoomHeader.react';

const NotCompatible = () => (
  <div>
    <RoomHeader />
    <div className="errorContent__Wrapper">
      <div className="errorContent">
        <h2 className="errorContent__Title">Your browser is out of date</h2>
        <p className="errorContent__Copy">
          JumpInChat requires certain features your browser does not
          support, please consider updating it to a more recent version.
        </p>
        <ul className="browserList__List">
          <li>
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              className="browserList__Link"
            >
              <figure className="browserList__IconWrapper">
                <img
                  className="browserList__Icon"
                  src="/img/browser/c.svg"
                  alt="Chrome"
                />
                <figcaption>
                  Chrome
                </figcaption>
              </figure>
            </a>
          </li>
          <li>
            <a
              href="https://www.mozilla.org/en-US/firefox/"
              target="_blank"
              rel="noopener noreferrer"
              className="browserList__Link"
            >
              <figure className="browserList__IconWrapper">
                <img
                  className="browserList__Icon"
                  src="/img/browser/ff.svg"
                  alt="Firefox"
                />
                <figcaption>
                  Firefox
                </figcaption>
              </figure>
            </a>
          </li>
          <li>
            <a
              href="https://www.opera.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="browserList__Link"
            >
              <figure className="browserList__IconWrapper">
                <img
                  className="browserList__Icon"
                  src="/img/browser/o.svg"
                  alt="Opera"
                />
                <figcaption>
                  Opera
                </figcaption>
              </figure>
            </a>
          </li>
          <li>
            <a
              href="https://vivaldi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="browserList__Link"
            >
              <figure className="browserList__IconWrapper">
                <img
                  className="browserList__Icon"
                  src="/img/browser/v.svg"
                  alt="Vivaldi"
                />
                <figcaption>
                  Vivaldi
                </figcaption>
              </figure>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default NotCompatible;
