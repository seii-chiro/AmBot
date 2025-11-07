import Header from "@/components/header";
import { Colors } from "@/constants/theme";
import useMessageHistory, {
  Conversation,
  MessagesHistory,
} from "@/hooks/useMessageHistory";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import IconSymbol from "../components/icon-symbol";
import ThemedPressable from "../components/themed-pressable";
import ThemedText from "../components/themed-text";
import ThemedTextInput from "../components/themed-text-input";
import ThemedView from "../components/themed-view";

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Messages {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export const saveConversation = async (conversation: Conversation) => {
  try {
    // Get existing conversations
    const existingConversations = await AsyncStorage.getItem("conversations");
    const conversations: Conversation[] = existingConversations
      ? JSON.parse(existingConversations)
      : [];

    // Check if conversation already exists (update) or add new
    const existingIndex = conversations.findIndex(
      (c) => c.id === conversation.id
    );
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.unshift(conversation); // Add to beginning
    }

    await AsyncStorage.setItem("conversations", JSON.stringify(conversations));
  } catch (e) {
    console.error("Error saving conversation:", e);
  }
};

const Index = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ? Colors[colorScheme] : Colors.light;

  const { payload, setPayload } = useMessageHistory();

  // Generate conversation ID on first user message
  const [conversationId] = useState(() => Date.now().toString());

  const [messages, setMessages] = useState<Messages[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const updatePayload = (newMessage: MessagesHistory) => {
    setPayload((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const cleanupReferences = (text: string) => {
    return text
      .replace(/\[[s]?\d+\]/gi, "") // [s1], [1], etc.
      .replace(/\[doc\d+\]/gi, "") // [doc1], [doc2], etc.
      .replace(/\[ref\d+\]/gi, "") // [ref1], [ref2], etc.
      .replace(/\[source\d+\]/gi, "") // [source1], [source2], etc.
      .replace(/\[\d+\]/g, "") // [1], [2], etc.
      .replace(/\[.*?\]/g, "") // Any other [text] patterns
      .replace(/\s+/g, " ") // Clean up multiple spaces
      .trim();
  };

  const sendMessageToAPI = async (messageHistory: MessagesHistory[]) => {
    try {
      const response = await fetch("http://192.168.1.78:8005/rag/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messageHistory }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      // Get the full response text (NDJSON)
      const text = await response.text();

      // Parse NDJSON - split by newlines and combine content
      const lines = text
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      let fullMessage = "";

      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line);

          // Extract content from various formats
          if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
            fullMessage += jsonData.choices[0].delta.content;
          } else if (jsonData.content) {
            fullMessage += jsonData.content;
          } else if (jsonData.text) {
            fullMessage += jsonData.text;
          } else if (jsonData.message) {
            fullMessage += jsonData.message;
          } else if (typeof jsonData === "string") {
            fullMessage += jsonData;
          }
        } catch {
          fullMessage += line;
        }
      }
      return { text: fullMessage || "No content received" };
    } catch (error) {
      throw error;
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage: Messages = {
        id: Date.now(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentInput = inputText;
      setInputText("");
      setIsLoading(true);

      // Add thinking indicator
      const thinkingId = Date.now() + 1;
      const thinkingMessage: Messages = {
        id: thinkingId,
        text: "Thinking...",
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, thinkingMessage]);

      // Auto scroll to bottom after adding user message and thinking indicator
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Add user message to payload history
      const userMsgForLLM: MessagesHistory = {
        role: "user",
        content: currentInput,
      };

      // Create the next payload with accumulated message history
      const nextPayload = {
        model: payload.model,
        messages: [...payload.messages, userMsgForLLM],
      };

      // Update payload state
      updatePayload(userMsgForLLM);

      try {
        const response = await sendMessageToAPI(nextPayload.messages);

        // Replace thinking message with actual response
        const cleanedText = cleanupReferences(
          response.text || "Sorry, I received an empty response."
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingId
              ? {
                  ...msg,
                  text: cleanedText,
                  isStreaming: false,
                }
              : msg
          )
        );

        // Auto scroll to bottom after response
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Add AI response to payload history
        const aiResponse: MessagesHistory = {
          role: "assistant",
          content: cleanedText,
        };
        updatePayload(aiResponse);

        // Save the entire conversation
        const conversation: Conversation = {
          id: conversationId,
          title:
            payload.messages[0]?.content.slice(0, 50) ||
            currentInput.slice(0, 50),
          timestamp: new Date(),
          messages: [...nextPayload.messages, aiResponse],
        };
        await saveConversation(conversation);
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingId
              ? {
                  ...msg,
                  text: `Error: ${
                    error instanceof Error
                      ? error.message
                      : "Unknown error occurred"
                  }`,
                  isStreaming: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Messages }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {item.isStreaming && item.text === "Thinking..." ? (
          <View style={styles.thinkingContainer}>
            <View style={[styles.thinkingDot, styles.thinkingDot1]} />
            <View style={[styles.thinkingDot, styles.thinkingDot2]} />
            <View style={[styles.thinkingDot, styles.thinkingDot3]} />
          </View>
        ) : (
          <ThemedText
            style={[styles.messageText, item.isUser && styles.userMessageText]}
          >
            {item.text}
          </ThemedText>
        )}
      </View>
      <ThemedText style={[styles.timestamp, { color: theme.tabIconDefault }]}>
        {item.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.container}>
        <Header />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              borderTopColor: theme.tabIconDefault,
              backgroundColor: theme.background,
            },
          ]}
        >
          <ThemedTextInput
            style={[
              styles.textInput,
              {
                backgroundColor: "#FFF",
                borderColor: theme.tabIconDefault,
                color: "#000",
              },
            ]}
            placeholder={isLoading ? "Sending..." : "Type your message..."}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <ThemedPressable
            style={[
              styles.sendButton,
              {
                backgroundColor: "#0a7ea4",
                opacity: isLoading ? 0.8 : 1,
              },
            ]}
            onPress={sendMessage}
            disabled={isLoading}
          >
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          </ThemedPressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 6,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#0a7ea4",
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: "#e9e9e9",
    borderWidth: 1,
    borderColor: "#687076",
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#000",
  },
  userMessageText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  thinkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    marginHorizontal: 2,
  },
  thinkingDot1: {
    opacity: 0.4,
  },
  thinkingDot2: {
    opacity: 0.7,
  },
  thinkingDot3: {
    opacity: 1,
  },
});
