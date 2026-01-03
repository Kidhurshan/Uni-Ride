import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { colors, spacing, fontSize } from '../../utils/theme';

const CreateRideScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    originAddress: '',
    destinationAddress: '',
    departureDate: '',
    departureTime: '',
    totalSeats: '3',
    pricePerSeat: '',
    description: '',
  });
  const [preferences, setPreferences] = useState({
    smoking: false,
    pets: false,
    music: true,
    luggage: 'medium',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!formData.originAddress.trim()) {
      Alert.alert('Error', 'Please enter the pickup location');
      return false;
    }
    if (!formData.destinationAddress.trim()) {
      Alert.alert('Error', 'Please enter the destination');
      return false;
    }
    if (!formData.departureDate) {
      Alert.alert('Error', 'Please enter the departure date (YYYY-MM-DD)');
      return false;
    }
    if (!formData.departureTime) {
      Alert.alert('Error', 'Please enter the departure time (HH:MM)');
      return false;
    }
    if (!formData.pricePerSeat || parseFloat(formData.pricePerSeat) <= 0) {
      Alert.alert('Error', 'Please enter a valid price per seat');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const rideData = {
        origin: { address: formData.originAddress },
        destination: { address: formData.destinationAddress },
        departureDate: new Date(formData.departureDate).toISOString(),
        departureTime: formData.departureTime,
        totalSeats: parseInt(formData.totalSeats),
        pricePerSeat: parseFloat(formData.pricePerSeat),
        description: formData.description,
        preferences,
      };

      await api.post('/rides', rideData);
      Alert.alert('Success', 'Your ride has been posted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a driver
  if (user?.role !== 'driver' && user?.role !== 'both') {
    return (
      <View style={styles.notDriverContainer}>
        <Ionicons name="car-outline" size={64} color={colors.disabled} />
        <Text style={styles.notDriverTitle}>Become a Driver First</Text>
        <Text style={styles.notDriverText}>
          You need to register as a driver before posting rides.
        </Text>
        <Button
          title="Register as Driver"
          onPress={() => navigation.navigate('Profile', { screen: 'DriverInfo' })}
          style={styles.registerButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Route Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <Input
            label="Pickup Location"
            value={formData.originAddress}
            onChangeText={(v) => updateField('originAddress', v)}
            placeholder="Enter pickup address"
            leftIcon="location-outline"
          />
          <Input
            label="Destination"
            value={formData.destinationAddress}
            onChangeText={(v) => updateField('destinationAddress', v)}
            placeholder="Enter destination address"
            leftIcon="navigate-outline"
          />
        </Card>

        {/* Date & Time Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Date"
                value={formData.departureDate}
                onChangeText={(v) => updateField('departureDate', v)}
                placeholder="YYYY-MM-DD"
                leftIcon="calendar-outline"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Time"
                value={formData.departureTime}
                onChangeText={(v) => updateField('departureTime', v)}
                placeholder="HH:MM"
                leftIcon="time-outline"
              />
            </View>
          </View>
        </Card>

        {/* Seats & Price Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Seats & Price</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Available Seats"
                value={formData.totalSeats}
                onChangeText={(v) => updateField('totalSeats', v)}
                placeholder="1-8"
                keyboardType="numeric"
                leftIcon="people-outline"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Price per Seat ($)"
                value={formData.pricePerSeat}
                onChangeText={(v) => updateField('pricePerSeat', v)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                leftIcon="cash-outline"
              />
            </View>
          </View>
        </Card>

        {/* Preferences Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="flame-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.preferenceText}>Smoking Allowed</Text>
            </View>
            <Switch
              value={preferences.smoking}
              onValueChange={(v) => setPreferences(p => ({ ...p, smoking: v }))}
              trackColor={{ false: colors.disabled, true: colors.primary + '60' }}
              thumbColor={preferences.smoking ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="paw-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.preferenceText}>Pets Allowed</Text>
            </View>
            <Switch
              value={preferences.pets}
              onValueChange={(v) => setPreferences(p => ({ ...p, pets: v }))}
              trackColor={{ false: colors.disabled, true: colors.primary + '60' }}
              thumbColor={preferences.pets ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="musical-notes-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.preferenceText}>Music</Text>
            </View>
            <Switch
              value={preferences.music}
              onValueChange={(v) => setPreferences(p => ({ ...p, music: v }))}
              trackColor={{ false: colors.disabled, true: colors.primary + '60' }}
              thumbColor={preferences.music ? colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* Description Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Info (Optional)</Text>
          <Input
            value={formData.description}
            onChangeText={(v) => updateField('description', v)}
            placeholder="Any additional details about your ride..."
            multiline
            numberOfLines={4}
          />
        </Card>

        <Button
          title="Post Ride"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={styles.submitButton}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: spacing.md,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    marginLeft: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  submitButton: {
    margin: spacing.md,
  },
  bottomPadding: {
    height: spacing.xl,
  },
  notDriverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notDriverTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  notDriverText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  registerButton: {
    marginTop: spacing.xl,
  },
});

export default CreateRideScreen;
