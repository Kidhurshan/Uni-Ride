import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Rating from '../../components/common/Rating';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const RideDetailsScreen = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await api.get(`/rides/${rideId}`);
      setRide(response.data.ride);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setBooking(true);
    try {
      await api.post('/bookings', {
        rideId: ride._id,
        seatsBooked: seats,
      });
      Alert.alert(
        'Success',
        'Booking request sent! The driver will review your request.',
        [{ text: 'OK', onPress: () => navigation.navigate('Bookings') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book ride');
    } finally {
      setBooking(false);
    }
  };

  const handleMessage = async () => {
    try {
      const response = await api.post('/messages/conversation', {
        participantId: ride.driver._id,
        rideId: ride._id,
      });
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: response.data.conversation._id,
          name: `${ride.driver.firstName} ${ride.driver.lastName}`,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  const isOwnRide = ride.driver._id === user?.id;

  return (
    <ScrollView style={styles.container}>
      {/* Route Card */}
      <Card style={styles.card}>
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={[styles.dot, styles.dotOrigin]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeText}>{ride.origin?.address}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.dot, styles.dotDestination]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeText}>{ride.destination?.address}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Details Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Trip Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(ride.departureDate)}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formatTime(ride.departureTime)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={24} color={colors.secondary} />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Available Seats</Text>
              <Text style={styles.detailValue}>{ride.availableSeats} / {ride.totalSeats}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={24} color={colors.secondary} />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Price/Seat</Text>
              <Text style={styles.detailValue}>{formatPrice(ride.pricePerSeat)}</Text>
            </View>
          </View>
        </View>

        {ride.vehicleInfo && (
          <View style={styles.vehicleInfo}>
            <Ionicons name="car-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.vehicleText}>{ride.vehicleInfo}</Text>
          </View>
        )}
      </Card>

      {/* Preferences Card */}
      {ride.preferences && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferences}>
            <Badge
              text={ride.preferences.smoking ? 'Smoking OK' : 'No Smoking'}
              variant={ride.preferences.smoking ? 'warning' : 'default'}
              style={styles.preference}
            />
            <Badge
              text={ride.preferences.pets ? 'Pets OK' : 'No Pets'}
              variant={ride.preferences.pets ? 'info' : 'default'}
              style={styles.preference}
            />
            <Badge
              text={ride.preferences.music ? 'Music OK' : 'No Music'}
              variant={ride.preferences.music ? 'success' : 'default'}
              style={styles.preference}
            />
            <Badge
              text={`Luggage: ${ride.preferences.luggage || 'Medium'}`}
              variant="default"
              style={styles.preference}
            />
          </View>
        </Card>
      )}

      {/* Description */}
      {ride.description && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Info</Text>
          <Text style={styles.description}>{ride.description}</Text>
        </Card>
      )}

      {/* Driver Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Driver</Text>
        <View style={styles.driverContainer}>
          <Avatar
            source={ride.driver?.profileImage}
            firstName={ride.driver?.firstName}
            lastName={ride.driver?.lastName}
            size="lg"
          />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {ride.driver?.firstName} {ride.driver?.lastName}
            </Text>
            <Text style={styles.driverUniversity}>{ride.driver?.university}</Text>
            <Rating
              value={ride.driver?.rating?.average || 0}
              showValue
              count={ride.driver?.rating?.count}
              size={16}
            />
          </View>
        </View>

        {!isOwnRide && (
          <Button
            title="Message Driver"
            onPress={handleMessage}
            variant="outline"
            style={styles.messageButton}
            icon={<Ionicons name="chatbubble-outline" size={18} color={colors.primary} />}
          />
        )}
      </Card>

      {/* Booking Section */}
      {!isOwnRide && ride.availableSeats > 0 && ride.status === 'scheduled' && (
        <Card style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Book this ride</Text>
            <View style={styles.seatsSelector}>
              <Button
                title="-"
                onPress={() => setSeats(Math.max(1, seats - 1))}
                variant="outline"
                size="sm"
                disabled={seats <= 1}
              />
              <Text style={styles.seatsCount}>{seats}</Text>
              <Button
                title="+"
                onPress={() => setSeats(Math.min(ride.availableSeats, seats + 1))}
                variant="outline"
                size="sm"
                disabled={seats >= ride.availableSeats}
              />
            </View>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>
              {formatPrice(ride.pricePerSeat * seats)}
            </Text>
          </View>

          <Button
            title="Request to Book"
            onPress={handleBooking}
            loading={booking}
            size="lg"
          />
        </Card>
      )}

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
  card: {
    margin: spacing.md,
    marginBottom: 0,
  },
  routeContainer: {
    padding: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  dotOrigin: {
    backgroundColor: colors.secondary,
  },
  dotDestination: {
    backgroundColor: colors.error,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  routeLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  routeText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  vehicleText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  preferences: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preference: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  driverName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  driverUniversity: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  messageButton: {
    marginTop: spacing.md,
  },
  bookingCard: {
    margin: spacing.md,
    backgroundColor: colors.primary + '10',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookingTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  seatsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsCount: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginHorizontal: spacing.md,
    color: colors.primary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  totalPrice: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

export default RideDetailsScreen;
