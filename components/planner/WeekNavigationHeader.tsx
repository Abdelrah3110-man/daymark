import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatWeekRange, shiftWeek, getWeekStartDate } from '@/utils/dates';
import { useAppStore } from '@/store/app-store';

interface WeekNavigationHeaderProps {
  currentWeekStart: string;
  onWeekChange: (newWeekStart: string) => void;
}

export const WeekNavigationHeader: React.FC<WeekNavigationHeaderProps> = ({
  currentWeekStart,
  onWeekChange,
}) => {
  const { colors } = useTheme();
  const weekStartDay = useAppStore((s) => s.settings.weekStartDay);
  const thisWeekStart = getWeekStartDate(new Date(), weekStartDay);
  const isCurrentWeek = currentWeekStart === thisWeekStart;

  const handlePrev = () => {
    onWeekChange(shiftWeek(currentWeekStart, -1));
  };

  const handleNext = () => {
    onWeekChange(shiftWeek(currentWeekStart, 1));
  };

  const handleResetToCurrent = () => {
    onWeekChange(thisWeekStart);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={handlePrev}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Previous week"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.rangeContainer}>
          <Text style={[styles.rangeText, { color: colors.text }]}>{formatWeekRange(currentWeekStart)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={handleNext}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Next week"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!isCurrentWeek && (
        <TouchableOpacity
          style={[styles.todayPill, { backgroundColor: colors.lavenderLight }]}
          onPress={handleResetToCurrent}
          activeOpacity={0.8}
        >
          <Ionicons name="return-up-back" size={13} color={colors.lavenderDark} />
          <Text style={[styles.todayText, { color: colors.lavenderDark }]}>Current Week</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeContainer: {
    marginHorizontal: THEME.spacing.md,
  },
  rangeText: {
    ...THEME.typography.bodyLg,
    fontWeight: '700',
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.pill,
    gap: 4,
  },
  todayText: {
    ...THEME.typography.micro,
    fontWeight: '700',
  },
});

