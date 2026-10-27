import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { getDayNameShort, getDayNumber } from '@/utils/dates';

interface WeeklyDayPickerProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  taskCountsByDate?: Record<string, number>;
}

export const WeeklyDayPicker: React.FC<WeeklyDayPickerProps> = ({
  dates,
  selectedDate,
  onSelectDate,
  taskCountsByDate = {},
}) => {
  return (
    <View style={styles.container}>
      {dates.map((dateStr) => {
        const isSelected = dateStr === selectedDate;
        const dayName = getDayNameShort(dateStr);
        const dayNum = getDayNumber(dateStr);
        const hasTasks = (taskCountsByDate[dateStr] || 0) > 0;

        return (
          <TouchableOpacity
            key={dateStr}
            style={[styles.pill, isSelected ? styles.pillSelected : styles.pillDefault]}
            onPress={() => onSelectDate(dateStr)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${dayName} ${dayNum}`}
            accessibilityState={isSelected ? { selected: true } : {}}
          >
            <Text style={[styles.dayText, isSelected ? styles.dayTextSelected : styles.dayTextDefault]}>
              {dayName}
            </Text>

            <View
              style={[
                styles.dot,
                isSelected
                  ? styles.dotSelected
                  : hasTasks
                  ? styles.dotActive
                  : styles.dotDefault,
              ]}
            />

            <Text style={[styles.numText, isSelected ? styles.numTextSelected : styles.numTextDefault]}>
              {dayNum}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: THEME.spacing.md,
  },
  pill: {
    width: 44,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 78,
  },
  pillDefault: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  pillSelected: {
    backgroundColor: THEME.colors.navBackground,
    ...THEME.shadows.card,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayTextDefault: {
    color: THEME.colors.textMuted,
  },
  dayTextSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginVertical: 4,
  },
  dotDefault: {
    backgroundColor: THEME.colors.textLight,
  },
  dotActive: {
    backgroundColor: THEME.colors.lavenderDark,
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
  },
  numText: {
    fontSize: 14,
    fontWeight: '700',
  },
  numTextDefault: {
    color: THEME.colors.text,
  },
  numTextSelected: {
    color: '#FFFFFF',
  },
});

