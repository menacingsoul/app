import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  View,
  Alert, // Import Alert
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State for the loading spinner
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          navigation.replace("Home");
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true); // Set loading state to true
    const user = {
      email: email,
      password: password,
    };
    try {
      const response = await axios.post("https://chatterbox-backend-asgm.onrender.com/login", user);
      console.log(response);
      const token = response.data.token;
      await AsyncStorage.setItem("authToken", token);

      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Login Error", "Invalid email or password");
      console.log("Login Error", error);
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>ChatterBox</Text>
      </View>
      <KeyboardAvoidingView style={styles.formContainer}>
        <View style={styles.centeredView}>
          <Text style={styles.subtitle}>Sign In to Your Account</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.textInput}
            placeholderTextColor={"#AEAEAE"}
            placeholder="Enter Your Email"
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            style={styles.textInput}
            placeholderTextColor={"#AEAEAE"}
            placeholder="Enter Your Password"
          />
        </View>

        <Pressable onPress={handleLogin} style={styles.loginButton}>
          {isLoading ? (
            <ActivityIndicator size="large" color="white" /> // Show loader
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerHighlight}>Register</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#838FE2",
    fontSize: 30,
    fontWeight: "600",
    padding: 10,
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: "#2B2D37",
    padding: 20,
    borderRadius: 15,
  },
  centeredView: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 15,
    color: "white",
  },
  inputWrapper: {
    marginTop: 7,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  textInput: {
    fontSize: 15,
    borderBottomColor: "#838FE2",
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
    color: "#AEAEAE",
  },
  loginButton: {
    marginTop: 7,
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 7,
    backgroundColor: "#4A57A2",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  registerLink: {
    marginTop: 15,
  },
  registerText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
  registerHighlight: {
    color: "#4A57A2",
  },
});

export default LoginScreen;
