import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../../config/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { colors, spacing, fontSize } from '../../utils/theme';

const EditRideScreen = ({ route, navigation }) => {
  const { rideId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    originAddress: '',
    destinationAddress: '',
    departureDate: '',
    departureTime: '',
    totalSeats: '',
    pricePerSeat: '',
    description: '',
  });

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await api.get(`/rides/${rideId}`);
      const ride = response.data.ride;
      setFormData({
        originAddress: ride.origin?.address || '',
        destinationAddress: ride.destination?.address || '',
        departureDate: ride.departureDate?.split('T')[0] || '',
        departureTime: ride.departureTime || '',
        totalSeats: ride.totalSeats?.toString() || '',
        pricePerSeat: ride.pricePerSeat?.toString() || '',
        description: ride.description || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load ride details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.originAddress || !formData.destinationAddress) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/rides/${rideId}`, {
        origin: { address: formData.originAddress },
        destination: { address: formData.destinationAddress },
        departureDate: new Date(formData.departureDate).toISOString(),
        departureTime: formData.departureTime,
        totalSeats: parseInt(formData.totalSeats),
        pricePerSeat: parseFloat(formData.pricePerSeat),
        description: formData.description,
      });
      Alert.alert('Success', 'Ride updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update ride');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Seats & Price</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Total Seats"
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

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Info</Text>
        <Input
          value={formData.description}
          onChangeText={(v) => updateField('description', v)}
          placeholder="Any additional details..."
          multiline
          numberOfLines={4}
        />
      </Card>

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={saving}
        size="lg"
        style={styles.saveButton}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    margin: spacing.md,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

export default EditRideScreen;
