import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/types/app';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDurationMinutes } from '@/utils/dates';
import { useTaskStore } from '@/store/task-store';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  showDate?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, showDate = false }) => {
  const { colors, isDark } = useTheme();
  const completeTask = useTaskStore((s) => s.completeTask);
  const reopenTask = useTaskStore((s) => s.reopenTask);

  const isCompleted = task.status === 'completed';

  const handleToggle = () => {
    if (isCompleted) {
      reopenTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const getDifficultyColor = () => {
    switch (task.difficulty) {
      case 'light':
        return { bg: colors.mintLight, text: colors.mintDark, label: '5 XP' };
      case 'medium':
        return { bg: colors.peachLight, text: colors.peachDark, label: '10 XP' };
      case 'hard':
        return { bg: colors.softPinkLight, text: colors.softPinkDark, label: '20 XP' };
      default:
        return { bg: colors.surfaceSecondary, text: colors.textMuted, label: '10 XP' };
    }
  };

  const diffStyle = getDifficultyColor();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isCompleted ? colors.surfaceSecondary : colors.surface,
          borderColor: colors.border,
        },
        isCompleted && styles.cardCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}, ${isCompleted ? 'completed' : 'pending'}`}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.border },
          isCompleted && {
            backgroundColor: isDark ? '#FFFFFF' : '#12131C',
            borderColor: isDark ? '#FFFFFF' : '#12131C',
          },
        ]}
        onPress={handleToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={14} color={isDark ? '#12131C' : '#FFFFFF'} />
        )}
      </TouchableOpacity>

      <View style={styles.contentWrap}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              isCompleted && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.isDailyPriority && (
            <View style={styles.priorityBadge}>
              <Ionicons name="star" size={12} color="#D97706" />
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {task.scheduledTime && (
            <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.tagText, { color: colors.textMuted }]}>{task.scheduledTime}</Text>
            </View>
          )}

          {task.estimatedDuration > 0 && (
            <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="hourglass-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.tagText, { color: colors.textMuted }]}>{formatDurationMinutes(task.estimatedDuration)}</Text>
            </View>
          )}

          {task.category ? (
            <View style={[styles.tag, { backgroundColor: colors.lightBlueLight }]}>
              <Text style={[styles.categoryText, { color: colors.lightBlueDark }]}>{task.category}</Text>
            </View>
          ) : null}

          <View style={[styles.diffTag, { backgroundColor: diffStyle.bg }]}>
            <Text style={[styles.diffText, { color: diffStyle.text }]}>{diffStyle.label}</Text>
          </View>

          {task.postponementCount > 0 && (
            <View style={[styles.postponeTag, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="return-down-forward" size={11} color={colors.warning} />
              <Text style={[styles.postponeText, { color: colors.warning }]}>{task.postponementCount}x</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#ECEEF5',
    ...THEME.shadows.subtle,
  },
  cardCompleted: {
    opacity: 0.6,
    backgroundColor: '#F7F8FC',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.8,
    borderColor: '#C5C9D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
  contentWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...THEME.typography.bodyLg,
    color: THEME.colors.text,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted,
  },
  priorityBadge: {
    marginLeft: THEME.spacing.xs,
    padding: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: THEME.spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
    gap: 3,
  },
  tagText: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
  },
  categoryTag: {
    backgroundColor: THEME.colors.lightBlueLight,
  },
  categoryText: {
    ...THEME.typography.micro,
    color: THEME.colors.lightBlueDark,
    fontWeight: '600',
  },
  diffTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
  },
  diffText: {
    ...THEME.typography.micro,
    fontWeight: '700',
  },
  postponeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.warningLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
    gap: 2,
  },
  postponeText: {
    ...THEME.typography.micro,
    color: THEME.colors.warning,
    fontWeight: '600',
  },
});

