module.exports.janusEvents = {
  JANUS_EVENT_TYPE_NONE: 0,
  /* Session related events (e.g., session created/destroyed, etc.) */
  JANUS_EVENT_TYPE_SESSION: 1,
  /* Handle related events (e.g., handle attached/detached, etc.) */
  JANUS_EVENT_TYPE_HANDLE: 2,
  /* JSEP related events (e.g., got/sent offer/answer) */
  JANUS_EVENT_TYPE_JSEP: 4,
  /* WebRTC related events (e.g., PeerConnection up/down, ICE updates, DTLS updates, etc.) */
  JANUS_EVENT_TYPE_WEBRTC: 8,
  /* Media related events (e.g., media started/stopped flowing, stats on packets/bytes, etc.) */
  JANUS_EVENT_TYPE_MEDIA: 16,
  /* Events originated by plugins (at the moment, all of them, no way to pick) */
  JANUS_EVENT_TYPE_PLUGIN: 32,
  /* Events originated by transports (at the moment, all of them, no way to pick) */
  JANUS_EVENT_TYPE_TRANSPORT: 128,
  /* Events originated by the core for its own events (e.g., Janus starting/shutting down) */
  JANUS_EVENT_TYPE_CORE: 256,
  /* Mask with all events enabled (shortcut when you want to subscribe to everything) */
  JANUS_EVENT_TYPE_ALL: 4294967295,
};
