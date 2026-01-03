import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const RideBookingsScreen = ({ route, navigation }) => {
  const { rideId, ride } = route.params;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [rideId]);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/ride/${rideId}`);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/confirm`);
      Alert.alert('Success', 'Booking confirmed!');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    Alert.alert(
      'Reject Booking',
      'Are you sure you want to reject this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(bookingId);
            try {
              await api.put(`/bookings/${bookingId}/reject`);
              Alert.alert('Done', 'Booking rejected');
              fetchBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject booking');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleComplete = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/complete`);
      Alert.alert('Success', 'Ride marked as complete!');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      rejected: 'error',
      cancelled: 'error',
      completed: 'info',
    };
    return variants[status] || 'default';
  };

  const BookingItem = ({ booking }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.riderInfo}>
          <Avatar
            source={booking.rider?.profileImage}
            firstName={booking.rider?.firstName}
            lastName={booking.rider?.lastName}
            size="md"
          />
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>
              {booking.rider?.firstName} {booking.rider?.lastName}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>
                {booking.rider?.rating?.average?.toFixed(1) || 'New'}
              </Text>
            </View>
          </View>
        </View>
        <Badge text={booking.status} variant={getStatusBadge(booking.status)} />
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.seatsBooked} seat(s)</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatPrice(booking.totalPrice)}</Text>
        </View>
      </View>

      {booking.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{booking.notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      {booking.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            title="Reject"
            onPress={() => handleReject(booking._id)}
            variant="outline"
            style={styles.actionButton}
            loading={actionLoading === booking._id}
          />
          <Button
            title="Confirm"
            onPress={() => handleConfirm(booking._id)}
            style={styles.actionButton}
            loading={actionLoading === booking._id}
          />
        </View>
      )}

      {booking.status === 'confirmed' && (
        <View style={styles.actions}>
          <Button
            title="Message Rider"
            onPress={() => {
              navigation.navigate('Messages', {
                screen: 'Chat',
                params: {
                  participantId: booking.rider._id,
                  name: `${booking.rider.firstName} ${booking.rider.lastName}`,
                },
              });
            }}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Complete Ride"
            onPress={() => handleComplete(booking._id)}
            style={styles.actionButton}
            loading={actionLoading === booking._id}
          />
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ride Summary */}
      {ride && (
        <Card style={styles.rideCard}>
          <View style={styles.routeSummary}>
            <Text style={styles.routeFrom} numberOfLines={1}>
              {ride.origin?.address?.split(',')[0]}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
            <Text style={styles.routeTo} numberOfLines={1}>
              {ride.destination?.address?.split(',')[0]}
            </Text>
          </View>
          <View style={styles.rideMeta}>
            <Text style={styles.rideMetaText}>
              {formatDate(ride.departureDate)} at {formatTime(ride.departureTime)}
            </Text>
            <Text style={styles.seatsText}>
              {ride.availableSeats}/{ride.totalSeats} seats available
            </Text>
          </View>
        </Card>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          icon="ticket-outline"
          title="No bookings yet"
          message="Booking requests will appear here"
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BookingItem booking={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
  rideCard: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: colors.primary + '10',
  },
  routeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routeFrom: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  routeTo: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
  },
  rideMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rideMetaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  seatsText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
  },
  listContent: {
    padding: spacing.md,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riderDetails: {
    marginLeft: spacing.sm,
  },
  riderName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  bookingDetails: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  detailText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  notesContainer: {
    padding: spacing.sm,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  notesLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default RideBookingsScreen;
