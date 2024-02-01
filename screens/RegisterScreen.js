import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import React from "react";
import axios from "axios";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
      image: image,
    };

    //send a POST req

    axios
      .post(
        "http://172.20.101.191:3000/register",
        user
      )
      .then((response) => {
        console.log(response);
        Alert.alert(
          "Registration Successful",
          "You have been registered Successfully"
        );
        setName("");
        setEmail("");
        setPassword("");
        setImage("");
      })
      .catch((err) => {
        console.log("registration failed", err);
        Alert.alert(
          "Registration failed",
          `An error occurred while registering: ${err.message}`,
          [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed")
            }
          ]
        );
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
            Register Your Account
          </Text>
        </View>

        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
              Name
            </Text>

            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={{
                fontSize: email ? 15 : 15,
                borderBottomColor: "#838FE2",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                color: "#AEAEAE",
              }}
              placeholderTextColor={"#AEAEAE"}
              placeholder="Enter Your Name"
            />
          </View>
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
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
              Profile Photo
            </Text>

            <TextInput
              value={image}
              onChangeText={(text) => setImage(text)}
              style={{
                fontSize: email ? 15 : 15,
                borderBottomColor: "#838FE2",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                color: "#AEAEAE",
              }}
              placeholderTextColor={"#AEAEAE"}
              placeholder="Upload image"
            />
          </View>

          <Pressable onPress={handleRegister}>
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
              Register
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack("Login")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Already a user? <Text style={{ color: "#4A57A2" }}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
