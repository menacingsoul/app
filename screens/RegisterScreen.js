import React, { useState, useContext } from "react";
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
import axios from "axios";
import { UserType } from "../UserContext";

const RegisterScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    const navigation = useNavigation();
    const { setUserId } = useContext(UserType);

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        try {
            const response = await axios.post("http://192.168.56.1:3000/send-otp", {
                email: email,
            });
            if (response.status === 200) {
                setIsOtpSent(true);
                setShowOtpInput(true);
                Alert.alert("Success", "OTP sent to your email. Please check your inbox also check spam folder");
            } else {
                throw new Error(response.data.error);
            }
        } catch (err) {
            Alert.alert("OTP Error", err.message, [{ text: "OK" }]);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post("http://192.168.56.1:3000/verify-otp", {
                email: email,  // Send email 
                otp: otp,
            });
            if (response.status === 200) {
                await handleRegister(); // Proceed with registration after successful OTP verification
            } else {
                throw new Error(response.data.error);
            }
        } catch (err) {
            Alert.alert("Verification failed", err.message, [{ text: "OK" }]);
        }
    };

    const handleRegister = async () => {
        // ... (your existing user data creation logic) ...

        try {
          const user = {
            name: name,
            email: email,
            password: password,
            image: image,
          };
      
            const response = await axios.post(
                "http://192.168.56.1:3000/register",
                user
            );
            console.log(response);

            if (response.status === 200) {
                Alert.alert(
                  "Registration Successful",
                  "You have been registered Successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setName("");
                        setEmail("");
                        setPassword("");
                        setImage("");
                        setOtp("");
                        setShowOtpInput(false);
                        setUserId(response.data.userId);
                        navigation.navigate("Login"); 
                      },
                    },
                  ]
                );
            } else {
                throw new Error(response.data.error);
            }
        } catch (err) {
            console.log("registration failed", err);
            Alert.alert(
                "Registration failed",
                `An error occurred while registering: ${err.message}`,
                [{ text: "OK" }]
            );
        }
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
              keyboardType="email-address"
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
          {!isOtpSent && ( 
                    <Pressable onPress={handleSendOtp} style={styles.button}>
                        <Text style={styles.buttonText}>Send OTP</Text>
                    </Pressable>
                )}

                {showOtpInput && (
                    <>
                        <Text style={styles.label}>OTP</Text>
                        <TextInput
                            value={otp}
                            onChangeText={(text) => setOtp(text)}
                            style={styles.input}
                            placeholderTextColor="#AEAEAE"
                            placeholder="Enter OTP"
                            keyboardType="numeric"
                        />
                        <Pressable onPress={handleVerifyOtp} style={styles.button}>
                            <Text style={styles.buttonText}>Verify OTP</Text>
                        </Pressable>
                    </>
                )}
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

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  input: {
    fontSize: 15,
    borderBottomColor: "#838FE2",
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
    color: "#AEAEAE",
  },
  button: {
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
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
