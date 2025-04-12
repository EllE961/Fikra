import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { useUserProfile } from "../../hooks/useUserProfile";
import { storage } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";
import defaultAvatar from "../../assets/images/defaultAvatar.png";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { updateProfile } = useUserProfile();
  const { colors } = useTheme();
  const userProfile = route.params?.userProfile;

  const [username, setUsername] = useState(userProfile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || "");
  const [newImage, setNewImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === "web") return;
      
      try {
        // Check gallery permissions
        const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setGalleryPermission(galleryStatus === "granted");
        
        // Check camera permissions
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        setCameraPermission(cameraStatus === "granted");
        console.log("Initial camera permission:", cameraStatus);
      } catch (error) {
        console.error("Error during permission checks:", error);
        setCameraPermission(false);
      }
    };
    
    checkPermissions();
  }, []);

  const requestCameraPermission = async () => {
    console.log("Requesting camera permission...");
    
    if (Platform.OS === "web") {
      console.log("Camera permissions not applicable on web");
      return false;
    }
    
    try {
      // First check current permission status
      const { status: currentStatus } = await ImagePicker.getCameraPermissionsAsync();
      console.log("Current camera permission status:", currentStatus);
      
      if (currentStatus === "granted") {
        console.log("Camera permission already granted");
        setCameraPermission(true);
        return true;
      }
      
      // Request permissions
      console.log("Actively requesting camera permission...");
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log("Camera permission request result:", status);
      
      // Update state
      const granted = status === "granted";
      setCameraPermission(granted);
      
      // Log result
      if (granted) {
        console.log("Camera permission successfully granted");
      } else {
        console.warn("Camera permission denied by user");
      }
      
      return granted;
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  };

  const handleChooseImage = async () => {
    // For web platform, we'll use a different approach
    if (Platform.OS === "web") {
      // Trigger the hidden file input
      fileInputRef.current.click();
      return;
    }
    
    try {
      Alert.alert(
        "Change Profile Picture",
        "Choose a source for your profile picture",
        [
          {
            text: "Take Photo",
            onPress: async () => {
              console.log("Take Photo pressed");
              console.log("Current camera permission:", cameraPermission);
              
              if (!cameraPermission) {
                console.log("Requesting camera permission...");
                const granted = await requestCameraPermission();
                console.log("Permission request result:", granted);
                if (!granted) {
                  Alert.alert(
                    "Camera Permission Required",
                    "To take photos, you need to allow camera access in settings.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Open Settings", 
                        onPress: () => {
                          if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                          } else {
                            Linking.openSettings();
                          }
                        } 
                      }
                    ]
                  );
                  return;
                }
              }
              
              if (cameraPermission) {
                try {
                  console.log("Trying primary camera method...");
                  
                  // Try the primary method first (ImagePicker)
                  try {
                    console.log("Using ImagePicker.launchCameraAsync...");
                    const result = await ImagePicker.launchCameraAsync({
                      mediaTypes: ImagePicker.MediaType ? ImagePicker.MediaType.Images : 'images',
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.7,
                    });
                    
                    console.log("Camera result:", JSON.stringify(result));
                    
                    if (!result.canceled && result.assets?.[0]?.uri) {
                      console.log("Image selected:", result.assets[0].uri);
                      setNewImage(result.assets[0].uri);
                      setAvatarUrl(result.assets[0].uri);
                      return; // Success, exit early
                    } else if (result.canceled) {
                      console.log("Camera was canceled by user");
                      return;
                    }
                  } catch (error) {
                    console.error("Error with primary camera method:", error);
                    // Continue to fallback method
                  }
                  
                  // Fallback: Try using the device's native camera app
                  console.log("Trying fallback camera method (native camera app)...");
                  
                  if (Platform.OS === 'android') {
                    try {
                      const tempPhotoUri = FileSystem.documentDirectory + "temp_photo.jpg";
                      
                      // Launch the native camera app
                      await IntentLauncher.startActivityAsync('android.media.action.IMAGE_CAPTURE', {
                        output: tempPhotoUri,
                      });
                      
                      // Check if the file exists after camera is closed
                      const fileInfo = await FileSystem.getInfoAsync(tempPhotoUri);
                      
                      if (fileInfo.exists) {
                        console.log("Image captured with native camera:", tempPhotoUri);
                        setNewImage(tempPhotoUri);
                        setAvatarUrl(tempPhotoUri);
                      } else {
                        console.warn("No image returned from native camera");
                      }
                    } catch (error) {
                      console.error("Error using native camera app:", error);
                      Alert.alert(
                        "Camera Error",
                        "Failed to use native camera. Please try gallery option instead."
                      );
                    }
                  } else if (Platform.OS === 'ios') {
                    // For iOS, we'll just show an alert as direct camera launch is more complex
                    Alert.alert(
                      "Camera Issue",
                      "The camera couldn't be launched. Would you like to select from gallery instead?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Open Gallery", 
                          onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                              mediaTypes: ImagePicker.MediaType ? ImagePicker.MediaType.Images : 'images',
                              allowsEditing: true,
                              aspect: [1, 1],
                              quality: 0.7,
                            });
                            if (!result.canceled && result.assets?.[0]?.uri) {
                              setNewImage(result.assets[0].uri);
                              setAvatarUrl(result.assets[0].uri);
                            }
                          }
                        }
                      ]
                    );
                  }
                } catch (error) {
                  console.error("Camera fallback error:", error);
                  Alert.alert(
                    "Camera Error",
                    "There was an error using the camera. Please try selecting from gallery instead."
                  );
                }
              } else {
                console.warn("Camera permission is still not granted");
                Alert.alert("Error", "Camera permission is required to take photos.");
              }
            },
          },
          {
            text: "Choose from Gallery",
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType ? ImagePicker.MediaType.Images : 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });
              if (!result.canceled && result.assets?.[0]?.uri) {
                setNewImage(result.assets[0].uri);
                setAvatarUrl(result.assets[0].uri);
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error in image selection:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Handle web file selection
  const handleWebImageChange = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      console.log("Web image selected:", file.name);
      
      // Create a blob URL for the selected file
      const imageUrl = URL.createObjectURL(file);
      setNewImage(imageUrl);
      setAvatarUrl(imageUrl);
      
      // Store the actual file for later upload
      setNewImageFile(file);
    } catch (error) {
      console.error("Error handling web image selection:", error);
      Alert.alert("Error", "Failed to process selected image. Please try again.");
    }
  };

  const uploadImageAsync = async (uri, uid) => {
    try {
      const storageRef = storage.ref().child(`avatars/${uid}`);
      
      if (Platform.OS === "web" && newImageFile) {
        // For web, upload the file directly
        await storageRef.put(newImageFile);
      } else {
        // For mobile, use the existing blob upload method
        const response = await fetch(uri);
        const blob = await response.blob();
        await storageRef.put(blob);
      }
      
      // Get download URL
      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile?.uid) {
      Alert.alert("Error", "No valid user profile found.");
      return;
    }

    try {
      setUploading(true);
      let finalAvatarUrl = avatarUrl;

      if (newImage) {
        if (userProfile.avatarUrl && userProfile.avatarUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const oldImageRef = storage.refFromURL(userProfile.avatarUrl);
            await oldImageRef.delete();
            console.log('Old profile image deleted successfully');
          } catch (deleteErr) {
            console.error('Error deleting old image:', deleteErr);
          }
        }

        finalAvatarUrl = await uploadImageAsync(newImage, userProfile.uid);
      }

      await updateProfile({
        username,
        avatarUrl: finalAvatarUrl,
      });

      Alert.alert("Success", "Profile updated");
      navigation.goBack();
    } catch (err) {
      console.error("Update Profile Error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.error || "red", marginBottom: 16 }}>
          No user profile was passed. Cannot edit.
        </Text>
      </View>
    );
  }

  const avatarSource = avatarUrl ? { uri: avatarUrl } : defaultAvatar;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Add hidden file input for web */}
      {Platform.OS === "web" && (
        <input
          type="file"
          accept="image/*"
          onChange={handleWebImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      )}
      
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleChooseImage}
      >
        <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
        <View
          style={[styles.editIconOverlay, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Your display name..."
          placeholderTextColor={colors.text}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {uploading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveProfile}
        >
          <Text style={[styles.saveButtonText, { color: colors.text }]}>
            SAVE PROFILE
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "visible",
    marginBottom: 30,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editIconOverlay: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fieldContainer: {
    width: "90%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    width: "90%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
