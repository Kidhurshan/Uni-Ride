import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get('/bookings/my-bookings', { params });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [filter]);

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

  const FilterButton = ({ value, label }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const BookingItem = ({ booking }) => (
    <Card
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetails', { bookingId: booking._id })}
    >
      <View style={styles.bookingHeader}>
        <Badge text={booking.status} variant={getStatusBadge(booking.status)} />
        <Text style={styles.price}>{formatPrice(booking.totalPrice)}</Text>
      </View>

      {booking.ride && (
        <>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.dot, styles.dotOrigin]} />
              <Text style={styles.routeText} numberOfLines={1}>
                {booking.ride.origin?.address}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.dot, styles.dotDestination]} />
              <Text style={styles.routeText} numberOfLines={1}>
                {booking.ride.destination?.address}
              </Text>
            </View>
          </View>

          <View style={styles.rideDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{formatDate(booking.ride.departureDate)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{formatTime(booking.ride.departureTime)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{booking.seatsBooked} seat(s)</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.driverRow}>
        <Avatar
          source={booking.driver?.profileImage}
          firstName={booking.driver?.firstName}
          lastName={booking.driver?.lastName}
          size="sm"
        />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>
            {booking.driver?.firstName} {booking.driver?.lastName}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.ratingText}>
              {booking.driver?.rating?.average?.toFixed(1) || 'New'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
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
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton value="all" label="All" />
        <FilterButton value="pending" label="Pending" />
        <FilterButton value="confirmed" label="Confirmed" />
        <FilterButton value="completed" label="Completed" />
      </View>

      {bookings.length === 0 ? (
        <EmptyState
          icon="ticket-outline"
          title="No bookings yet"
          message="Book a ride and it will appear here"
          actionLabel="Find a Ride"
          onAction={() => navigation.navigate('Home', { screen: 'SearchRides' })}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BookingItem booking={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  filtersContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.borderLight,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
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
  price: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  dotOrigin: {
    backgroundColor: colors.secondary,
  },
  dotDestination: {
    backgroundColor: colors.error,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  rideDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailText: {
    marginLeft: 4,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  driverName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: 2,
  },
});

export default MyBookingsScreen;
