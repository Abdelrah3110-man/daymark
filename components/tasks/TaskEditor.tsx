import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { THEME } from '@/constants/theme';
import { Task, TaskDifficulty, TaskPriority, TaskCategory } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/task-store';
import { useGoalStore } from '@/store/goal-store';
import { usePlanningStore } from '@/store/planning-store';
import { getTodayKey } from '@/utils/dates';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface TaskEditorProps {
  visible: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
}

const CATEGORIES: TaskCategory[] = ['Work', 'Study', 'Personal', 'Workout', 'Project'];
const DURATIONS = [15, 30, 45, 60, 90, 120];

export const TaskEditor: React.FC<TaskEditorProps> = ({
  visible,
  onClose,
  taskToEdit,
  defaultDate,
}) => {
  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const bumpRevision = usePlanningStore((s) => s.bumpWeeklyPlanRevision);
  const allGoals = useGoalStore((s) => s.goals);
  const goals = allGoals.filter((g) => g.status === 'active');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaultDate || getTodayKey());
  const [scheduledTime, setScheduledTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [isDailyPriority, setIsDailyPriority] = useState(false);
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setScheduledDate(taskToEdit.scheduledDate);
      setScheduledTime(taskToEdit.scheduledTime || '');
      setEstimatedDuration(taskToEdit.estimatedDuration || 30);
      setDifficulty(taskToEdit.difficulty);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setIsDailyPriority(taskToEdit.isDailyPriority);
      setGoalId(taskToEdit.goalId);
    } else {
      setTitle('');
      setDescription('');
      setScheduledDate(defaultDate || getTodayKey());
      setScheduledTime('');
      setEstimatedDuration(30);
      setDifficulty('medium');
      setPriority('medium');
      setCategory('Work');
      setIsDailyPriority(false);
      setGoalId(undefined);
    }
    setErrorMsg('');
  }, [taskToEdit, defaultDate, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a task title');
      return;
    }
    if (!scheduledDate) {
      setErrorMsg('Please select a scheduled date (YYYY-MM-DD)');
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledDate,
        scheduledTime: scheduledTime.trim() || undefined,
        estimatedDuration,
        difficulty,
        priority,
        category,
        isDailyPriority,
        goalId,
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledDate,
        scheduledTime: scheduledTime.trim() || undefined,
        estimatedDuration,
        difficulty,
        priority,
        category,
        isDailyPriority,
        goalId,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit) {
      deleteTask(taskToEdit.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{taskToEdit ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={THEME.colors.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to get done?"
            placeholderTextColor={THEME.colors.textLight}
            value={title}
            onChangeText={setTitle}
            autoFocus={!taskToEdit}
          />

          {/* Description */}
          <Text style={styles.label}>Notes / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add relevant context or checklist..."
            placeholderTextColor={THEME.colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Date & Time Row */}
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Scheduled Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={THEME.colors.textLight}
                value={scheduledDate}
                onChangeText={setScheduledDate}
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Time (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor={THEME.colors.textLight}
                value={scheduledTime}
                onChangeText={setScheduledTime}
              />
            </View>
          </View>

          {/* Estimated Duration */}
          <Text style={styles.label}>Estimated Duration</Text>
          <View style={styles.pillRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.pill, estimatedDuration === d && styles.pillActive]}
                onPress={() => setEstimatedDuration(d)}
              >
                <Text style={[styles.pillText, estimatedDuration === d && styles.pillTextActive]}>
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Difficulty (XP) */}
          <Text style={styles.label}>Difficulty & XP</Text>
          <View style={styles.segmentedRow}>
            {(['light', 'medium', 'hard'] as TaskDifficulty[]).map((diff) => {
              const active = difficulty === diff;
              const xp = diff === 'light' ? '5 XP' : diff === 'medium' ? '10 XP' : '20 XP';
              return (
                <TouchableOpacity
                  key={diff}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text style={[styles.segmentTitle, active && styles.segmentTextActive]}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                  <Text style={[styles.segmentSub, active && styles.segmentTextActive]}>{xp}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Priority */}
          <Text style={styles.label}>Priority</Text>
          <View style={styles.segmentedRow}>
            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
              const active = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.segmentTitle, active && styles.segmentTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.pillRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, category === cat && styles.pillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Daily Top Priority Toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsDailyPriority(!isDailyPriority)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleLeft}>
              <Ionicons
                name={isDailyPriority ? 'star' : 'star-outline'}
                size={20}
                color={isDailyPriority ? '#D97706' : THEME.colors.textMuted}
              />
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Daily Top Priority</Text>
                <Text style={styles.toggleSubtitle}>Highlight as 1 of up to 3 core priorities for the day</Text>
              </View>
            </View>
            <View style={[styles.switchTrack, isDailyPriority && styles.switchTrackActive]}>
              <View style={[styles.switchThumb, isDailyPriority && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>

          {/* Goal linking */}
          {goals.length > 0 && (
            <>
              <Text style={styles.label}>Link to Goal (Optional)</Text>
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[styles.pill, !goalId && styles.pillActive]}
                  onPress={() => setGoalId(undefined)}
                >
                  <Text style={[styles.pillText, !goalId && styles.pillTextActive]}>None</Text>
                </TouchableOpacity>
                {goals.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.pill, goalId === g.id && styles.pillActive]}
                    onPress={() => setGoalId(g.id)}
                  >
                    <Text style={[styles.pillText, goalId === g.id && styles.pillTextActive]}>
                      {g.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Delete Action if editing */}
          {taskToEdit && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setShowDeleteConfirm(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={THEME.colors.danger} />
              <Text style={styles.deleteText}>Delete Task</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToEdit?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  cancelText: {
    ...THEME.typography.body,
    color: THEME.colors.textMuted,
  },
  headerTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  saveBtn: {
    backgroundColor: THEME.colors.text,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
  },
  saveText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.sm,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    gap: 6,
  },
  errorText: {
    ...THEME.typography.caption,
    color: THEME.colors.danger,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 60,
  },
  label: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: THEME.spacing.md,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    ...THEME.typography.body,
    color: THEME.colors.text,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  pillActive: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
  pillText: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
  },
  pillTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  segmentActive: {
    backgroundColor: THEME.colors.surface,
    ...THEME.shadows.subtle,
  },
  segmentTitle: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  segmentSub: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  segmentTextActive: {
    color: THEME.colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: THEME.spacing.lg,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: THEME.spacing.sm,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    ...THEME.typography.bodyLg,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  toggleSubtitle: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: THEME.colors.text,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.surface,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.xxl,
    gap: THEME.spacing.xs,
  },
  deleteText: {
    ...THEME.typography.body,
    fontWeight: '600',
    color: THEME.colors.danger,
  },
});

