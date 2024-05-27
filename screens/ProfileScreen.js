import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { UserType } from "../UserContext";
import FriendList from "../components/FriendList"; 

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [friends, setFriends] = useState([]); 
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setUserId(null);
      navigation.navigate("Login"); // Navigate to the login screen
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const fetchUserFriends = async () => {
    try {
        const response = await axios.get(
          `https://chatterbox-backend-asgm.onrender.com/user-friends/${userId}`
        );
        if (response.status === 200) {
          setFriends(response.data);
        } else {
          console.error("Error fetching friends:", response.status, response.data); // Log status and data
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoadingFriends(false); // Set loading to false when data is fetched or an error occurs
      }
};


  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const decodedToken = jwt_decode(token);
    const userId = decodedToken.userId;
    setUserId(userId);

    try {
      const response = await axios.get(
        `https://chatterbox-backend-asgm.onrender.com/user/${userId}`
      );
      if (response.status === 200) {
        setName(response.data.name);
        setEmail(response.data.email);
        setImage(response.data.image);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserFriends();
  }, []);

  const handleUpdateProfile = async () => {
    const updatedUser = {
      name: name,
      email: email,
      image: image,
    };

    axios
      .put(`https://chatterbox-backend-asgm.onrender.com/update-profile/${userId}`, updatedUser)
      .then((response) => {
        Alert.alert(
          "Profile Updated!",
          "Your profile has been updated successfully.",
          [{ text: "OK" }]
        );
        setIsEditing(false);
      })
      .catch((err) => {
        console.log("Profile Update failed", err);
        Alert.alert(
          "Error",
          "Could not update profile. Please try again later.",
          [{ text: "OK" }]
        );
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Pressable onPress={handleImageUpload} style={styles.imageContainer}>
          <Image
            source={{
              uri: image || "https://freesvg.org/img/abstract-user-flat-4.png",
            }}
            style={styles.profileImage}
          />
          {isEditing ? ( // Conditionally render the "Edit" text
            <Text style={styles.editImageText}>Edit</Text>
          ) : null}
        </Pressable>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={isEditing} // Enable editing only when isEditing is true
            placeholderTextColor="#666" // Slightly lighter placeholder text
          />

          <Text style={styles.label}>Email:</Text>
          <Text
            style={{
              fontSize: 17,
              padding: 10,
              color: "white",
              fontWeight: "bold",
            }}
          >
            {email}
          </Text>
          
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <Pressable
              onPress={handleUpdateProfile}
              style={[styles.button, styles.updateButton]}
            >
              <Text style={styles.buttonText}>Update Profile</Text>
            </Pressable>
          ) : (
            <View style = {styles.flexButton}>
            <Pressable
              onPress={() => setIsEditing(true)}
              style={[styles.button, styles.editButton]}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={[styles.button,styles.editButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
           </Pressable>
            </View>
          )}
          
        </View>
        </View>
        <View >
        <FriendList friends={friends} />
        </View>
        </ScrollView>
       
      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEEEEE",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical:10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#4A57A2", // Border color
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0,
      height: 1.5,
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 2.84, // Shadow blur radius
    elevation: 3,
  },
  editImageText: {
    marginTop: 5,
    fontSize: 14,
    color: "#007bff", // Blue text for "Edit"
  },
  inputContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 20,
    justifyContent: "space-between",
    backgroundColor: "#A78295",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0,
      height: 1.5,
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 2.84, // Shadow blur radius
    elevation: 3, // Elevation for Android
  },
  label: {
    fontSize: 16,
    marginBottom: 0,
    color: "#fff",
  },
  input: {
    borderWidth: 0,
    borderColor: "#444", // Darker border
    borderRadius: 8,
    padding: 10,
    fontSize: 17,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#1B1A55", // Blue
  },
  updateButton: {
    backgroundColor: "#E19898", // Green
  },
  flexButton:{
    flexDirection: "row",
    gap: 10,
  },
  logoutButton: {
    backgroundColor: "#662549", // Red or a suitable color for a logout button
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center", // Center the button
},
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  friendsSection: {
    marginTop: 20, // Add spacing from the profile section
},
sectionTitle: {
    fontSize: 20,
    fontWeight: "500", // Medium weight
    color: "#fff", // White text
    marginBottom: 10,

},
friendsListContent: {
    paddingBottom: 20,  // Add padding at the bottom
},
friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1, 
    borderBottomColor: "#333", // Subtle divider
},
friendImage: {
    width: 40, 
    height: 40,
    borderRadius: 20, 
    marginRight: 15,
},
friendName: {
    fontSize: 16,
    color: "#ddd", // Slightly lighter gray for text
},
});

export default ProfileScreen;
