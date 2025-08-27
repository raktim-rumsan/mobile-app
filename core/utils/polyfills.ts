// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Alternative polyfill for ethers v6 compatibility
if (typeof globalThis.crypto === 'undefined') {
  const crypto = require('expo-crypto');
  globalThis.crypto = {
    getRandomValues: crypto.getRandomValues,
    randomUUID:
      crypto.randomUUID ||
      (() => {
        throw new Error('randomUUID not available');
      }),
    subtle: crypto.subtle,
  };
}

// This file ensures that crypto polyfills are loaded before any other code
