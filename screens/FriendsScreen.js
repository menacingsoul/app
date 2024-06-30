import React, { useEffect, useContext, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";
import io from "socket.io-client";
import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";

const FriendsScreen = () => {
  const { userId, acceptedFriends, setAcceptedFriends } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useRef(null);

  const fetchFriendRequests = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://chatterbox-backend-asgm.onrender.com/friend-request/${userId}`
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        const updatedFriendRequests = acceptedFriends
          ? response.data.filter(
              (request) =>
                !acceptedFriends.some((friend) => friend._id === request._id)
            )
          : response.data;

        setFriendRequests(updatedFriendRequests);
      } else {
        console.error(
          "Error fetching friend requests:",
          response.status,
          response.data
        );
        setFriendRequests([]);
      }
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      setFriendRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [acceptedFriends, userId]);

  useEffect(() => {
    socket.current = io("https://chatterbox-backend-asgm.onrender.com");

    socket.current.on("connect", () => {
      socket.current.emit("setUser", userId);
    });

    fetchFriendRequests();

    socket.current.on("newFriendRequest", (newRequest) => {
      if (
        !friendRequests.some((request) => request._id === newRequest._id) &&
        !acceptedFriends.some((friend) => friend._id === newRequest._id)
      ) {
        setFriendRequests((prevRequests) => [...prevRequests, newRequest]);
      }
    });

    socket.current.on("sentFriendRequest", () => {
      fetchFriendRequests();
    });

    const handleFriendRequestUpdate = (data) => {
      setFriendRequests((prevRequests) =>
        prevRequests.filter(
          (request) => request._id.toString() !== data.user._id.toString()
        )
      );

      if (data.status === "accepted") {
        setAcceptedFriends((prevFriends) => [...prevFriends, data.user]);
      }
    };

    socket.current.on("friendRequestAccepted", handleFriendRequestUpdate);
    socket.current.on("friendRequestDeclined", handleFriendRequestUpdate);

    return () => {
      socket.current.disconnect();
    };
  }, [fetchFriendRequests, userId]);

  const handleFriendRequestUpdate = useCallback((requestId) => {
    setFriendRequests((prevRequests) =>
      prevRequests.filter((request) => request._id.toString() !== requestId.toString())
    );
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#838FE2" />
      ) : friendRequests.length > 0 ? (
        <>
          <Text style={styles.title}>Your Friend Requests:</Text>
          {friendRequests.map((item, index) => (
            <FriendRequest key={index} item={item} userId={userId} onFriendRequestUpdate={handleFriendRequestUpdate} />
          ))}
        </>
      ) : (
        <Text style={styles.noRequestsText}>
          You have no pending friend requests!
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noRequestsText: {
    textAlign: "center",
    marginTop: 20,
  },
});

export default FriendsScreen;
