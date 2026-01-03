import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { colors, spacing, fontSize } from '../../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    rideReminders: true,
    messageNotifications: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = () => {
    Alert.alert('Info', 'Password change feature coming soon');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Account deletion feature coming soon');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, onToggle }) => (
    <View style={styles.settingItem}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.disabled, true: colors.primary + '60' }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.card} noPadding>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive push notifications"
            value={settings.pushNotifications}
            onToggle={() => toggleSetting('pushNotifications')}
          />
          <SettingItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive email updates"
            value={settings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
          />
          <SettingItem
            icon="alarm-outline"
            title="Ride Reminders"
            subtitle="Get reminded before your rides"
            value={settings.rideReminders}
            onToggle={() => toggleSetting('rideReminders')}
          />
          <SettingItem
            icon="chatbubble-outline"
            title="Message Notifications"
            subtitle="Get notified for new messages"
            value={settings.messageNotifications}
            onToggle={() => toggleSetting('messageNotifications')}
          />
        </Card>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Card style={styles.card} noPadding>
          <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingSubtitle}>Update your password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.card} noPadding>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </Card>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <Card style={styles.card}>
          <Text style={styles.dangerText}>
            Deleting your account will permanently remove all your data including rides, bookings, and messages.
          </Text>
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            style={styles.deleteButton}
          />
        </Card>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginTop: spacing.lg,
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
  card: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  dangerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  deleteButton: {
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});

export default SettingsScreen;
