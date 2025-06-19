import NfcReader from '@/components/nfc/nfc-reader';
import { Box, Text } from '@/components/ui';
import React from 'react';

export default function LandingPage() {
  const [content, setContent] = React.useState('---');
  return (
    <>
      <Box className="flex flex-1 justify-center items-center min-h-[60vh]">
        <Text className="text-3xl font-bold text-gray-800 mb-4">
          NFC Reader Demo
        </Text>
        <Text className="text-lg  text-gray-800 text-center my-4">
          {content}
        </Text>
      </Box>
      <NfcReader
        onNfcScanned={(content) => setContent(content)}
        onNfcNotSupported={() => setContent('NFC not supported!')}
      />
    </>
  );
}
