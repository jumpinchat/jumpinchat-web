import React from 'react';
import Tooltip from './Tooltip.react';

export default {
  title: 'components/elements/Tooltip',
};

const wrapperStyle = {
  maxWidth: 900,
  margin: '0 auto',
  paddingTop: '6.4rem',
  display: 'flex',
  gap: '1em',
  flexDirection: 'row',
};

export const demo = () => (
  <div style={wrapperStyle}>
    <Tooltip text="tooltip on top" position="top">
      <button>top</button>
    </Tooltip>
    <Tooltip text="tooltip on bottom" position="bottom">
      <button>bottom</button>
    </Tooltip>
    <Tooltip text="tooltip left" position="left">
      <button>left</button>
    </Tooltip>
    <Tooltip text="tooltip right" position="right">
      <button>right</button>
    </Tooltip>
  </div>
);
