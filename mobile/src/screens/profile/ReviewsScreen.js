import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Rating from '../../components/common/Rating';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { formatDate } from '../../utils/helpers';

const ReviewsScreen = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/user/${user?.id}`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderReview = ({ item }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Avatar
          source={item.reviewer?.profileImage}
          firstName={item.reviewer?.firstName}
          lastName={item.reviewer?.lastName}
          size="sm"
        />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>
            {item.reviewer?.firstName} {item.reviewer?.lastName}
          </Text>
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Rating value={item.rating} size={16} />
      </View>

      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.map((tag, index) => (
            <Badge
              key={index}
              text={tag.replace('_', ' ')}
              variant="primary"
              size="sm"
              style={styles.tag}
            />
          ))}
        </View>
      )}

      {item.ride && (
        <View style={styles.rideInfo}>
          <Text style={styles.rideText}>
            {item.ride.origin?.address?.split(',')[0]} → {item.ride.destination?.address?.split(',')[0]}
          </Text>
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

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon="star-outline"
        title="No reviews yet"
        message="Reviews from your rides will appear here"
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Rating Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.averageRating}>
            {user?.rating?.average?.toFixed(1) || '0.0'}
          </Text>
          <Rating value={user?.rating?.average || 0} size={24} />
          <Text style={styles.totalReviews}>
            Based on {user?.rating?.count || 0} reviews
          </Text>
        </View>
      </Card>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReview}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  summaryCard: {
    margin: spacing.md,
    marginBottom: 0,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  totalReviews: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  reviewerName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  comment: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  rideInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  rideText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default ReviewsScreen;
