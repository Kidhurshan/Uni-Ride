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
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const MyRidesScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchRides = async () => {
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get('/rides/my-rides', { params });
      setRides(response.data.rides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  }, [filter]);

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: 'info',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
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

  const RideItem = ({ ride }) => (
    <Card
      style={styles.rideCard}
      onPress={() => navigation.navigate('RideBookings', { rideId: ride._id, ride })}
    >
      <View style={styles.rideHeader}>
        <Badge text={ride.status} variant={getStatusBadge(ride.status)} />
        <Text style={styles.price}>{formatPrice(ride.pricePerSeat)}/seat</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, styles.dotOrigin]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {ride.origin?.address}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, styles.dotDestination]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {ride.destination?.address}
          </Text>
        </View>
      </View>

      <View style={styles.rideDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(ride.departureDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatTime(ride.departureTime)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color={colors.secondary} />
          <Text style={[styles.detailText, { color: colors.secondary }]}>
            {ride.availableSeats}/{ride.totalSeats} seats
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewBookingsButton}
        onPress={() => navigation.navigate('RideBookings', { rideId: ride._id, ride })}
      >
        <Text style={styles.viewBookingsText}>View Bookings</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
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
        <FilterButton value="scheduled" label="Scheduled" />
        <FilterButton value="completed" label="Completed" />
        <FilterButton value="cancelled" label="Cancelled" />
      </View>

      {rides.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title="No rides yet"
          message="Post your first ride and start earning"
          actionLabel="Post a Ride"
          onAction={() => navigation.navigate('CreateRide')}
        />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <RideItem ride={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateRide')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 100,
  },
  rideCard: {
    marginBottom: spacing.md,
  },
  rideHeader: {
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
    marginBottom: spacing.xs,
  },
  detailText: {
    marginLeft: 4,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  viewBookingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  viewBookingsText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MyRidesScreen;
