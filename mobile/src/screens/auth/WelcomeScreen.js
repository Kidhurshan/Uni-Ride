import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors, spacing, fontSize } from '../../utils/theme';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="car-sport" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Uni-Ride</Text>
          <Text style={styles.subtitle}>
            Share rides with fellow students
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="cash-outline" size={28} color={colors.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Save Money</Text>
              <Text style={styles.featureDesc}>Split costs with other students</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="leaf-outline" size={28} color={colors.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Go Green</Text>
              <Text style={styles.featureDesc}>Reduce your carbon footprint</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={28} color={colors.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Meet People</Text>
              <Text style={styles.featureDesc}>Connect with students from your university</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
          size="lg"
        />

        <Button
          title="I already have an account"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          style={styles.buttonSecondary}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  features: {
    marginTop: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  featureText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  featureDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.sm,
  },
  buttonSecondary: {
    marginTop: spacing.xs,
  },
});

export default WelcomeScreen;
