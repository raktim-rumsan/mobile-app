import React, { useState, useRef, useEffect } from "react";
import type { TextInputProps, StyleProp, TextStyle } from "react-native";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type Message = {
  id: string;
  message: string;
  type: string;
  timestamp?: Date;
};

type RootStackParamList = {
  chat: undefined;
  history: undefined;
  // add other routes here if needed
};

const Input = ({
  style,
  placeholder,
  ...props
}: { style?: StyleProp<TextStyle>; placeholder?: string } & TextInputProps) => (
  <TextInput
    style={[{ height: 40, paddingHorizontal: 8 }, style]}
    placeholder={placeholder}
    placeholderTextColor="#888"
    {...props}
  />
);

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "user",
      message: "What is AI chat bot ?",
    },
    {
      id: "2",
      type: "ai",
      message:
        "An AI chatbot is a computer program designed to simulate human conversation through text or voice interactions.What sets it apart from traditional chatbots is its ability to understand and respond to user input in a natural, human-like way.",
    },
    {
      id: "3",
      type: "user",
      message: "How Does it Work?",
    },
    {
      id: "4",
      type: "ai",
      message:
        "User Input:\nYou type or speak a message.\nProcessing:\nThe chatbot's AI analyzes your message to understand its meaning.",
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      message: message,
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage("");

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        message: getBotResponse(message),
        type: "ai",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      return "Hello there! How can I assist you today?";
    } else if (lowerCaseMessage.includes("help")) {
      return "I can help you with information, answer questions, or just chat. What would you like to know?";
    } else if (lowerCaseMessage.includes("thank")) {
      return "You're welcome! Is there anything else you'd like to know?";
    } else if (lowerCaseMessage.includes("bye")) {
      return "Goodbye! Have a great day!";
    } else {
      return "That's interesting. Can you tell me more or ask something else?";
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <Box className="mb-6">
      <HStack
        key={item.id}
        style={{
          ...styles.messageContainer,
          ...(item.type === "user" ? styles.userMessageContainer : styles.aiMessageContainer),
        }}
      >
        <Box style={styles.avatarContainer}>
          {item.type === "user" ? (
            <Box style={styles.userAvatar}>
              <Ionicons name="person" size={24} color="white" />
            </Box>
          ) : (
            <Box style={styles.avatarContainer}>
              <Image
                source={require("../../assets/images/bhunte.png")}
                style={styles.aiAvatar}
                alt="Bhunte logo"
              />
            </Box>
          )}
        </Box>
        <VStack style={styles.messageContent}>
          <Text style={styles.messageText}>{item.message}</Text>
          <HStack style={styles.messageActions}>
            <Pressable style={styles.copyButton}></Pressable>

            <HStack style={styles.reactionButtons}>
              <Pressable style={styles.reactionButton}>
                <Ionicons name="thumbs-down-outline" size={20} color="#888" />
              </Pressable>
              <Pressable style={styles.reactionButton}>
                <Ionicons name="thumbs-up-outline" size={20} color="#888" />
              </Pressable>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Box className="mb-6">
        <HStack className="items-start">
          <Box className="bg-gray-100 p-4 rounded-2xl">
            <Text className="text-gray-800">Bhunte is typing...</Text>
          </Box>
        </HStack>
      </Box>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Box style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <HStack style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ask Bhunte</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate("history")}
          >
            <Ionicons name="time-outline" size={24} color="#000" />
          </TouchableOpacity>
        </HStack>

        {/* Chat Messages */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            inverted={false}
            ListFooterComponent={renderTypingIndicator}
          />

          {/* Input Area */}
          <HStack style={styles.inputContainer}>
            <HStack style={styles.inputWrapper}>
              <Pressable style={styles.searchIcon}>
                <Ionicons name="search" size={24} color="#888" />
              </Pressable>
              <Input
                style={styles.input}
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
              />
            </HStack>
            <Pressable style={styles.sendButton} disabled={!message.trim()} onPress={handleSend}>
              <Ionicons name="send" size={24} color="white" />
            </Pressable>
          </HStack>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  historyButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  userMessageContainer: {
    backgroundColor: "#f8f9fa",
  },
  aiMessageContainer: {
    backgroundColor: "#f8f9fa",
  },
  avatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  messageActions: {
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyText: {
    marginLeft: 4,
    color: "#888",
    fontSize: 14,
  },
  reactionButtons: {
    flexDirection: "row",
  },
  reactionButton: {
    marginLeft: 16,
    padding: 2,
  },
  inputContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  inputWrapper: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 48,
  },
  searchIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  attachButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7c4dff",
    alignItems: "center",
    justifyContent: "center",
  },
});
