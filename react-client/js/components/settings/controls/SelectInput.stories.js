import React from 'react';
import SelectInput from './SelectInput';

export default {
  title: 'components/settings/controls/SelectInput',
};

const wrapperStyle = {
  maxWidth: 300,
  margin: '0 auto',
  paddingTop: '6.4rem',
  display: 'flex',
  gap: '1em',
  flexDirection: 'column',
  alignItems: 'stretch',
};

const options = [
  {
    label: 'option 1',
    value: 'option1',
  },
  {
    label: 'option 2',
    value: 'option2',
  },
  {
    label: 'option 3',
    value: 'option3',
  },
];

export const Select = () => (
  <div style={wrapperStyle}>
    <SelectInput
      id="select1"
      label="a text input"
      subTitle="a subtitle"
      options={options}
    />
    <SelectInput
      id="select2"
      label="a text input"
      subTitle="a subtitle"
      options={options}
      error="an error message"
    />
  </div>
);
