import { ThemedText } from '@/components/ThemedText';
import { Image } from '@/components/ui';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      timestamp: new Date(Date.now() - 10000),
      isUser: false,
      status: 'read',
    },
    {
      id: '2',
      text: 'Hi! I have a question about my wallet balance.',
      timestamp: new Date(Date.now() - 5000),
      isUser: true,
      status: 'read',
    },
    {
      id: '3',
      text: "Sure! I'd be happy to help you with your wallet balance. What specific information do you need?",
      timestamp: new Date(),
      isUser: false,
      status: 'read',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor =
    useThemeColor({}, 'background') === '#fff' ? '#e5e7eb' : '#374151';
  const cardColor =
    useThemeColor({}, 'background') === '#fff' ? '#f9fafb' : '#1f2937';

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      isUser: true,
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg,
        ),
      );
    }, 500);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! I'm processing your request and will get back to you shortly.",
        timestamp: new Date(),
        isUser: false,
        status: 'read',
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 2000);
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      if (event.nativeEvent.shiftKey) {
        // Shift+Enter: Allow new line (default behavior)
        return;
      } else {
        // Enter only: Send message
        event.preventDefault();
        sendMessage();
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="#9ca3af" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="#9ca3af" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color="#9ca3af" />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`flex-row mb-3 ${
        item.isUser ? 'justify-end' : 'justify-start'
      } px-4`}
    >
      <View
        className={`max-w-[80%] ${item.isUser ? 'items-end' : 'items-start'}`}
      >
        <View
          className={`rounded-2xl px-4 py-3 ${
            item.isUser ? 'bg-blue-500 rounded-br-md' : 'rounded-bl-md'
          }`}
          style={!item.isUser ? { backgroundColor: cardColor } : {}}
        >
          <Text
            className={`text-base leading-5 ${item.isUser ? 'text-white' : ''}`}
            style={!item.isUser ? { color: textColor } : {}}
          >
            {item.text}
          </Text>
        </View>
        <View
          className={`flex-row items-center mt-1 ${
            item.isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Text className="text-xs text-gray-500 mx-1">
            {formatTime(item.timestamp)}
          </Text>
          {item.isUser && getStatusIcon(item.status)}
        </View>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View className="flex-row justify-start px-4 mb-3">
      <View
        className="rounded-2xl rounded-bl-md px-4 py-3"
        style={{ backgroundColor: cardColor }}
      >
        <View className="flex-row items-center space-x-1">
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <View
            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <View
            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ borderBottomColor: borderColor }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3 overflow-hidden">
              <Image
                source={require('../../assets/images/bhunte.png')}
                alt="Bhunte logo"
                size="xs"
                className="w-full h-full"
              />
            </View>
            <View>
              <ThemedText className="font-semibold text-lg">
                Ask Bhunte
              </ThemedText>
              <Text className="text-green-500 text-sm">Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="call" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 pt-4"
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        {/* Input Area */}
        <View
          className="flex-row items-end px-4 py-3 border-t"
          style={{ borderTopColor: borderColor }}
        >
          <View className="flex-1 flex-row items-end mr-3">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={1000}
              className="flex-1 max-h-24 min-h-12 px-4 py-3 rounded-2xl border text-base"
              style={{
                borderColor: borderColor,
                backgroundColor: cardColor,
                color: textColor,
              }}
              onKeyPress={handleKeyPress}
              blurOnSubmit={false}
              returnKeyType="send"
            />
            <TouchableOpacity className="ml-2 p-2">
              <Ionicons name="attach" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
            disabled={inputText.trim().length === 0}
            style={{
              opacity: inputText.trim().length === 0 ? 0.5 : 1,
            }}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
