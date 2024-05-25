import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useContext, useState, useRef } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";
import io from "socket.io-client";

const FriendsScreen = () => {
  const { userId, acceptedFriends, setAcceptedFriends } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://192.168.56.1:3000");

    socket.current.on("connect", () => {
      socket.current.emit("setUser", userId);
    });

    fetchFriendRequests(); // Initial fetch

    socket.current.on("newFriendRequest", (newRequest) => {
      // Only add if the request is not already in the list or accepted
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
        // fetchAcceptedFriends(); You do not need this here
        setAcceptedFriends((prevFriends) => [...prevFriends, data.user]);
      }
    };

    socket.current.on("friendRequestAccepted", handleFriendRequestUpdate);
    socket.current.on("friendRequestDeclined", handleFriendRequestUpdate);

    return () => {
      socket.current.disconnect();
    };
  }, [userId]); // Remove acceptedFriends as a dependency here, as it was causing unnecessary refetching of friend requests

  
  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `http://192.168.56.1:3000/friend-request/${userId}`
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        // Ensure acceptedFriends is available before filtering
        const updatedFriendRequests = acceptedFriends
          ? response.data.filter(
              (request) =>
                !acceptedFriends.some((friend) => friend._id === request._id)
            )
          : response.data; // If acceptedFriends is not yet loaded, use all friend requests

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
    }
  };

  const handleFriendRequestUpdate = (requestId) => {
    // console.log(data)
    setFriendRequests((prevRequests) =>
      prevRequests.filter((request) => request._id.toString() !== requestId.toString())
    );
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {friendRequests.length > 0 ? (
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
