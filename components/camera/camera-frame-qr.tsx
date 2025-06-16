import { BlurView } from 'expo-blur';
import { useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';

export function CameraFrameQR() {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          QrStyles.frameContainer,
          { pointerEvents: 'none', transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={QrStyles.overlay} pointerEvents="none">
          <BlurView intensity={40} tint="regular" style={QrStyles.maskTop} />
          <View style={QrStyles.maskMiddle}>
            <BlurView intensity={40} tint="regular" style={QrStyles.maskSide} />
            <View style={QrStyles.frameBox}>
              <View style={[QrStyles.corner, QrStyles.topLeft]} />
              <View style={[QrStyles.corner, QrStyles.topRight]} />
              <View style={[QrStyles.corner, QrStyles.bottomLeft]} />
              <View style={[QrStyles.corner, QrStyles.bottomRight]} />
            </View>
            <BlurView intensity={40} tint="regular" style={QrStyles.maskSide} />
          </View>
          <BlurView intensity={40} tint="regular" style={QrStyles.maskBottom} />
        </View>
      </Animated.View>
      <View style={QrStyles.closeButtonContainer}>
        <Pressable
          style={QrStyles.closeButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close camera"
        >
          <XMarkIcon size={24} color="white" />
        </Pressable>
      </View>
    </>
  );
}

const QrStyles = StyleSheet.create({
  frameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  frameBox: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'white',
    borderRadius: 8,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  maskTop: {
    flex: 1,
  },
  maskMiddle: {
    height: 250,
    flexDirection: 'row',
  },
  maskBottom: {
    flex: 1,
  },
  maskSide: {
    flex: 1,
  },

  closeButtonContainer: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 400,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 999,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
