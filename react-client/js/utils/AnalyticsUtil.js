/**
 * Created by Zaccary on 18/03/2017.
 */

/* global window */

export function trackEvent(category, action, label, value, nonInteraction = false) {
  console.log('%cTrack event', 'color:#1B8CB5', {
    category, action, label, value,
  });
  if (!window.ga) {
    return;
  }

  if (!category && !action) {
    return;
  }

  window.ga('send', {
    hitType: 'event',
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
  });
}

export function trackNonInteractionEvent(category, action, label) {
  trackEvent(category, action, label, true);
}
