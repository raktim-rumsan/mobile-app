import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

// Only define NFC types and logic for native platforms
// On web, just show a fallback

// Native NFC component
let NativeNfc: React.FC<any> | undefined = undefined;
if (Platform.OS !== 'web') {
  // Dynamically require NFC dependencies
  const nfc = require('react-native-nfc-manager');
  const {
    Animated,
    Button,
    Dimensions,
    StyleSheet,
    TouchableWithoutFeedback,
  } = require('react-native');
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  NativeNfc = function Nfc({
    onNfcScanned,
  }: {
    onNfcScanned: (barcode: string) => void;
  }) {
    const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
    const [isReading, setIsReading] = useState(false);
    const [tagContent, setTagContent] = useState<string | null>(null);
    const [bottomSheetAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
    const NfcManager = nfc.default;
    const Ndef = nfc.Ndef;
    const NfcTech = nfc.NfcTech;

    useEffect(() => {
      NfcManager.isSupported()
        .then((supported: boolean) => {
          setNfcSupported(supported);
          if (supported) {
            NfcManager.start();
          }
        })
        .catch((err: any) => {
          console.warn(err);
          setNfcSupported(false);
        });
      return () => {
        NfcManager.close();
      };
    }, []);

    const extractTextFromTag = (ndefMessage: any): string => {
      if (!ndefMessage || !ndefMessage.length) return 'No content found';
      try {
        const { payload } = ndefMessage[0];
        const text = Ndef.text.decodePayload(payload);
        return text || 'Unreadable tag content';
      } catch (error) {
        console.error(error);
        return 'Error reading tag content';
      }
    };

    const showBottomSheet = () => {
      Animated.timing(bottomSheetAnim, {
        toValue: SCREEN_HEIGHT * 0.5,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };
    const hideBottomSheet = () => {
      Animated.timing(bottomSheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };
    const readNfcTag = async () => {
      setIsReading(true);
      setTagContent(null);
      showBottomSheet();
      try {
        const isEnabled = await NfcManager.isEnabled();
        if (!isEnabled) {
          require('react-native').Alert.alert(
            'NFC Disabled',
            'Please enable NFC in your device settings.',
          );
          setIsReading(false);
          hideBottomSheet();
          return;
        }
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();
        const content = extractTextFromTag(tag.ndefMessage);
        setTagContent(content);
        onNfcScanned(content);
      } catch (ex) {
        console.warn(ex);
        setTagContent('Failed to read tag');
      } finally {
        setIsReading(false);
        NfcManager.cancelTechnologyRequest();
        hideBottomSheet();
      }
    };
    const cancelScan = async () => {
      await NfcManager.cancelTechnologyRequest();
      setTagContent(null);
      setIsReading(false);
      hideBottomSheet();
    };
    if (nfcSupported === null) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Checking NFC support...</Text>
        </View>
      );
    }
    if (!nfcSupported) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>NFC is not supported on this device.</Text>
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Text>NFC is supported on this device.</Text>
        <Button title="Read NFC Tag" onPress={readNfcTag} />
        {tagContent && (
          <View
            style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              width: '100%',
            }}
          >
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Tag Content:
            </Text>
            <Text style={{ fontSize: 16, color: '#333' }}>{tagContent}</Text>
          </View>
        )}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: SCREEN_HEIGHT * 0.5,
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            top: bottomSheetAnim,
          }}
        >
          <TouchableWithoutFeedback onPress={hideBottomSheet}>
            <View
              style={{
                width: 60,
                height: 5,
                backgroundColor: '#ccc',
                borderRadius: 2.5,
                alignSelf: 'center',
                marginVertical: 10,
              }}
            />
          </TouchableWithoutFeedback>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {isReading ? 'Reading NFC Tag...' : 'Finished Reading'}
            </Text>
            <Text>{isReading ? 'Hold your device near the tag.' : ''}</Text>
            {isReading && (
              <Button title="Cancel" onPress={cancelScan} color="red" />
            )}
          </View>
        </Animated.View>
      </View>
    );
  };
}

// Main export: platform switch
export default function Nfc(props: any) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>NFC is not supported on this platform.</Text>
      </View>
    );
  }
  if (NativeNfc) {
    return <NativeNfc {...props} />;
  }
  // Fallback for any other case
  return null;
}
