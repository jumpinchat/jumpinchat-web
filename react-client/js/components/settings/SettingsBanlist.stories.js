import React from 'react';
import SettingsBanlist from './SettingsBanlist.react';

export default {
  title: 'components/settings/SettingsBanlist',
};

const getProps = () => ({
  sendOperatorAction: () => {},
  settings: {
    banlist: [],
  },
});

export const empty = () => {
  const props = getProps();
  return (
    <>
      <SettingsBanlist {...props} />
      <div className="dark">
        <SettingsBanlist {...props} />
      </div>
    </>
  );
};

export const items = () => {
  const props = getProps();
  props.settings.banlist = [
    {
      _id: 'foo',
      handle: 'handle',
      username: 'someuser',
      timestamp: new Date().toISOString(),
    },
    {
      _id: 'bar',
      handle: 'another_handle',
      timestamp: new Date().toISOString(),
    },
  ];

  return (
    <>
      <SettingsBanlist {...props} />
      <div className="dark">
        <SettingsBanlist {...props} />
      </div>
    </>
  );
};
