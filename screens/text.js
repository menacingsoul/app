<View style={styles.inputContainer}>
        <Feather
          onPress={handleEmojiPress}
          style={styles.icon}
          name="smile"
          size={24}
          color="black"
        />
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={styles.input}
          placeholder="Type a message"
        />
        <Entypo
          onPress={pickImage}
          style={styles.icon}
          name="attachment"
          size={20}
          color="black"
        />
        <Ionicons
          onPress={() => handleSend("text")}
          style={styles.icon}
          name="send"
          size={20}
          color="black"
        />
      </View>



inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    padding: 10,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 10,
  },