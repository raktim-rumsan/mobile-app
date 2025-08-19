import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Platform } from 'react-native';

// Native NFC component
let NativeNfc: React.FC<any> | undefined = undefined;
if (Platform.OS !== 'web') {
  // Dynamically require NFC dependencies
  const nfc = require('react-native-nfc-manager');

  NativeNfc = forwardRef(function Nfc(
    { onNfcScanned, onNfcNotSupported, autoStart = true }: NfcReaderProps,
    ref,
  ) {
    const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
    const [isReading, setIsReading] = useState(false);
    const [tagContent, setTagContent] = useState<string | null>(null);
    const NfcManager = nfc.default;
    const Ndef = nfc.Ndef;
    const NfcTech = nfc.NfcTech;

    useEffect(() => {
      NfcManager.isSupported()
        .then((supported: boolean) => {
          setNfcSupported(supported);
          if (supported) {
            NfcManager.start();
            if (autoStart) {
              readNfcTag();
            }
          } else if (onNfcNotSupported) {
            onNfcNotSupported();
          }
        })
        .catch((err: any) => {
          console.warn(err);
          setNfcSupported(false);
          if (onNfcNotSupported) {
            onNfcNotSupported();
          }
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

    const readNfcTag = async () => {
      setIsReading(true);
      setTagContent(null);
      try {
        const isEnabled = await NfcManager.isEnabled();
        if (!isEnabled) {
          require('react-native').Alert.alert(
            'NFC Disabled',
            'Please enable NFC in your device settings.',
          );
          setIsReading(false);
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
      }
    };
    const cancelScan = async () => {
      await NfcManager.cancelTechnologyRequest();
      setTagContent(null);
      setIsReading(false);
    };
    useImperativeHandle(ref, () => ({
      readNfcTag,
      cancelScan,
    }));
    if (nfcSupported === null) {
      return null;
    }
    if (!nfcSupported) {
      return null;
    }
    return null;
  });
}

// Main export: platform switch
export type NfcReaderProps = {
  onNfcScanned: (content: string) => void;
  onNfcNotSupported?: () => void;
  autoStart?: boolean;
  nfcRef?: React.Ref<any>;
};

export default function NfcReader(props: NfcReaderProps) {
  if (Platform.OS === 'web') {
    if (props.onNfcNotSupported) {
      props.onNfcNotSupported();
    }
    return null;
  }
  if (NativeNfc) {
    return <NativeNfc {...props} ref={props.nfcRef} />;
  }
  return null;
}
