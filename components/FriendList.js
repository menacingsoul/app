import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, Image, TouchableOpacity } from "react-native";
import axios from "axios";
import { useContext, useRef } from "react";
import { UserType } from "../UserContext";
import io from "socket.io-client";


const FriendList = ({ friends }) => {
    const { userId } = useContext(UserType);
    const socket = useRef(null);
    useEffect(() => {
        socket.current = io("https://chatterbox-backend-asgm.onrender.com");
        socket.current.on("connect", () => {
          socket.current.emit("setUser", userId);
        });
    
        return () => {
          socket.current.disconnect();
        };
      }, [userId]);
      const handleRemoveFriend = async (friendId) => {
        try {
          const response = await axios.post(
            `https://chatterbox-backend-asgm.onrender.com/remove-friend`,
            { userId, friendId }
          );
          if (response.status === 200) {
            // Success! You might want to update your state or show a message
            console.log(response.data.message);
            // Emit socket event for real-time update
            socket.current.emit("friendRemoved", friendId);
          } else {
            console.error(response.data.error);
            Alert.alert("Error", "Failed to remove friend. Please try again.");
          }
        } catch (error) {
          console.error("Error removing friend:", error);
          Alert.alert("Error", "An error occurred. Please try again later.");
        }
      };
        
  return (
    <View style={styles.friendsSection}>
      <Text style={styles.sectionTitle}>Friends:</Text>
      {friends.length === 0 ? (
        <Text style={styles.noFriendsText}>No friends yet.</Text> // Empty state
      ) : (
        <FlatList
          data={friends}
          horizontal={true}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity>
                <View style={styles.friendCard}>
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://freesvg.org/img/abstract-user-flat-4.png",
                }}
                style={styles.friendImage}
              />
              <Text style={styles.friendName}>{item.name}</Text>
              <Pressable style={styles.removeButton} 
              onPress={() => handleRemoveFriend(item._id)}
              ><Text style={{color:'white',fontWeight: "bold",padding:2}}>Remove</Text></Pressable>
              </View>
              </TouchableOpacity>
          )}
          contentContainerStyle={styles.friendsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
 
  friendsSection: {
    marginTop: 10,
        gap: 5,
        flexDirection: 'column',
        padding: 15,
        
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "Black",
    marginBottom: 10,
    padding: 10,
    
  },
  friendsListContent: {
    padding :0,
  },
  friendItem: {
    
    alignItems: "center",
    padding: 10,
    backgroundColor:"black",
   
  },
  friendCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#EFE1D1",
    borderRadius: 10,
    marginHorizontal: 5,
    width: 170,
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginVertical:3,
    marginHorizontal: 5,
    
  },
  friendName: {
    fontSize: 17,
    color: "black",
    marginTop: 3,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    color: "#ccc",
  },
  noFriendsText: {
    textAlign: "center",
    marginTop: 20,
    color: "black",
  },
  removeButton:{
    backgroundColor: "#CD1818",
    padding: 5,
    borderRadius: 5,
    marginTop: 7,
    
  }
});

export default FriendList;
