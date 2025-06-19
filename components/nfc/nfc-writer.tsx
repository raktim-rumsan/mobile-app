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
    {
      onNfcNotSupported,
      onWriteSuccess,
      onWriteError,
      autoStart = true,
      writeContent,
    }: NfcWriterProps,
    ref,
  ) {
    const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
    const [isWriting, setIsWriting] = useState(false);
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
              writeNfcTag(writeContent || '');
            }
          } else if (onNfcNotSupported) {
            onNfcNotSupported();
          }
        })
        .catch(() => {
          setNfcSupported(false);
          if (onNfcNotSupported) {
            onNfcNotSupported();
          }
        });
      return () => {
        NfcManager.close();
      };
    }, []);

    const writeNfcTag = async (content: string) => {
      if (!content) {
        if (onWriteError) onWriteError('No content provided to write');
        return;
      }
      setIsWriting(true);
      try {
        const isEnabled = await NfcManager.isEnabled();
        if (!isEnabled) {
          require('react-native').Alert.alert(
            'NFC Disabled',
            'Please enable NFC in your device settings.',
          );
          if (onWriteError) onWriteError('NFC is disabled');
          setIsWriting(false);
          return;
        }
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const bytes = Ndef.encodeMessage([Ndef.textRecord(content)]);
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        if (onWriteSuccess) onWriteSuccess(content);
      } catch (ex: any) {
        if (onWriteError) onWriteError(ex.toString());
      } finally {
        setIsWriting(false);
        NfcManager.cancelTechnologyRequest();
      }
    };

    useImperativeHandle(ref, () => ({
      writeNfcTag,
      isWriting,
    }));

    if (!nfcSupported) return null;
    return null;
  });
}

// Main export: platform switch
export type NfcWriterProps = {
  onNfcNotSupported?: () => void;
  onWriteSuccess?: (content: string) => void;
  onWriteError?: (error: string) => void;
  autoStart?: boolean;
  nfcRef?: React.Ref<any>;
  writeContent?: string; // <-- new prop for data to write
};

export default function NfcWriter(props: NfcWriterProps) {
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
