import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Modal,
  Image,
  TouchableOpacity,
  Categories
} from "react-native";
import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import io from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const CLOUDINARY_CLOUD_NAME = "dzwncn3nz";
const CLOUDINARY_UPLOAD_PRESET = "whzhck28";
const CLOUDINARY_UPLOAD_PRESET_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const route = useRoute();
  const { recepientId } = route.params;
  const [message, setMessage] = useState("");
  const { userId, setUserId } = useContext(UserType);

  const scrollViewRef = useRef(null);

  const socket = useRef(null); // Ref for the socket connection

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  useEffect(() => {
    socket.current = io("https://chatterbox-backend-asgm.onrender.com"); // Your backend URL

    socket.current.on("connect", () => {
      socket.current.emit("setUser", userId); // Set the user ID
    });

    socket.current.on("newMessage", (newMessage) => {
      // Check if the new message belongs to this chat
      if (
        newMessage.senderId._id === recepientId ||
        newMessage.recepientId === recepientId
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      }
    });

    return () => {
      socket.current.disconnect(); // Clean up on unmount
    };
  }, [recepientId, userId]); // Re-run effect if these change

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://chatterbox-backend-asgm.onrender.com/messages/${userId}/${recepientId}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        console.log("error showing messages", response.status.message);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(
          `https://chatterbox-backend-asgm.onrender.com/user/${recepientId}`
        );

        const data = await response.json();
        setRecepientData(data);
      } catch (error) {
        console.log("error retrieving details", error);
      }
    };

    fetchRecepientData();
  }, []);

  const handleSend = async (messageType, imageUri) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);
      formData.append("messageType", messageType);

      if (messageType === "image") {
        const fileBase64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const cloudinaryResponse = await axios.post(
          CLOUDINARY_UPLOAD_PRESET_URL,
          {
            file: `data:image/jpeg;base64,${fileBase64}`,
            upload_preset: CLOUDINARY_UPLOAD_PRESET,
          }
        );

        const imageUrl = cloudinaryResponse.data.secure_url;
        formData.append("imageUrl", imageUrl);
      } else if (messageType === "text") {
        formData.append("messageText", message);
      }

      const response = await fetch(
        "https://chatterbox-backend-asgm.onrender.com/messages",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setMessage("");
        fetchMessages();
      } else {
        console.error(
          "Error sending message:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  console.log("messages", selectedMessages);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: "#9290C3", // Set the background color of the navigation bar
      },
      headerTitle: "",
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="white"
          />

          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: "cover",
                }}
                source={{
                  uri:
                    recepientData?.image ||
                    "https://freesvg.org/img/abstract-user-flat-4.png",
                }}
              />

              <Text
                style={{
                  marginLeft: 5,
                  fontSize: 15,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="md-arrow-undo" size={24} color="white" />
            <MaterialIcons
              onPress={() => deleteMessages(selectedMessages)}
              name="delete"
              size={24}
              color="white"
            />
          </View>
        ) : null,
    });
  }, [recepientData, selectedMessages]);

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch(
        "https://chatterbox-backend-asgm.onrender.com/deleteMessages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: messageIds }),
        }
      );

      if (response.ok) {
        setSelectedMessages((prevSelectedMessages) =>
          prevSelectedMessages.filter((id) => !messageIds.includes(id))
        );

        fetchMessages();
      } else {
        console.log("error deleting messages", response.status);
      }
    } catch (error) {
      console.log("error deleting messages", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      handleSend("image", result.assets[0].uri);
    }
  };

  const handleSelectMessage = (message) => {
    //check if the message is already selected
    if (selectedMessages.includes(message._id)) {
      setSelectedMessages((prevSelectedMessages) =>
        prevSelectedMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((prevSelectedMessages) => [
        ...prevSelectedMessages,
        message._id,
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
    >
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={{ paddingVertical: 15 }}>
          {messages.map((message, index) => (
            <Pressable
              onPress={() => handleSelectMessage(message)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: selectedMessages.includes(message._id)
                  ? "#D3D3D3"
                  : "transparent",
                borderRadius: 10,
                padding: 5,
                alignSelf:
                  message.senderId._id === userId ? "flex-end" : "flex-start",
              }}
              key={index}
            >
              {message.messageType === "text" ? (
                <View>
                  <View
                    style={{
                      backgroundColor:
                        message.senderId._id === userId ? "#9290C3" : "#F6B17A",
                      padding: 10,
                      borderRadius: 10,
                      maxWidth: 270,
                      alignSelf:
                        message.senderId._id === userId
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          message.senderId._id === userId ? "#FFFFFF" : "#000",
                      }}
                    >
                      {message.message}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#888888",
                      alignSelf:
                        message.senderId._id === userId
                          ? "flex-end"
                          : "flex-start",
                      marginHorizontal: 10,
                      marginTop: 2,
                    }}
                  >
                     {formatTime(message?.timeStamp)}
                  </Text>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    onPress={() => setSelectedImage(message.imageUrl)}
                  >
                    <Image
                      source={{ uri: message.imageUrl }}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#888888",
                      alignSelf:
                        message.senderId._id === userId
                          ? "flex-end"
                          : "flex-start",
                      marginHorizontal: 10,
                      marginTop: 2,
                    }}
                  >
                     {formatTime(message?.timeStamp)}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <Modal visible={selectedImage !== null} transparent={true}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.modalImage} />
          )}
        </TouchableOpacity>
      </Modal>
      {showEmojiSelector &&(
        <EmojiSelector
          onEmojiSelected={(emoji) => setMessage(message + emoji)}
          showSearchBar={true}
          showTabs={true}
          showHistory={true}
          style={{ height: 250}}

        />
      )}
      <View style={styles.inputContainer}>
        <Feather
          onPress={handleEmojiPress}
          style={styles.icon}
          name="smile"
          size={24}
          color="black"
        />
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={styles.input}
          placeholder="Type a message"
        />
        <Entypo
          onPress={pickImage}
          style={styles.icon}
          name="attachment"
          size={20}
          color="black"
        />
        <Ionicons
          onPress={() => handleSend("text")}
          style={styles.icon}
          name="send"
          size={20}
          color="black"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    padding: 10,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
});
