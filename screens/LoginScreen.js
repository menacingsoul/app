import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          navigation.replace("Home");
        } else {
          // token not found i.e. user is not logged in
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    checkLoginStatus();
  }, []);
  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };

    axios
      .post("http://172.20.101.191:3000/login", user)
      .then((response) => {
        console.log(response);
        const token = response.data.token;
        AsyncStorage.setItem("authToken", token);

        navigation.replace("Home");
      })
      .catch((error) => {
        Alert.alert("Login Error", "Invalid email or password");
        console.log("Login Error", error);
      });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View>
        <Text
          style={{
            color: "#838FE2",
            fontSize: 30,
            fontWeight: "600",
            padding: 10,
            marginBottom: 10,
          }}
        >
          ChatterBox
        </Text>
      </View>
      <KeyboardAvoidingView
        style={{
          backgroundColor: "#2B2D37",
          padding: 20,
          borderRadius: 15,
        }}
      >
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              marginTop: 15,
              color: "white",
            }}
          >
            Sign In to Your Account
          </Text>
        </View>

        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={{
                fontSize: email ? 15 : 15,
                borderBottomColor: "#838FE2",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                color: "#AEAEAE",
              }}
              placeholderTextColor={"#AEAEAE"}
              placeholder="Enter Your Email"
            />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
              Password
            </Text>

            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={{
                fontSize: email ? 15 : 15,
                borderBottomColor: "#838FE2",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                color: "#AEAEAE",
              }}
              placeholderTextColor={"#AEAEAE"}
              placeholder="Enter Your Password"
            />
          </View>

          <Pressable onPress={handleLogin}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#838FE2",
                marginTop: 50,
                borderWidth: 0,
                padding: 5,
                paddingHorizontal: 15,
                borderRadius: 7,
                backgroundColor: "#4A57A2",
                marginLeft: "auto",
                color: "white",
                marginRight: "auto",
              }}
            >
              Login
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Dont't have an account?{" "}
              <Text style={{ color: "#4A57A2" }}>Register</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
