import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Rating from '../../components/common/Rating';
import { colors, spacing, fontSize } from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, badge, showChevron = true, danger = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar
            source={user?.profileImage}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="xl"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleContainer}>
              <Badge
                text={user?.role === 'both' ? 'Driver & Rider' : user?.role}
                variant="primary"
                size="sm"
              />
              {user?.driverInfo?.isVerified && (
                <Badge text="Verified Driver" variant="success" size="sm" style={styles.verifiedBadge} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Rating
              value={user?.rating?.average || 0}
              size={18}
              showValue
              count={user?.rating?.count}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </Card>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.menuCard} noPadding>
          <MenuItem
            icon="person-outline"
            title="Personal Information"
            subtitle="Update your personal details"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuItem
            icon="car-outline"
            title="Driver Information"
            subtitle={user?.role === 'driver' || user?.role === 'both' ? 'Manage vehicle details' : 'Become a driver'}
            onPress={() => navigation.navigate('DriverInfo')}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            badge={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
          <MenuItem
            icon="star-outline"
            title="My Reviews"
            subtitle="See what others say about you"
            onPress={() => navigation.navigate('Reviews')}
          />
        </Card>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card style={styles.menuCard} noPadding>
          <MenuItem
            icon="settings-outline"
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            title="Terms & Privacy"
            onPress={() => {}}
          />
        </Card>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <Card style={styles.menuCard} noPadding>
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            showChevron={false}
            danger
          />
        </Card>
      </View>

      <Text style={styles.version}>Uni-Ride v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  verifiedBadge: {
    marginLeft: spacing.sm,
  },
  statsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  editButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
  section: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: colors.error + '15',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  menuTitleDanger: {
    color: colors.error,
  },
  menuSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: fontSize.sm,
    marginVertical: spacing.xl,
  },
});

export default ProfileScreen;
