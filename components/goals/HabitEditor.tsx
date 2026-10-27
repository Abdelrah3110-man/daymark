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
import { Habit, HabitFrequency } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useGoalStore } from '@/store/goal-store';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface HabitEditorProps {
  visible: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

export const HabitEditor: React.FC<HabitEditorProps> = ({ visible, onClose, habitToEdit }) => {
  const createHabit = useGoalStore((s) => s.createHabit);
  const updateHabit = useGoalStore((s) => s.updateHabit);
  const deleteHabit = useGoalStore((s) => s.deleteHabit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setFrequency(habitToEdit.frequency);
      setTargetDaysPerWeek(habitToEdit.targetDaysPerWeek || 7);
    } else {
      setTitle('');
      setDescription('');
      setFrequency('daily');
      setTargetDaysPerWeek(7);
    }
    setErrorMsg('');
  }, [habitToEdit, visible]);

  const handleFrequencySelect = (freq: HabitFrequency) => {
    setFrequency(freq);
    if (freq === 'daily') setTargetDaysPerWeek(7);
    if (freq === 'weekdays') setTargetDaysPerWeek(5);
    if (freq === 'weekends') setTargetDaysPerWeek(2);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a habit title.');
      return;
    }

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        targetDaysPerWeek,
      });
    } else {
      createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        targetDaysPerWeek,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (habitToEdit) {
      deleteHabit(habitToEdit.id);
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
          <Text style={styles.headerTitle}>{habitToEdit ? 'Edit Habit' : 'New Habit'}</Text>
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
          <Text style={styles.label}>Habit Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning 20m Reflection"
            placeholderTextColor={THEME.colors.textLight}
            value={title}
            onChangeText={setTitle}
            autoFocus={!habitToEdit}
          />

          <Text style={styles.label}>Motivation / Cue</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="When or after what anchor will you perform this habit?"
            placeholderTextColor={THEME.colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.pillRow}>
            {(['daily', 'weekdays', 'weekends'] as HabitFrequency[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.pill, frequency === f && styles.pillActive]}
                onPress={() => handleFrequencySelect(f)}
              >
                <Text style={[styles.pillText, frequency === f && styles.pillTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Target Days per Week: {targetDaysPerWeek}</Text>
          <View style={styles.pillRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.pill, targetDaysPerWeek === num && styles.pillActive]}
                onPress={() => setTargetDaysPerWeek(num)}
              >
                <Text style={[styles.pillText, targetDaysPerWeek === num && styles.pillTextActive]}>
                  {num}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {habitToEdit && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setShowDeleteConfirm(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={THEME.colors.danger} />
              <Text style={styles.deleteText}>Delete Habit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Habit"
        message={`Delete habit "${habitToEdit?.title}" and its completion records?`}
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
    height: 64,
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
