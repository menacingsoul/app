import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";
import io from "socket.io-client";

const UserChat = ({ item }) => {
  const { userId } = useContext(UserType);
  const [lastMessage, setLastMessage] = useState(null);
  const navigation = useNavigation();
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("https://chatterbox-backend-asgm.onrender.com");
    socket.current.on("connect", () => {
      socket.current.emit("setUser", userId);
    });

    fetchLastMessage(); // Initial fetch

    socket.current.on("newMessage", (newMessage) => {
      if (
        newMessage.senderId._id === item._id ||
        newMessage.recepientId === item._id
      ) {
        setLastMessage(newMessage);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [item._id, userId]);

  const fetchLastMessage = async () => {
    try {
      const response = await fetch(
        `https://chatterbox-backend-asgm.onrender.com/messages/${userId}/${item._id}`
      );

      if (response.ok) {
        const data = await response.json();
        setLastMessage(data[data.length - 1]); // Get the last message directly
      } else {
        console.error("Error fetching messages:", response.statusText); // Improved error logging
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Messages", {
          recepientId: item._id,
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 0.7,
        borderColor: "#D0D0D0",
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10,
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25, resizeMode: "cover" }}
        source={{ uri: item?.image||'https://freesvg.org/img/abstract-user-flat-4.png' }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "500" }}>{item?.name}</Text>
        {lastMessage && (
          <Text style={{ marginTop: 3, color: "black", fontWeight: "500" }}>
            {lastMessage?.message}
          </Text>
        )}
      </View>

      <View>
        <Text style={{ fontSize: 11, fontWeight: "400", color: "black" }}>
          {lastMessage && formatTime(lastMessage?.timeStamp)}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});
