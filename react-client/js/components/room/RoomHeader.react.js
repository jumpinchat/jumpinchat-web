/**
 * Created by Zaccary on 20/06/2015.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import WrappedListItems from '../elements/ListItems.react';

class RoomHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.handleToggleMenu = this.handleToggleMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggleHeadway = this.handleToggleHeadway.bind(this);
    this.state = {
      open: false,
    };

    this.headwayConfig = {
      selector: '#new',
      account: 'xao8eJ',
    };
  }

  componentDidMount() {
    const { Headway } = window;
    if (Headway) {
      Headway.init(this.headwayConfig);
    }
  }

  handleToggleHeadway(e) {
    const { Headway } = window;
    if (Headway) {
      Headway.toggle(e);
    } else {
      window.open('https://headwayapp.co/jumpinchat-updates', '_blank');
    }
  }

  handleToggleMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const { open } = this.state;

    this.setState({
      open: !open,
    });
  }

  handleClickOutside() {
    this.setState({
      open: false,
    });
  }

  render() {
    const { open } = this.state;
    const {
      user,
      userIsLoggedIn,
      unreadMessages,
    } = this.props;
    const optionsArr = [
      {
        text: 'Your Profile',
        element: 'a',
        props: {
          href: `/profile/${user.username}`,
          target: '_blank',
        },
      },
      {
        text: 'Settings',
        element: 'a',
        props: {
          href: '/settings/account',
          target: '_blank',
        },
      },
      {
        text: 'Messages',
        element: 'a',
        props: {
          href: '/messages',
          target: '_blank',
        },
        count: unreadMessages,
      },
      {
        text: 'Logout',
        element: 'a',
        props: {
          href: '/logout',
        },
      },
    ];

    return (
      <div className="roomHeader">
        <a href="/" className="roomHeader__Logo">
          <span className="roomHeader__LogoText">JumpInChat</span>
        </a>

        <div className="roomHeader__UserActions">
          <button
            id="new"
            className="button button-floating button-icon button--text roomHeader__UserAction"
            onClick={this.handleToggleHeadway}
          >
            <FontAwesomeIcon
              icon={['fas', 'bullhorn']}
            />
            &nbsp;
            <span className="mobileHidden">What&apos;s new</span>
          </button>

          <a
            href="/support"
            className="button button-floating button-icon button-red roomHeader__UserAction"
            target="_blank"
            rel="noopener noreferrer"
            title="Your support keeps the site up and running!"
          >
            <FontAwesomeIcon
              icon={['fas', 'heart']}
            />
            &nbsp;
            <span className="mobileHidden">Support the site</span>
          </a>

          <a
            href="/contact"
            target="_BLANK"
            className="button button-floating button-white roomHeader__UserAction"
            title="Feedback is invaluable to improving the site, don't hesitate to send a message"
          >
            <i className="fa fa-envelope" />
            &nbsp;
            <span className="mobileHidden">Got feedback?</span>
          </a>

          {!userIsLoggedIn && (
            <a
              href="/login"
              target="_blank"
              className="button button-floating button-white roomHeader__UserAction"
            >
              <FontAwesomeIcon
                icon={['fas', 'sign-in-alt']}
              />
              &nbsp;
              <span className="mobileHidden">Sign In</span>
            </a>
          )}

          {!userIsLoggedIn && (
            <a
              href="/register"
              target="_blank"
              className="button button-floating button-black roomHeader__UserAction"
            >
              <FontAwesomeIcon
                icon={['fas', 'user-plus']}
              />
              &nbsp;
              <span className="mobileHidden">Create Account</span>
            </a>
          )}

          {userIsLoggedIn && (
            <TetherComponent
              attachment="top center"
              constraints={[{
                to: 'window',
                attachment: 'together',
                pin: true,
              }]}
            >
              <button
                className="button button-floating button-outline roomHeader__UserAction"
                type="button"
                onClick={this.handleToggleMenu}
              >
                {user.username}
                {unreadMessages > 0 && (
                  <React.Fragment>
                    {' '}
                    <span className="pill pill--red pill--animated">{unreadMessages}</span>
                  </React.Fragment>
                )}
              </button>

              {open && (
                <WrappedListItems
                  options={optionsArr}
                  onClickOutside={this.handleClickOutside}
                />
              )}
            </TetherComponent>
          )}
        </div>
      </div>
    );
  }
}

RoomHeader.defaultProps = {
  user: {},
  userIsLoggedIn: false,
  unreadMessages: 0,
};

RoomHeader.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
  userIsLoggedIn: PropTypes.bool,
  unreadMessages: PropTypes.number,
};

export default RoomHeader;
