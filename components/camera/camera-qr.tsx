import { useIsFocused } from '@react-navigation/native';
import { CameraView, ScanningResult, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { CameraFrameQR } from './camera-frame-qr';

export default function CameraQR({
  onBarcodeScanned,
}: {
  onBarcodeScanned: (barcode: ScanningResult) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused();
  const [torchOn, setTorchOn] = useState(false);

  if (!permission) {
    return <View className="flex-1 bg-background-0" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-background-0">
        <Text className="text-center mb-2 text-base text-typography-700">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {isFocused && (
        <>
          <CameraView
            style={{ flex: 1 }}
            facing={'back'}
            enableTorch={torchOn}
            ref={cameraRef}
            autofocus="on"
            onMountError={(error) => {
              console.error('Camera mount error:', error);
            }}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={onBarcodeScanned}
          ></CameraView>
          <CameraFrameQR />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
  },
  middleRow: {
    flexDirection: 'row',
    width: '100%',
    height: 250,
  },
  frameBox: {
    width: 250,
    height: 250,
    borderColor: 'white',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});
