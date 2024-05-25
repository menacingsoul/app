import { StyleSheet, Text, View, Pressable, Image, Alert, TouchableOpacity } from "react-native";
import React, { useContext, useRef, useEffect } from "react";
import { UserType } from "../UserContext";
import axios from "axios";
import io from "socket.io-client";



const FriendRequest = ({ item, userId,onFriendRequestUpdate }) => {
    const socket = useRef(null);
    useEffect(() => {
        socket.current = io("http://192.168.56.1:3000");
        socket.current.on("connect", () => {
            socket.current.emit("setUser", userId);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [userId]);

    const handleAction = async (action) => {
        try {
            const response = await axios.post(
                `http://192.168.56.1:3000/friend-request/${action}`,
                { senderId: item._id, recipientId: userId }
            );

            if (response.status === 200) {
                console.log(`Friend request ${action}d:`, response.data);

                onFriendRequestUpdate(item._id);
                // Emit event to the backend for real-time updates
                socket.current.emit(`friendRequest${action.charAt(0).toUpperCase() + action.slice(1)}`, {
                    _id: item._id, 
                    status: action // Add status for FriendScreen to differentiate the action
                });
            } else {
                console.error(`Failed to ${action} friend request:`, response.data);
                Alert.alert("Error", `Failed to ${action} friend request. Please try again.`);
            }
        } catch (error) {
            console.error("Error handling friend request:", error);
            Alert.alert("Error", "An error occurred. Please try again later.");
        }
    };


  return (
      <Pressable style={styles.container}>
          <View style={styles.profileContainer}>
              <Image style={styles.image} source={{ uri: item.image||'https://freesvg.org/img/abstract-user-flat-4.png'}} />
              <Text style={styles.name}>{item.name}</Text>
          </View>

          <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleAction('accept')} style={styles.acceptButton}>
                  <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAction('decline')} style={styles.declineButton}>
                  <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
          </View>
      </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#222', // Dark background
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',  // Shadow color
    shadowOffset: {
        width: 0,
        height: 1.5,
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 2.84,  // Shadow blur radius
    elevation: 3,       // Elevation for Android
  },
  profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  image: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
  },
  name: {
      fontSize: 16,
      fontFamily: 'Poppins', // Using Poppins font
      color: '#fff',  // Light text for contrast
  },
  buttonContainer: {
      flexDirection: 'row',
  },
  acceptButton: {
      backgroundColor: '#535C91',  
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 8,
      marginRight: 10,
  },
  declineButton: {
      backgroundColor: '#BE3144', 
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 8,
  },
  buttonText: {
      color: 'white',
      fontFamily: 'Poppins',
      fontWeight: '600',
  },
});

export default FriendRequest;
