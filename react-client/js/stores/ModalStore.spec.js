/* global it, beforeEach, describe */

import { expect } from 'chai';
import { ModalStore } from './ModalStore';

describe('ModalStore', () => {
  let modalStore;
  beforeEach(() => {
    modalStore = new ModalStore();
  });

  describe('Select media modal', () => {
    describe('setDeviceList', () => {
      it('should set audio and video devices', () => {
        const devices = [
          { id: 1, kind: 'videoinput' },
          { id: 2, kind: 'audioinput' },
        ];

        modalStore.setDeviceList(devices);
        expect(modalStore.mediaSelectionModal.deviceList).to.eql({
          video: [{ id: 1, kind: 'videoinput' }],
          audio: [{ id: 2, kind: 'audioinput' }],
        });
      });
    });

    describe('setMediaSelectionModal', () => {
      it('should set modal open', () => {
        modalStore.mediaSelectionModal.open = false;

        modalStore.setMediaSelectionModal(true);

        expect(modalStore.mediaSelectionModal.open).to.equal(true);
      });
    });

    describe('setMediaSelectionModalType', () => {
      it('should set modal open', () => {
        modalStore.setMediaSelectionModalType('audio');
        expect(modalStore.mediaSelectionModal.mediaType).to.equal('audio');
      });
    });

    describe('setMediaDeviceId', () => {
      it('should set video id', () => {
        modalStore.setMediaDeviceId('foo', 'video');
        expect(modalStore.mediaSelectionModal.selectedDevices.video).to.equal('foo');
      });

      it('should set audio id', () => {
        modalStore.setMediaDeviceId('bar', 'audio');
        expect(modalStore.mediaSelectionModal.selectedDevices.audio).to.equal('bar');
      });
    });
  });
});
