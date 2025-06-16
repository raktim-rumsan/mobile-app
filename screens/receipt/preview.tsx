import { useCamera } from '@/context/CameraContext';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function ReceiptPreview() {
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);
  const { photoUri, setPhotoUri } = useCamera();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!photoUri && isMounted) {
      setPhotoUri(null); // Clear photo URI in context
      //router.replace('/(tabs)/Receipt/camera'); // Navigate back to camera screen
    }
  }, [photoUri, isMounted, setPhotoUri]);

  if (!photoUri) {
    return null;
  }

  const handleRetake = () => {
    setPhotoUri(null);
    router.replace('/(tabs)/receipt/camera');
    router.back();
  };

  const handleCreateReceipt = () => {
    router.push('/(tabs)/receipt/form');
  };

  return (
    <View className="flex-1 justify-center items-center bg-black">
      <Image
        source={{ uri: photoUri }}
        className="w-[90%] h-[70%] my-5 rounded-xl"
        resizeMode="contain"
      />
      <View className="flex-row justify-between w-[80%] mt-5">
        <TouchableOpacity
          className="flex-1 mx-2 bg-white py-3.5 rounded-lg items-center"
          onPress={handleRetake}
        >
          <Text className="text-black font-bold text-lg">Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 mx-2 bg-white py-3.5 rounded-lg items-center"
          onPress={handleCreateReceipt}
        >
          <Text className="text-black font-bold text-lg">Create Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
