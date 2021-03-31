import React, { useState, Fragment } from 'react';
import { Radio, RadioContainer } from './Radio.react';

export default {
  title: 'components/settings/controls/Radio',
};

const wrapperStyle = {
  maxWidth: 300,
  margin: '0 auto',
  paddingTop: '6.4rem',
  paddingBottom: '6.4rem',
  display: 'flex',
  gap: '1em',
  flexDirection: 'column',
  alignItems: 'stretch',
};

export const RadioTwoValues = () => {
  const [value, setValue] = useState('value 1');
  return (
    <Fragment>
      <div className="settings" style={wrapperStyle}>
        <RadioContainer
          title="a title"
          value={value}
          name="radio1"
          onChange={({ target }) => setValue(target.value)}
        >
          <Radio
            label="a text input"
            subTitle="a subtitle"
            name="radio1"
            value="value 1"
          />
          <Radio
            label="a text input"
            subTitle="a subtitle"
            name="radio1"
            value="value 2"
          />
        </RadioContainer>
      </div>
      <div className="dark">
        <div className="settings" style={wrapperStyle}>
          <RadioContainer
            title="a title"
            value={value}
            name="radio1"
            onChange={({ target }) => setValue(target.value)}
          >
            <Radio
              label="a text input"
              subTitle="a subtitle"
              name="radio1"
              value="value 1"
            />
            <Radio
              label="a text input"
              subTitle="a subtitle"
              name="radio1"
              value="value 2"
            />
          </RadioContainer>
        </div>
      </div>
    </Fragment>
  );
};
