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
  Platform,
  ActivityIndicator,
  ImageBackground,
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
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import io from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import * as MediaLibrary from "expo-media-library"; // Import MediaLibrary

const CLOUDINARY_CLOUD_NAME = "dzwncn3nz";
const CLOUDINARY_UPLOAD_PRESET = "whzhck28";
const CLOUDINARY_UPLOAD_PRESET_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
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
    setSending(true);
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
    } finally {
      setSending(false);
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
            <MaterialIcons
              onPress={() => setShowDeleteDialog(true)}
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

  
  const saveImage = async (imageUrl) => {
    try {
      const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      const { uri } = await downloadResumable.downloadAsync();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Expo", asset, false);

      console.log("Image saved successfully!");
    } catch (error) {
      console.log("Error saving image:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
    >
      <ImageBackground
        source={require("../assets/background.png")} // Your background image
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={handleContentSizeChange}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.messageContainer}>
            {messages.map((message, index) => (
              <Pressable
                onPress={() => handleSelectMessage(message)}
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor:
                      message.senderId._id === userId ? "#8d77c9" : "#2C2C2C",
                    alignSelf:
                      message.senderId._id === userId
                        ? "flex-end"
                        : "flex-start",
                  },
                  selectedMessages.includes(message._id) &&
                    styles.selectedMessage,
                ]}
                key={index}
              >
                {message.messageType === "text" ? (
                  <View>
                    <Text
                      style={[
                        styles.messageText,
                        {
                          color:
                            message.senderId._id === userId
                              ? "#FFFFFF"
                              : "#DDDDDD",
                        },
                      ]}
                    >
                      {message.message}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        {
                          alignSelf:
                            message.senderId._id === userId
                              ? "flex-end"
                              : "flex-start",
                        },
                      ]}
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
                        style={styles.messageImage}
                      />
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.messageTime,
                        {
                          alignSelf:
                            message.senderId._id === userId
                              ? "flex-end"
                              : "flex-start",
                        },
                      ]}
                    >
                      {formatTime(message?.timeStamp)}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
      <Modal visible={selectedImage !== null} transparent={true}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveImage(selectedImage)}
              >
                <Text style={styles.saveButtonText}>Save to Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={(emoji) => setMessage(message + emoji)}
          showSearchBar={true}
          showTabs={true}
          showHistory={true}
          style={styles.emojiSelector}
        />
      )}
      <View style={styles.inputContainer}>
        <Feather
          onPress={handleEmojiPress}
          style={styles.icon}
          name="smile"
          size={24}
          color="#DDDDDD"
        />
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#B5B5B5"
        />
        <Entypo
          onPress={pickImage}
          style={styles.icon}
          name="image"
          size={20}
          color="#DDDDDD"
        />
        {sending ? (
          <ActivityIndicator size="small" color="#6c63ff" /> // Show loader
        ) : (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend("text")}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDeleteDialog}
          onRequestClose={() => setShowDeleteDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete the selected messages?
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteDialog(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    deleteMessages(selectedMessages);
                    setShowDeleteDialog(false);
                  }}
                >
                  <Text style={styles.confirmButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", // Dark background
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 10,
  },
  messageContainer: {
    paddingVertical: 15,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "75%",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: "#9b999e",
    marginHorizontal: 10,
    marginTop: 2,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginTop: 10,
  },
  selectedMessage: {
    backgroundColor: "#444C56", // Darker background for selected messages
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C", // Dark background for the input container
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#3A3A3A", // Slightly lighter border color
  },
  input: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "#3A3A3A",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#FFFFFF",
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
  modalContent: {
    backgroundColor: "#1C1C1E", // Dark background for the modal content
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: 300,
    height: 700,
    borderRadius: 10,
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#0061A8", // Dark blue color for the save button
    padding: 10,
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: "#8d77c9",
    padding: 4,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  emojiSelector: {
    backgroundColor: "#2C2C2C",
    height: 200,
    // Dark background for the emoji selector
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#cccccc",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#ff4d4d",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
