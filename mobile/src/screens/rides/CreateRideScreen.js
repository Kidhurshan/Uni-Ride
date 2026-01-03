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
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import LocationService from '../../services/location';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import DateTimePicker from '../../components/common/DateTimePicker';
import { colors, spacing, fontSize } from '../../utils/theme';

const CreateRideScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(null);
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

  const getCurrentLocation = async (field) => {
    setGettingLocation(field);
    try {
      const result = await LocationService.getCurrentAddress();
      if (result.address) {
        updateField(field, result.address);
      } else {
        Alert.alert('Error', 'Could not get address for your location');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enable location services.');
    } finally {
      setGettingLocation(null);
    }
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
      Alert.alert('Error', 'Please select the departure date');
      return false;
    }
    if (!formData.departureTime) {
      Alert.alert('Error', 'Please select the departure time');
      return false;
    }
    if (!formData.pricePerSeat || parseFloat(formData.pricePerSeat) <= 0) {
      Alert.alert('Error', 'Please enter a valid price per seat');
      return false;
    }

    // Check if date is in the future
    const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
    if (departureDateTime <= new Date()) {
      Alert.alert('Error', 'Departure date and time must be in the future');
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

  const LocationInput = ({ label, field, placeholder, icon }) => (
    <View style={styles.locationInputContainer}>
      <View style={styles.locationInputWrapper}>
        <Input
          label={label}
          value={formData[field]}
          onChangeText={(v) => updateField(field, v)}
          placeholder={placeholder}
          leftIcon={icon}
          style={styles.locationInput}
        />
      </View>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => getCurrentLocation(field)}
        disabled={gettingLocation !== null}
      >
        {gettingLocation === field ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={22} color={colors.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

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
          <LocationInput
            label="Pickup Location"
            field="originAddress"
            placeholder="Enter pickup address"
            icon="location-outline"
          />
          <LocationInput
            label="Destination"
            field="destinationAddress"
            placeholder="Enter destination address"
            icon="navigate-outline"
          />
        </Card>

        {/* Date & Time Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <DateTimePicker
                label="Date"
                value={formData.departureDate}
                onChange={(v) => updateField('departureDate', v)}
                mode="date"
                placeholder="Select date"
              />
            </View>
            <View style={styles.halfInput}>
              <DateTimePicker
                label="Time"
                value={formData.departureTime}
                onChange={(v) => updateField('departureTime', v)}
                mode="time"
                placeholder="Select time"
              />
            </View>
          </View>
        </Card>

        {/* Seats & Price Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Seats & Price</Text>

          <Text style={styles.inputLabel}>Available Seats</Text>
          <View style={styles.seatsSelector}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.seatButton,
                  formData.totalSeats === num.toString() && styles.seatButtonActive
                ]}
                onPress={() => updateField('totalSeats', num.toString())}
              >
                <Text style={[
                  styles.seatButtonText,
                  formData.totalSeats === num.toString() && styles.seatButtonTextActive
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Price per Seat ($)"
            value={formData.pricePerSeat}
            onChangeText={(v) => updateField('pricePerSeat', v)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
          />
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

          <Text style={[styles.inputLabel, { marginTop: spacing.md }]}>Luggage Size</Text>
          <View style={styles.luggageSelector}>
            {['none', 'small', 'medium', 'large'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.luggageButton,
                  preferences.luggage === size && styles.luggageButtonActive
                ]}
                onPress={() => setPreferences(p => ({ ...p, luggage: size }))}
              >
                <Text style={[
                  styles.luggageButtonText,
                  preferences.luggage === size && styles.luggageButtonTextActive
                ]}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
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
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationInputWrapper: {
    flex: 1,
  },
  locationInput: {
    marginBottom: spacing.sm,
  },
  locationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginLeft: spacing.xs,
  },
  seatsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  seatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  seatButtonActive: {
    backgroundColor: colors.primary,
  },
  seatButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  seatButtonTextActive: {
    color: '#fff',
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
  luggageSelector: {
    flexDirection: 'row',
  },
  luggageButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    marginRight: spacing.xs,
    borderRadius: 8,
  },
  luggageButtonActive: {
    backgroundColor: colors.primary,
  },
  luggageButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  luggageButtonTextActive: {
    color: '#fff',
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
