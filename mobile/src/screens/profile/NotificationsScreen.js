import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { getRelativeTime } from '../../utils/helpers';

const NotificationsScreen = ({ navigation }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
        return 'ticket-outline';
      case 'booking_confirmed':
        return 'checkmark-circle-outline';
      case 'booking_rejected':
        return 'close-circle-outline';
      case 'booking_cancelled':
        return 'ban-outline';
      case 'new_message':
        return 'chatbubble-outline';
      case 'new_review':
        return 'star-outline';
      case 'ride_reminder':
        return 'alarm-outline';
      case 'ride_completed':
        return 'flag-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'ride_completed':
        return colors.success;
      case 'booking_rejected':
      case 'booking_cancelled':
        return colors.error;
      case 'new_message':
        return colors.info;
      case 'new_review':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const handlePress = (notification) => {
    markAsRead(notification._id);

    // Navigate based on notification type
    if (notification.data?.bookingId) {
      navigation.navigate('Bookings', {
        screen: 'BookingDetails',
        params: { bookingId: notification.data.bookingId },
      });
    } else if (notification.data?.conversationId) {
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: { conversationId: notification.data.conversationId },
      });
    } else if (notification.data?.rideId) {
      navigation.navigate('Home', {
        screen: 'RideDetails',
        params: { rideId: notification.data.rideId },
      });
    }
  };

  const renderNotification = ({ item }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <Card
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => handlePress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons
              name={getNotificationIcon(item.type)}
              size={24}
              color={iconColor}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.time}>{getRelativeTime(item.createdAt)}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </Card>
    );
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon="notifications-off-outline"
        title="No notifications"
        message="You're all caught up!"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Mark all as read"
          onPress={markAllAsRead}
          variant="ghost"
          size="sm"
        />
        <Button
          title="Clear all"
          onPress={clearAll}
          variant="ghost"
          size="sm"
        />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  unreadCard: {
    backgroundColor: colors.primary + '08',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

export default NotificationsScreen;
