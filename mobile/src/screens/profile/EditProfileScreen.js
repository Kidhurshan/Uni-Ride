import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import { colors, spacing, fontSize } from '../../utils/theme';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    university: user?.university || '',
    studentId: user?.studentId || '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setLoading(true);
    const result = await updateUser(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // TODO: Upload image to server and update profileImage
      Alert.alert('Info', 'Image upload will be implemented with cloud storage');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Image */}
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={pickImage}>
          <Avatar
            source={user?.profileImage}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="xl"
          />
          <View style={styles.editImageButton}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Tap to change photo</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(v) => updateField('firstName', v)}
              placeholder="John"
              autoCapitalize="words"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(v) => updateField('lastName', v)}
              placeholder="Doe"
              autoCapitalize="words"
            />
          </View>
        </View>

        <Input
          label="Email"
          value={user?.email}
          editable={false}
          leftIcon="mail-outline"
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(v) => updateField('phone', v)}
          placeholder="+1 234 567 8900"
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />

        <Input
          label="University"
          value={formData.university}
          onChangeText={(v) => updateField('university', v)}
          placeholder="Enter your university"
          autoCapitalize="words"
          leftIcon="school-outline"
        />

        <Input
          label="Student ID (Optional)"
          value={formData.studentId}
          onChangeText={(v) => updateField('studentId', v)}
          placeholder="Enter your student ID"
          leftIcon="card-outline"
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
          size="lg"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  changePhotoText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  form: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

export default EditProfileScreen;
