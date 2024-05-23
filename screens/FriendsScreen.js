import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useContext, useState, useRef } from 'react';
import axios from 'axios';
import { UserType } from '../UserContext';
import FriendRequest from '../components/FriendRequest';
import io from 'socket.io-client';

const FriendsScreen = () => {
    const { userId } = useContext(UserType);
    const [friendRequests, setFriendRequests] = useState([]);
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io('http://192.168.56.1:3000');

        socket.current.on('connect', () => {
            socket.current.emit('setUser', userId);
        });

        fetchFriendRequests(); // Initial fetch

        socket.current.on('newFriendRequest', (newRequest) => {
            setFriendRequests(prevRequests => [...prevRequests, newRequest]);
        });

        const handleFriendRequestUpdate = (data) => {
            setFriendRequests(prevRequests => 
                prevRequests.filter(request => request._id.toString() !== data._id.toString())
            );
        };

        socket.current.on('friendRequestAccepted', handleFriendRequestUpdate);

        return () => {
            socket.current.disconnect();
        };
    }, [userId]);

    const fetchFriendRequests = async () => {
        try {
            const response = await axios.get(`http://192.168.56.1:3000/friend-request/${userId}`);
            if (response.status === 200) {
                setFriendRequests(response.data);
            }
        } catch (err) {
            console.log("error message", err);
        }
    };

    return (
        <View style={{ padding: 10, marginHorizontal: 12 }}>
            {friendRequests.length > 0 ? (
                <>
                    <Text>Your Friend Requests!</Text>
                    {friendRequests.map((item, index) => (
                        <FriendRequest
                            key={index}
                            item={item}
                            friendRequests={friendRequests}
                            setFriendRequests={setFriendRequests}
                            userId={userId}
                        />
                    ))}
                </>
            ) : (
                <Text>You have no pending friend requests!</Text>
            )}
        </View>
    );
};

export default FriendsScreen;

const styles = StyleSheet.create({});
