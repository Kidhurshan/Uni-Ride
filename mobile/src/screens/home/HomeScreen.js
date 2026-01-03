import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { colors, spacing, fontSize, shadows } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      const response = await api.get('/rides', {
        params: { limit: 10 }
      });
      setRides(response.data.rides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  }, []);

  const RideCard = ({ ride }) => (
    <Card
      style={styles.rideCard}
      onPress={() => navigation.navigate('RideDetails', { rideId: ride._id })}
    >
      <View style={styles.rideHeader}>
        <View style={styles.driverInfo}>
          <Avatar
            source={ride.driver?.profileImage}
            firstName={ride.driver?.firstName}
            lastName={ride.driver?.lastName}
            size="sm"
          />
          <View style={styles.driverText}>
            <Text style={styles.driverName}>
              {ride.driver?.firstName} {ride.driver?.lastName}
            </Text>
            {ride.driver?.driverInfo?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.price}>{formatPrice(ride.pricePerSeat)}</Text>
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

      <View style={styles.rideFooter}>
        <View style={styles.rideDetail}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.rideDetailText}>{formatDate(ride.departureDate)}</Text>
        </View>
        <View style={styles.rideDetail}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.rideDetailText}>{formatTime(ride.departureTime)}</Text>
        </View>
        <View style={styles.rideDetail}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.rideDetailText}>{ride.availableSeats} seats</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
          <Text style={styles.subGreeting}>Where are you heading?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Avatar
            source={user?.profileImage}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="md"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('SearchRides')}
      >
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.searchText}>Search for a ride...</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Rides', { screen: 'CreateRide' })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Post Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('SearchRides')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="search-outline" size={24} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Find Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Bookings')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="ticket-outline" size={24} color={colors.warning} />
          </View>
          <Text style={styles.quickActionText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Messages')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.info} />
          </View>
          <Text style={styles.quickActionText}>Messages</Text>
        </TouchableOpacity>
      </View>

      {/* Available Rides */}
      <View style={styles.ridesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Rides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SearchRides')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {rides.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="car-outline" size={48} color={colors.disabled} />
            <Text style={styles.emptyText}>No rides available</Text>
            <Text style={styles.emptySubtext}>Check back later or post your own ride</Text>
          </Card>
        ) : (
          rides.map((ride) => <RideCard key={ride._id} ride={ride} />)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subGreeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    ...shadows.sm,
  },
  searchText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.placeholder,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ridesSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverText: {
    marginLeft: spacing.sm,
  },
  driverName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginLeft: 2,
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
  rideFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rideDetailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default HomeScreen;
