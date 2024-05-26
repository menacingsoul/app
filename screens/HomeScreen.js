import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useLayoutEffect, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RefreshControl } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import User from "../components/User";
const HomeScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 25, fontWeight: "600", color: "#838FE2" }}>
          ChatterBox
        </Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <AntDesign
            name="find"
            onPress={() => navigation.navigate("Home")}
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigation.navigate("Requests")}
            name="people-outline"
            size={24}
            color="black"
          />
          <FontAwesome5
            name="user-circle"
            onPress={() => navigation.navigate("Profile")}
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.userId;
        setUserId(userId);
        
       const response = await axios.get(
          `http://192.168.56.1:3000/users/${userId}`
        );

        if (response.status === 200) {
          setUsers(response.data); // Make sure to update the state
        } else {
          console.error(
            "Error retrieving users:",
            response.status,
            response.data
          );
        }
      } catch (error) {
        console.log("error retrieving users", error);
        setRefreshing(false); // Stop refreshing on error
      } finally {
        setRefreshing(false); // Ensure spinner stops in all cases
      }
    };
    fetchUsers();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <View style={{ padding: 10 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {users.map((item, index) => (
            <User key={index} item={item} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
