import React from 'react';
import ScrollArea from './ScrollArea.react';

export default {
  title: 'components/elements/ScrollArea',
};

export const demo = () => (
  <div style={{ width: 200, border: '1px solid black' }}>
    <ScrollArea style={{ maxHeight: 150 }}>
      <div>
        <ul>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
        </ul>
      </div>
    </ScrollArea>
  </div>
);

export const darkTheme = () => (
  <div className="dark" style={{ width: 200, border: '1px solid black' }}>
    <ScrollArea style={{ maxHeight: 150 }}>
      <div>
        <ul>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
          <li>scroll</li>
        </ul>
      </div>
    </ScrollArea>
  </div>
);
