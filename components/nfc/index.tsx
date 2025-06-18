import React, { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    Button,
    Dimensions,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

// Initialize NFC Manager
NfcManager.start();

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
    onNfcScanned: (barcode: string) => void
}

export default function Nfc({onNfcScanned}: Props) {
  const [nfcSupported, setNfcSupported] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [tagContent, setTagContent] = useState(null);
  const [bottomSheetAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    // Check NFC support
    NfcManager.isSupported()
      .then((supported) => {
        setNfcSupported(supported);
        if (supported) {
          NfcManager.start();
        }
      })
      .catch((err) => {
        console.warn(err);
        setNfcSupported(false);
      });

    return () => {
      //   NfcManager.setEventListener(NfcTech.Ndef, null);
      NfcManager.close();
    };
  }, []);

  const extractTextFromTag = (ndefMessage) => {
    if (!ndefMessage || !ndefMessage.length) return "No content found";

    try {
      const { payload } = ndefMessage[0];
      const text = Ndef.text.decodePayload(payload);
      return text || "Unreadable tag content";
    } catch (error) {
      console.error(error);
      return "Error reading tag content";
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
      // Check if NFC is enabled
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        Alert.alert(
          "NFC Disabled",
          "Please enable NFC in your device settings."
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
      setTagContent("Failed to read tag");
    } finally {
      setIsReading(false);
      NfcManager.cancelTechnologyRequest();
      hideBottomSheet();
    }
  };

  const cancelScan = async () => {
    // Stop NFC scanning and reset the state
    await NfcManager.cancelTechnologyRequest();
    resetScanState(); // Reset tag content and reading state
    hideBottomSheet(); // Close the drawer
  };

  const resetScanState = () => {
    setTagContent(null);
    setIsReading(false);
  };

  if (nfcSupported === null) {
    return (
      <View style={styles.container}>
        <Text>Checking NFC support...</Text>
      </View>
    );
  }

  if (!nfcSupported) {
    return (
      <View style={styles.container}>
        <Text>NFC is not supported on this device.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>NFC is supported on this device.</Text>
      <Button title="Read NFC Tag" onPress={readNfcTag} />

      {tagContent && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Tag Content:</Text>
          <Text style={styles.resultText}>{tagContent}</Text>
        </View>
      )}

      <Animated.View style={[styles.bottomSheet, { top: bottomSheetAnim }]}>
        <TouchableWithoutFeedback onPress={hideBottomSheet}>
          <View style={styles.bottomSheetHandle} />
        </TouchableWithoutFeedback>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.readingText}>
            {isReading ? "Reading NFC Tag..." : "Finished Reading"}
          </Text>
          <Text>{isReading ? "Hold your device near the tag." : ""}</Text>
          {isReading && (
            <Button title="Cancel" onPress={cancelScan} color="red" />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
  },
  resultTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 60,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginVertical: 10,
  },
  bottomSheetContent: {
    padding: 20,
    alignItems: "center",
  },
  readingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
