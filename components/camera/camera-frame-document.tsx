import { BlurView } from 'expo-blur';
import { useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { Text } from '../ui/text';

export function CameraFrameDocument({
  onSnap,
  onClose,
  title,
  frameArea = { width: 340, height: 600, left: 0, top: 0 },
}: {
  onSnap: (frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => Promise<void>;
  onClose?: () => void;
  title?: string;
  frameArea?: { width: number; height: number; left: number; top: number };
}) {
  const navigation = useNavigation();
  const frameRef = useRef<View>(null);
  const [frameLayout, setFrameLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  // Add state for shutter button position
  const [shutterButtonLayout, setShutterButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleSnap = () => {
    if (frameLayout) {
      onSnap(frameLayout);
    } else if (typeof document !== 'undefined') {
      // fallback for web
      const frame = document.getElementById('camera-document-frame');
      if (frame) {
        const rect = frame.getBoundingClientRect();
        onSnap({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  };

  // Calculate frameBox area so its bottom is always 10px above the shutter button
  const windowHeight = Dimensions.get('window').height;
  const shutterButtonHeight = 70;
  const shutterButtonMargin = Platform.OS === 'ios' ? 28 : 50;
  const frameBoxBottomOffset = shutterButtonHeight + shutterButtonMargin + 10;
  const fallbackShutterHeight = 70 + (Platform.OS === 'ios' ? 28 : 50);
  const calculatedFrameHeight =
    windowHeight - frameBoxBottomOffset - (frameArea?.top || 0);
  const calculatedFrameArea = {
    ...frameArea,
    height:
      windowHeight -
      (shutterButtonLayout?.height ?? fallbackShutterHeight) -
      180,
    //top: (shutterButtonLayout?.height ?? fallbackShutterHeight) - 120,
  };

  return (
    <View
      style={{
        pointerEvents: 'box-none',
        ...QrStyles.frameContainer,
        ...{ left: frameArea?.left || 0, top: frameArea?.top || 0 },
      }}
    >
      {title && (
        <View style={QrStyles.titleContainer} pointerEvents="box-none">
          <Text style={QrStyles.titleText}>{title}</Text>
        </View>
      )}
      <View style={QrStyles.overlay} pointerEvents="none">
        <BlurView intensity={40} tint="regular" style={QrStyles.maskTop} />
        <View style={QrStyles.maskMiddle}>
          <BlurView intensity={40} tint="regular" style={QrStyles.maskSide} />
          <View
            // @ts-ignore: id is for web only
            id="camera-document-frame"
            ref={frameRef}
            style={{ ...QrStyles.frameBox, ...calculatedFrameArea }}
            onLayout={(e) => setFrameLayout(e.nativeEvent.layout)}
          />
          <BlurView intensity={40} tint="regular" style={QrStyles.maskSide} />
        </View>
        <BlurView intensity={40} tint="regular" style={QrStyles.maskBottom} />
      </View>

      <View style={QrStyles.shutterButtonContainer}>
        <Pressable
          style={QrStyles.shutterButton}
          onPress={handleSnap}
          onLayout={(e) => setShutterButtonLayout(e.nativeEvent.layout)}
        >
          <View style={QrStyles.shutterButtonInner} />
        </Pressable>
      </View>

      <View style={QrStyles.closeButtonContainer}>
        <Pressable
          style={QrStyles.closeButton}
          onPress={onClose ? onClose : () => navigation.goBack()}
          accessibilityLabel="Close camera"
        >
          <ArrowLeftIcon size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const QrStyles = StyleSheet.create({
  frameContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10,
  },
  frameBox: {
    borderWidth: 1,
    borderColor: 'white',
    borderStyle: 'dashed',
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
    flexDirection: 'row',
  },
  maskBottom: {
    flex: 1,
  },
  maskSide: {
    flex: 1,
  },

  shutterButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 28 : 50,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  // Add styles for the close button above the frame
  closeButtonContainer: {
    position: 'absolute',
    left: 40,
    zIndex: 400,
    backgroundColor: 'transparent',
    bottom: Platform.OS === 'ios' ? 60 : 60,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 999,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Styles for the title container
  titleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 84,
    left: Platform.OS === 'ios' ? 30 : 22,
    zIndex: 401,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  titleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
