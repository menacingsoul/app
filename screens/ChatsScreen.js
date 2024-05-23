import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext";
import { useRef } from 'react';
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";
import io from 'socket.io-client';

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  const socket = useRef(null);
  useEffect(() => {
    socket.current = io('http://192.168.56.1:3000');

    socket.current.on('connect', () => {
        socket.current.emit('setUser', userId);
    });

    const acceptedFriendsList = async () => {
        try {
            const response = await fetch(
                `http://192.168.56.1:3000/accepted-friends/${userId}`
            );
            const data = await response.json();

            if (response.ok) {
                setAcceptedFriends(data);
            }
        } catch (error) {
            console.log("error showing the accepted friends", error);
        }
    };

    acceptedFriendsList(); // Initial fetch

    // Listen for the 'friendRequestAccepted' event
    socket.current.on('friendRequestAccepted', async (data) => {
        // Check if the current user is either the sender or receiver
        if (data.senderId === userId || data.recipientId === userId) {
            await acceptedFriendsList(); // Re-fetch the accepted friends list
        }
    });

    return () => {
        socket.current.disconnect();
    };
}, [userId]); // Dependency on userId

  console.log("friends", acceptedFriends);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item, index) => (
          <UserChat key={index} item={item} />
        ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});