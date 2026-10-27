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
} from 'react-native';
import { THEME } from '@/constants/theme';
import { Goal } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useGoalStore } from '@/store/goal-store';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface GoalEditorProps {
  visible: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

const GOAL_CATEGORIES = ['Career', 'Health', 'Learning', 'Personal', 'Finance', 'Creative'];

export const GoalEditor: React.FC<GoalEditorProps> = ({ visible, onClose, goalToEdit }) => {
  const createGoal = useGoalStore((s) => s.createGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);

  const [title, setTitle] = useState(goalToEdit?.title || '');
  const [description, setDescription] = useState(goalToEdit?.description || '');
  const [category, setCategory] = useState(goalToEdit?.category || 'Career');
  const [targetDate, setTargetDate] = useState(goalToEdit?.targetDate || '');
  const [milestonesInput, setMilestonesInput] = useState(
    goalToEdit ? goalToEdit.milestones.map((m) => m.title).join('\n') : ''
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setCategory(goalToEdit.category || 'Career');
      setTargetDate(goalToEdit.targetDate || '');
      setMilestonesInput(goalToEdit.milestones.map((m) => m.title).join('\n'));
    }
  }, [goalToEdit]);

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a goal title.');
      return;
    }

    const milestoneList = milestonesInput
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetDate: targetDate.trim() || undefined,
      });
    } else {
      createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetDate: targetDate.trim() || undefined,
        milestones: milestoneList,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goalToEdit) {
      deleteGoal(goalToEdit.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{goalToEdit ? 'Edit Goal' : 'New Goal'}</Text>
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
          <Text style={styles.label}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Master Mobile Architecture"
            placeholderTextColor={THEME.colors.textLight}
            value={title}
            onChangeText={setTitle}
            autoFocus={!goalToEdit}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Why does this goal matter? What does success look like?"
            placeholderTextColor={THEME.colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pillRow}>
            {GOAL_CATEGORIES.map((cat) => (
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

          <Text style={styles.label}>Target Completion Date (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={THEME.colors.textLight}
            value={targetDate}
            onChangeText={setTargetDate}
          />

          {!goalToEdit && (
            <>
              <Text style={styles.label}>Milestones (one per line)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={`Read reference documentation\nImplement synchronization engine\nComplete test verification`}
                placeholderTextColor={THEME.colors.textLight}
                value={milestonesInput}
                onChangeText={setMilestonesInput}
                multiline
                numberOfLines={4}
              />
            </>
          )}

          {goalToEdit && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setShowDeleteConfirm(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={THEME.colors.danger} />
              <Text style={styles.deleteText}>Delete Goal</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Goal"
        message={`Delete "${goalToEdit?.title}"? Milestones will also be removed.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
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
    height: 80,
    textAlignVertical: 'top',
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

