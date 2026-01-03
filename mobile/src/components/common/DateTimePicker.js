import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../utils/theme';

const DateTimePicker = ({
  label,
  value,
  onChange,
  mode = 'date', // 'date', 'time', or 'datetime'
  placeholder,
  error,
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const formatDisplay = () => {
    if (!value) return placeholder || (mode === 'time' ? 'Select time' : 'Select date');

    const date = new Date(value);

    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (mode === 'datetime') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    if (mode === 'time') {
      // Format as HH:MM for time mode
      const hours = tempDate.getHours().toString().padStart(2, '0');
      const minutes = tempDate.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    } else {
      onChange(tempDate.toISOString().split('T')[0]);
    }
    setShowPicker(false);
  };

  const incrementValue = (type, amount) => {
    const newDate = new Date(tempDate);
    switch (type) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'hour':
        newDate.setHours(newDate.getHours() + amount);
        break;
      case 'minute':
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
    }
    setTempDate(newDate);
  };

  const ValueSelector = ({ type, value, format }) => (
    <View style={styles.selectorColumn}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => incrementValue(type, 1)}
      >
        <Ionicons name="chevron-up" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.selectorValue}>{format || value}</Text>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => incrementValue(type, -1)}
      >
        <Ionicons name="chevron-down" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons
          name={mode === 'time' ? 'time-outline' : 'calendar-outline'}
          size={20}
          color={colors.textSecondary}
        />
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formatDisplay()}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {mode === 'time' ? 'Select Time' : 'Select Date'}
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {mode !== 'time' && (
                <>
                  <ValueSelector
                    type="month"
                    value={tempDate.toLocaleString('en-US', { month: 'short' })}
                  />
                  <ValueSelector
                    type="day"
                    value={tempDate.getDate()}
                  />
                  <ValueSelector
                    type="year"
                    value={tempDate.getFullYear()}
                  />
                </>
              )}
              {(mode === 'time' || mode === 'datetime') && (
                <>
                  {mode === 'datetime' && <View style={styles.separator} />}
                  <ValueSelector
                    type="hour"
                    value={tempDate.getHours().toString().padStart(2, '0')}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <ValueSelector
                    type="minute"
                    value={tempDate.getMinutes().toString().padStart(2, '0')}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  placeholder: {
    color: colors.placeholder,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  confirmText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  selectorColumn: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  arrowButton: {
    padding: spacing.sm,
  },
  selectorValue: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: spacing.sm,
    minWidth: 50,
    textAlign: 'center',
  },
  separator: {
    width: spacing.lg,
  },
  timeSeparator: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
});

export default DateTimePicker;
