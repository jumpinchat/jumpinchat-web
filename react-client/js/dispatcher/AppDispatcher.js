/**
 * Created by Zaccary on 20/06/2015.
 */

import { Dispatcher } from 'flux';
import { VIEW_ACTION } from '../constants/PayloadSources';

// Create dispatcher instance
class AppDispatcher extends Dispatcher {
  constructor(name = 'Global dispatcher') {
    super();
    this.name = name;
    this.queueRunning = false;
    this.queue = [];
    if (process.env.NODE_ENV !== 'production') {
      console.log(`%cregistering dispatcher ${this.name}`, 'color: #1B8CB5');
    }
  }

  addToQueue(action) {
    this.queue = [
      ...this.queue,
      action,
    ];

    if (!this.queueRunning) {
      this.runQueue();
    }
  }

  runQueue() {
    this.queueRunning = true;
    while (this.queue.length > 0) {
      if (!this.isDispatching()) {
        const action = this.queue.pop();
        this.dispatch(action);
        if (this.queue.length === 0) {
          this.queueRunning = false;
        }
      }
    }
  }

  handleAction(action) {
    if (!action.actionType) {
      throw new Error('Empty action.type: you likely mistyped the action.');
    }

    console.log(`%cDispatching action as ${this.name}`, 'color: #1B8CB5', action);

    this.addToQueue({
      source: VIEW_ACTION,
      action,
    });
  }
}

const dispatcher = new AppDispatcher();

export const ApplicationDispatcher = new AppDispatcher('Application dispatcher');
export const ChatDispatcher = new AppDispatcher('Chat dispatcher');
export const CamDispatcher = new AppDispatcher('Cam dispatcher');
export const ModalDispatcher = new AppDispatcher('Modal dispatcher');
export const NotificationDispatcher = new AppDispatcher('Notification dispatcher');
export const PmDispatcher = new AppDispatcher('PM dispatcher');
export const PushDispatcher = new AppDispatcher('Push dispatcher');
export const RoomDispatcher = new AppDispatcher('Room dispatcher');
export const SessionDispatcher = new AppDispatcher('Session dispatcher');
export const UserDispatcher = new AppDispatcher('User dispatcher');
export const YoutubeDispatcher = new AppDispatcher('Youtube dispatcher');
export const ProfileDispatcher = new AppDispatcher('Profile dispatcher');
export const RoleDispatcher = new AppDispatcher('Role dispatcher');
export default dispatcher;
