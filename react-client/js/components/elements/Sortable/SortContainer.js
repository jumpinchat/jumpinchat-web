import React from 'react';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const SortContainer = ({ children }) => (
  <DndProvider backend={HTML5Backend} context={window}>
    {children}
  </DndProvider>
);

SortContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SortContainer;
