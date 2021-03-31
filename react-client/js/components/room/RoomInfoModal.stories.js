import React from 'react';
import RoomInfoModal from './RoomInfoModal.react';

export default {
  title: 'components/room/RoomInfoModal',
};

export const modal = () => (
  <RoomInfoModal isOpen roomId="foo" />
);
