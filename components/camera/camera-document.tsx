import { useCamera } from '@/context/CameraContext';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { CameraFrameDocument } from './camera-frame-document';

export default function Camera() {
  const navigation = useNavigation();
  const { setPhotoUri } = useCamera();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused();
  const [torchOn, setTorchOn] = useState(false);

  const FRAME_WIDTH = 340; // match CameraFrameDocument
  const FRAME_HEIGHT = 600;

  const takePicture = async (frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          skipProcessing: false,
          photo: true,
        });

        // Get image dimensions
        const { width: imgW, height: imgH } = photo;
        console.log(imgW, imgH);
        console.log(frame);
        // Calculate crop area (centered)
        const cropOriginX = Math.round((imgW - FRAME_WIDTH) / 2);
        const cropOriginY = Math.round((imgH - FRAME_HEIGHT) / 2);
        const cropData = {
          originX: cropOriginX,
          originY: cropOriginY,
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
        };
        const cropped = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ crop: cropData }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );
        console.log('Cropped photo:', cropped);
        setPhotoUri(photo.uri);
        router.push('/(tabs)/receipt/preview');
        // setPhotoUri(cropped.uri);
        // router.push({ pathname: '/(tabs)/receipts/preview' });
      } catch (error) {
        console.error('Error taking/cropping picture:', error);
      }
    }
  };

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
          >
            <CameraFrameDocument
              onSnap={takePicture}
              onClose={() => navigation.goBack()}
            />
          </CameraView>
        </>
      )}
    </View>
  );
}
