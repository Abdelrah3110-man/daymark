import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Habit } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useGoalStore } from '@/store/goal-store';
import { formatWeekdayShort, parseDateKey, getTodayKey } from '@/utils/dates';

interface HabitCardProps {
  habit: Habit;
  weekDates: string[];
  onEdit: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, weekDates, onEdit }) => {
  const toggleOccurrence = useGoalStore((s) => s.toggleHabitOccurrence);
  const isCompletedOnDate = useGoalStore((s) => s.isHabitCompletedOnDate);
  const todayKey = getTodayKey();

  const completedCountThisWeek = weekDates.filter((d) => isCompletedOnDate(habit.id, d)).length;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{habit.title}</Text>
          <Text style={styles.targetText}>
            Target: {habit.targetDaysPerWeek} days/week • Completed {completedCountThisWeek} this week
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(habit)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* 7 Days Row */}
      <View style={styles.weekRow}>
        {weekDates.map((dateKey) => {
          const isDone = isCompletedOnDate(habit.id, dateKey);
          const isToday = dateKey === todayKey;
          const dayDate = parseDateKey(dateKey);
          const dayNumber = dayDate.getDate();
          const dayLabel = formatWeekdayShort(dateKey).charAt(0);

          return (
            <View key={dateKey} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{dayLabel}</Text>
              <Text style={[styles.dateNumber, isToday && styles.dateNumberToday]}>{dayNumber}</Text>

              <TouchableOpacity
                style={[
                  styles.circle,
                  isDone && styles.circleDone,
                  isToday && !isDone && styles.circleToday,
                ]}
                onPress={() => toggleOccurrence(habit.id, dateKey)}
                activeOpacity={0.7}
                accessibilityLabel={`Check in ${habit.title} for ${dateKey}`}
              >
                {isDone && <Ionicons name="checkmark" size={14} color={THEME.colors.textInverse} />}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  targetText: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  editBtn: {
    padding: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.xs,
  },
  dayCol: {
    alignItems: 'center',
    gap: 3,
  },
  dayLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  dayLabelToday: {
    color: THEME.colors.lavenderDark,
    fontWeight: '800',
  },
  dateNumber: {
    ...THEME.typography.micro,
    fontSize: 10,
    color: THEME.colors.textLight,
  },
  dateNumberToday: {
    color: THEME.colors.lavenderDark,
    fontWeight: '700',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  circleToday: {
    borderColor: THEME.colors.lavenderDark,
  },
  circleDone: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
});
