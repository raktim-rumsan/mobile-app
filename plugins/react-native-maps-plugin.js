const { withAndroidManifest } = require('@expo/config-plugins');

const withReactNativeMaps = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Add required permissions for maps
    if (!androidManifest.manifest.permission) {
      androidManifest.manifest.permission = [];
    }

    const permissions = [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_NETWORK_STATE',
    ];

    permissions.forEach((permission) => {
      if (
        !androidManifest.manifest.permission.find(
          (p) => p.$['android:name'] === permission,
        )
      ) {
        androidManifest.manifest.permission.push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    return config;
  });
};

module.exports = withReactNativeMaps;
