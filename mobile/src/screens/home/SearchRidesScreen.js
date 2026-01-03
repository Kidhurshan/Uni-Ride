import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const SearchRidesScreen = ({ navigation }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchRides = async () => {
    setLoading(true);
    setSearched(true);

    try {
      const params = {};
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (date) params.date = date;

      const response = await api.get('/rides', { params });
      setRides(response.data.rides);
    } catch (error) {
      console.error('Error searching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setSearched(false);
    setRides([]);
  };

  const RideItem = ({ ride }) => (
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
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>
                {ride.driver?.rating?.average?.toFixed(1) || 'New'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(ride.pricePerSeat)}</Text>
          <Text style={styles.perSeat}>per seat</Text>
        </View>
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
          <Ionicons name="people-outline" size={16} color={colors.secondary} />
          <Text style={[styles.rideDetailText, { color: colors.secondary }]}>
            {ride.availableSeats} left
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="From (origin)"
          value={origin}
          onChangeText={setOrigin}
          leftIcon="location-outline"
          style={styles.input}
        />
        <Input
          placeholder="To (destination)"
          value={destination}
          onChangeText={setDestination}
          leftIcon="navigate-outline"
          style={styles.input}
        />
        <Input
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          leftIcon="calendar-outline"
          style={styles.input}
        />
        <View style={styles.buttonRow}>
          <Button
            title="Search"
            onPress={searchRides}
            loading={loading}
            style={styles.searchButton}
            icon={<Ionicons name="search" size={18} color="#fff" />}
          />
          {searched && (
            <Button
              title="Clear"
              onPress={clearFilters}
              variant="outline"
              style={styles.clearButton}
            />
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searched && rides.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title="No rides found"
          message="Try adjusting your search criteria"
        />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <RideItem ride={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  searchContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  searchButton: {
    flex: 1,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  perSeat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
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
});

export default SearchRidesScreen;
