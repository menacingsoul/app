import React, { useLayoutEffect, useContext, useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import User from "../components/User";
import { UserType } from "../UserContext";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { userId, setUserId } = useContext(UserType);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    setIsLoading(true); // Start loading
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.userId;
        setUserId(userId);

        const response = await axios.get(
          `https://chatterbox-backend-asgm.onrender.com/users/${userId}`,
          { cache: false }
        );

        if (response.status === 200) {
          setUsers(response.data);
        } else {
          console.error("Error retrieving users:", response.status, response.data);
        }
      }
    } catch (error) {
      console.log("Error retrieving users:", error);
    } finally {
      setIsLoading(false); // Stop loading
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={styles.headerTitle}>ChatterBox</Text>
      ),
      headerRight: () => (
        <View style={styles.headerIcons}>
          <Ionicons onPress={() => navigation.navigate("Chats")} name="chatbox-ellipses-outline" size={24} color="black" />
          <AntDesign name="find" onPress={() => navigation.navigate("Home")} size={24} color="black" />
          <MaterialIcons onPress={() => navigation.navigate("Requests")} name="people-outline" size={24} color="black" />
          <FontAwesome5 name="user-circle" onPress={() => navigation.navigate("Profile")} size={24} color="black" />
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUsers();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#838FE2" />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {users.map((item, index) => (
            <User key={index} item={item} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "#838FE2",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default HomeScreen;
