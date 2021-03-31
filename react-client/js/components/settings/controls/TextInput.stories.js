import React from 'react';
import TextInput from './TextInput.react';

export default {
  title: 'components/settings/controls/TextInput',
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


export const Input = () => (
  <div style={wrapperStyle}>
    <TextInput
      label="a text input"
      subTitle="a subtitle"
    />
    <TextInput
      label="a text input"
      onSubmit={() => {}}
    />
    <TextInput
      label="a text input"
      onSubmit={() => {}}
      value="value changed"
      changed
    />
    <TextInput
      label="a text input"
      success
      onSubmit={() => {}}
    />
    <TextInput
      label="a text input"
      error="error message!"
    />
    <TextInput
      label="a text input"
      error="error message!"
      onSubmit={() => {}}
    />
  </div>
);
