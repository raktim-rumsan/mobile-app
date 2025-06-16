import { Platform } from 'react-native';

// Only import EventEmitter for native
let eventEmitter: any = null;
if (Platform.OS !== 'web') {
  (async () => {
    const { EventEmitter } = await import('events');
    eventEmitter = new EventEmitter();
  })();
}

export function addEventListener(eventName: string, listener: (event: any) => void) {
  if (Platform.OS === 'web') {
    const handler = (e: any) => listener(e.detail);
    // Store handler on listener for removal
    (listener as any).__handler = handler;
    window.addEventListener(eventName, handler);
  } else {
    eventEmitter.addListener(eventName, listener);
  }
}

export function removeEventListener(eventName: string, listener: (event: any) => void) {
  if (Platform.OS === 'web') {
    const handler = (listener as any).__handler;
    window.removeEventListener(eventName, handler);
  } else {
    eventEmitter.removeListener(eventName, listener);
  }
}

export function emitEvent(eventName: string, event: any) {
  if (Platform.OS === 'web') {
    window.dispatchEvent(new CustomEvent(eventName, { detail: event }));
  } else {
    eventEmitter.emit(eventName, event);
  }
}
