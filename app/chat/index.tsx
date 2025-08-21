import { ThemedText } from '@/components/ThemedText';
import { Image } from '@/components/ui';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { openaiService } from '@/core/services/openaiService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
  isStreaming?: boolean;
}

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Bhunte, your AI assistant for Rumsan Wallet. How can I help you today?",
      timestamp: new Date(Date.now() - 10000),
      isUser: false,
      status: 'read',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;

    const userMessageText = inputText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      timestamp: new Date(),
      isUser: true,
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);
    setIsLoading(true);

    // Update message status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg,
        ),
      );
    }, 500);

    try {
      // Prepare conversation history for OpenAI
      const conversationHistory = messages
        .filter((msg) => msg.id !== newMessage.id) // Exclude the current message
        .map((msg) => ({
          role: msg.isUser ? ('user' as const) : ('assistant' as const),
          content: msg.text,
        }));

      // Create a streaming AI response message
      const aiMessageId = (Date.now() + 1).toString();
      const streamingMessage: Message = {
        id: aiMessageId,
        text: '',
        timestamp: new Date(),
        isUser: false,
        status: 'read',
        isStreaming: true,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, streamingMessage]);

      // Update user message status to delivered
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'delivered' as const }
            : msg,
        ),
      );

      // Stream AI response
      await openaiService.sendChatMessageStream(
        userMessageText,
        conversationHistory,
        // onToken callback - append each token to the streaming message
        (token: string) => {
          // Ensure typing indicator is off when first token arrives
          setIsTyping(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: msg.text + token } : msg,
            ),
          );
        },
        // onComplete callback
        () => {
          setIsLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg,
            ),
          );

          // Mark user message as read
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === newMessage.id
                  ? { ...msg, status: 'read' as const }
                  : msg,
              ),
            );
          }, 500);
        },
        // onError callback
        (error: Error) => {
          setIsLoading(false);
          console.error('Error streaming message from OpenAI:', error);

          // Remove the streaming message and add error message
          setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));

          const errorResponse: Message = {
            id: (Date.now() + 2).toString(),
            text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.",
            timestamp: new Date(),
            isUser: false,
            status: 'read',
          };

          setMessages((prev) => [...prev, errorResponse]);

          // Update user message status to show it failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id
                ? { ...msg, status: 'sent' as const }
                : msg,
            ),
          );

          // Show alert
          Alert.alert(
            'Connection Error',
            'Unable to connect to AI assistant. Please check your internet connection and try again.',
            [{ text: 'OK' }],
          );
        },
      );
    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);

      console.error('Error sending message to OpenAI:', error);

      // Show error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.",
        timestamp: new Date(),
        isUser: false,
        status: 'read',
      };

      setMessages((prev) => [...prev, errorResponse]);

      // Update user message status to show it failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg,
        ),
      );

      // Show alert
      Alert.alert(
        'Connection Error',
        'Unable to connect to AI assistant. Please check your internet connection and try again.',
        [{ text: 'OK' }],
      );
    }
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
          {/* Streaming indicator */}
          {item.isStreaming && (
            <View className="flex-row items-center mt-1">
              <View className="w-1 h-1 bg-gray-400 rounded-full animate-pulse mr-1" />
              <View
                className="w-1 h-1 bg-gray-400 rounded-full animate-pulse mr-1"
                style={{ animationDelay: '0.2s' }}
              />
              <View
                className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
            </View>
          )}
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
              <ThemedText
                className="font-semibold text-lg"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
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
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        />

        {/* Input Area */}
        <View
          className="flex-row items-center px-4 py-3 border-t"
          style={{ borderTopColor: borderColor }}
        >
          <View className="flex-1 flex-row items-center mr-3">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Please ask me anything..."
              placeholderTextColor="#9ca3af"
              multiline={false}
              maxLength={1000}
              className="flex-1 h-12 px-4 py-3 rounded-2xl border text-base"
              style={{
                borderColor: borderColor,
                backgroundColor: cardColor,
                color: textColor,
                textAlignVertical: 'center',
              }}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
              returnKeyType="send"
              editable={!isLoading}
            />
            <TouchableOpacity className="ml-2 p-2">
              <Ionicons name="attach" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
            disabled={inputText.trim().length === 0 || isLoading}
            style={{
              opacity: inputText.trim().length === 0 || isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? (
              <Ionicons name="hourglass" size={20} color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
