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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Rating from '../../components/common/Rating';
import Input from '../../components/common/Input';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.put(`/bookings/${bookingId}/cancel`);
              Alert.alert('Success', 'Booking cancelled');
              fetchBookingDetails();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitReview = async () => {
    if (!review.rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        bookingId,
        rating: review.rating,
        comment: review.comment,
      });
      Alert.alert('Success', 'Review submitted!');
      setShowReview(false);
      fetchBookingDetails();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMessage = async () => {
    try {
      const response = await api.post('/messages/conversation', {
        participantId: booking.driver._id,
        rideId: booking.ride._id,
      });
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: response.data.conversation._id,
          name: `${booking.driver.firstName} ${booking.driver.lastName}`,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Badge
            text={booking.status.toUpperCase()}
            variant={getStatusBadge(booking.status)}
            size="lg"
          />
          <Text style={styles.totalPrice}>{formatPrice(booking.totalPrice)}</Text>
        </View>
        <Text style={styles.seatsInfo}>
          {booking.seatsBooked} seat(s) at {formatPrice(booking.ride?.pricePerSeat)}/seat
        </Text>
      </Card>

      {/* Route Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={[styles.dot, styles.dotOrigin]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeText}>{booking.ride?.origin?.address}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.dot, styles.dotDestination]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeText}>{booking.ride?.destination?.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.metaText}>{formatDate(booking.ride?.departureDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.metaText}>{formatTime(booking.ride?.departureTime)}</Text>
          </View>
        </View>
      </Card>

      {/* Driver Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Driver</Text>
        <View style={styles.driverContainer}>
          <Avatar
            source={booking.driver?.profileImage}
            firstName={booking.driver?.firstName}
            lastName={booking.driver?.lastName}
            size="lg"
          />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {booking.driver?.firstName} {booking.driver?.lastName}
            </Text>
            <Rating
              value={booking.driver?.rating?.average || 0}
              showValue
              count={booking.driver?.rating?.count}
              size={16}
            />
            {booking.ride?.vehicleInfo && (
              <Text style={styles.vehicleInfo}>{booking.ride.vehicleInfo}</Text>
            )}
          </View>
        </View>

        {['confirmed', 'completed'].includes(booking.status) && (
          <Button
            title="Message Driver"
            onPress={handleMessage}
            variant="outline"
            style={styles.messageButton}
            icon={<Ionicons name="chatbubble-outline" size={18} color={colors.primary} />}
          />
        )}
      </Card>

      {/* Review Section */}
      {booking.status === 'completed' && !booking.riderReviewId && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          {!showReview ? (
            <Button
              title="Write Review"
              onPress={() => setShowReview(true)}
              variant="outline"
            />
          ) : (
            <View>
              <Text style={styles.ratingLabel}>Rate your experience</Text>
              <Rating
                value={review.rating}
                editable
                onRatingChange={(r) => setReview(prev => ({ ...prev, rating: r }))}
                size={32}
                style={styles.ratingStars}
              />
              <Input
                value={review.comment}
                onChangeText={(c) => setReview(prev => ({ ...prev, comment: c }))}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
              />
              <View style={styles.reviewActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowReview(false)}
                  variant="ghost"
                  style={styles.reviewButton}
                />
                <Button
                  title="Submit Review"
                  onPress={handleSubmitReview}
                  loading={submittingReview}
                  style={styles.reviewButton}
                />
              </View>
            </View>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      {['pending', 'confirmed'].includes(booking.status) && (
        <View style={styles.actions}>
          <Button
            title="Cancel Booking"
            onPress={handleCancel}
            variant="danger"
            loading={cancelling}
            size="lg"
          />
        </View>
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
  statusCard: {
    margin: spacing.md,
    backgroundColor: colors.primary + '10',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  seatsInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  card: {
    margin: spacing.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  routeContainer: {
    marginBottom: spacing.md,
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
  tripMeta: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  metaText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
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
    marginBottom: spacing.xs,
  },
  vehicleInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  messageButton: {
    marginTop: spacing.md,
  },
  ratingLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ratingStars: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  reviewActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  reviewButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actions: {
    padding: spacing.md,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

export default BookingDetailsScreen;
