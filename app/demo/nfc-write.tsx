import { AppInput } from '@/components/AppInput';
import NfcWriter from '@/components/nfc/nfc-writer';
import { Box, Button, Text } from '@/components/ui';
import React from 'react';

export default function NFCWriterPage() {
  const [content, setContent] = React.useState('---');
  const [input, setInput] = React.useState('');
  const nfcRef = React.useRef<any>(null);

  const handleWrite = () => {
    if (nfcRef.current && input) {
      nfcRef.current.writeNfcTag(input);
    }
  };

  return (
    <>
      <Box className="flex flex-1 justify-center items-center min-h-[60vh]">
        <Text className="text-3xl font-bold text-gray-800 mb-4">
          NFC Writer Demo
        </Text>
        <Text className="text-lg text-gray-800 text-center my-4">
          {content}
        </Text>
        <AppInput
          className="h-14"
          type="text"
          placeholder=""
          value={input}
          onChangeText={setInput}
        />
      </Box>
      <Button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        onPress={handleWrite}
        disabled={!input}
      >
        Write to NFC
      </Button>
      <NfcWriter
        writeContent={input || ''}
        autoStart={false}
        nfcRef={nfcRef}
        onWriteSuccess={(msg) => setContent('Write success: ' + msg)}
        onWriteError={(err) => setContent('Write error: ' + err)}
      />
    </>
  );
}
