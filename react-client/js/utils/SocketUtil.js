/**
 * Created by Zaccary on 20/06/2015.
 */

import io from 'socket.io-client';

class SocketUtil {
  constructor() {
    this.socket = null;
    this.listeningEvents = [];
  }

  get isSocketConnected() {
    return this.socket.connected;
  }

  authSocket(token) {
    this.socket = io({ query: `token=${token}` });
    this.socket.on('disconnect', () => {
      console.warn('socket disconnected');
    });
  }

  listen(event, cb) {
    if (!this.listeningEvents.includes(event)) {
      this.socket.on(event, cb);
      this.listeningEvents.push(event);
    }
  }

  emit(event, data = {}) {
    this.socket.emit(event, data);
  }
}

export default new SocketUtil();
