import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { colors, spacing, fontSize } from '../../utils/theme';

const DriverInfoScreen = ({ navigation }) => {
  const { user, updateDriverInfo } = useAuth();
  const [formData, setFormData] = useState({
    licenseNumber: user?.driverInfo?.licenseNumber || '',
    vehicleType: user?.driverInfo?.vehicleType || '',
    vehicleMake: user?.driverInfo?.vehicleMake || '',
    vehicleModel: user?.driverInfo?.vehicleModel || '',
    vehicleYear: user?.driverInfo?.vehicleYear || '',
    vehicleColor: user?.driverInfo?.vehicleColor || '',
    licensePlate: user?.driverInfo?.licensePlate || '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.licenseNumber || !formData.vehicleMake || !formData.vehicleModel || !formData.licensePlate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await updateDriverInfo(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Driver information updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const isDriver = user?.role === 'driver' || user?.role === 'both';

  return (
    <ScrollView style={styles.container}>
      {/* Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons
            name={isDriver ? 'checkmark-circle' : 'car-sport'}
            size={48}
            color={isDriver ? colors.secondary : colors.primary}
          />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {isDriver ? 'Driver Account Active' : 'Become a Driver'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isDriver
                ? 'You can post rides and earn money'
                : 'Fill in your details to start driving'}
            </Text>
          </View>
        </View>
        {user?.driverInfo?.isVerified && (
          <Badge text="Verified" variant="success" style={styles.verifiedBadge} />
        )}
      </Card>

      {/* Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Driver's License</Text>
        <Card style={styles.formCard}>
          <Input
            label="License Number *"
            value={formData.licenseNumber}
            onChangeText={(v) => updateField('licenseNumber', v)}
            placeholder="Enter your license number"
            autoCapitalize="characters"
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <Card style={styles.formCard}>
          <Input
            label="Vehicle Type"
            value={formData.vehicleType}
            onChangeText={(v) => updateField('vehicleType', v)}
            placeholder="e.g., Sedan, SUV, Hatchback"
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Make *"
                value={formData.vehicleMake}
                onChangeText={(v) => updateField('vehicleMake', v)}
                placeholder="e.g., Toyota"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Model *"
                value={formData.vehicleModel}
                onChangeText={(v) => updateField('vehicleModel', v)}
                placeholder="e.g., Camry"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Year"
                value={formData.vehicleYear}
                onChangeText={(v) => updateField('vehicleYear', v)}
                placeholder="e.g., 2020"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Color"
                value={formData.vehicleColor}
                onChangeText={(v) => updateField('vehicleColor', v)}
                placeholder="e.g., Silver"
                autoCapitalize="words"
              />
            </View>
          </View>

          <Input
            label="License Plate *"
            value={formData.licensePlate}
            onChangeText={(v) => updateField('licensePlate', v)}
            placeholder="Enter license plate"
            autoCapitalize="characters"
          />
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isDriver ? 'Update Information' : 'Register as Driver'}
          onPress={handleSave}
          loading={loading}
          size="lg"
        />
      </View>

      <Text style={styles.disclaimer}>
        * Required fields. Your information will be verified before you can start driving.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusCard: {
    margin: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  statusSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  section: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
  },
  formCard: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  disclaimer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

export default DriverInfoScreen;
