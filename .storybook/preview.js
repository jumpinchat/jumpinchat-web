import React from 'react';
import { addDecorator  } from '@storybook/react';
import StyleWrapper from './StyleWrapper';

import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

momentDurationFormat(moment);

addDecorator(fn => <StyleWrapper>{fn()}</StyleWrapper>)
