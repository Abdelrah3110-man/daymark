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
import { Note } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '@/store/notes-store';
import { useTaskStore } from '@/store/task-store';
import { useGoalStore } from '@/store/goal-store';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface NoteEditorProps {
  visible: boolean;
  onClose: () => void;
  noteToEdit?: Note | null;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ visible, onClose, noteToEdit }) => {
  const createNote = useNotesStore((s) => s.createNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const allTasks = useTaskStore((s) => s.tasks);
  const allGoals = useGoalStore((s) => s.goals);
  const tasks = allTasks.filter((t) => t.status !== 'cancelled');
  const goals = allGoals.filter((g) => g.status === 'active');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>(undefined);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>(undefined);
  const [isPinned, setIsPinned] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setTagsInput(noteToEdit.tags.join(', '));
      setLinkedTaskId(noteToEdit.linkedTaskId);
      setLinkedGoalId(noteToEdit.linkedGoalId);
      setIsPinned(noteToEdit.isPinned);
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
      setLinkedTaskId(undefined);
      setLinkedGoalId(undefined);
      setIsPinned(false);
    }
  }, [noteToEdit, visible]);

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (noteToEdit) {
      updateNote(noteToEdit.id, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        tags,
        linkedTaskId,
        linkedGoalId,
        isPinned,
      });
    } else {
      createNote({
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        tags,
        linkedTaskId,
        linkedGoalId,
        isPinned,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (noteToEdit) {
      deleteNote(noteToEdit.id);
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
          <Text style={styles.headerTitle}>{noteToEdit ? 'Edit Note' : 'New Note'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={THEME.colors.textLight}
            value={title}
            onChangeText={setTitle}
            autoFocus={!noteToEdit}
          />

          <TextInput
            style={styles.contentInput}
            placeholder="Write thoughts, strategy, or meeting notes here..."
            placeholderTextColor={THEME.colors.textLight}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.metaSection}>
            <Text style={styles.metaLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.tagsInput}
              placeholder="e.g. strategy, ideas, deepwork"
              placeholderTextColor={THEME.colors.textLight}
              value={tagsInput}
              onChangeText={setTagsInput}
            />

            <TouchableOpacity
              style={styles.pinToggleRow}
              onPress={() => setIsPinned(!isPinned)}
            >
              <Ionicons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={18}
                color={isPinned ? THEME.colors.peachDark : THEME.colors.textMuted}
              />
              <Text style={styles.pinToggleText}>
                {isPinned ? 'Pinned to top' : 'Pin note'}
              </Text>
            </TouchableOpacity>

            {tasks.length > 0 && (
              <>
                <Text style={styles.metaLabel}>Link to Task (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalPills}>
                  <TouchableOpacity
                    style={[styles.pill, !linkedTaskId && styles.pillActive]}
                    onPress={() => setLinkedTaskId(undefined)}
                  >
                    <Text style={[styles.pillText, !linkedTaskId && styles.pillTextActive]}>None</Text>
                  </TouchableOpacity>
                  {tasks.slice(0, 10).map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.pill, linkedTaskId === t.id && styles.pillActive]}
                      onPress={() => setLinkedTaskId(t.id)}
                    >
                      <Text style={[styles.pillText, linkedTaskId === t.id && styles.pillTextActive]}>
                        {t.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {goals.length > 0 && (
              <>
                <Text style={styles.metaLabel}>Link to Goal (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalPills}>
                  <TouchableOpacity
                    style={[styles.pill, !linkedGoalId && styles.pillActive]}
                    onPress={() => setLinkedGoalId(undefined)}
                  >
                    <Text style={[styles.pillText, !linkedGoalId && styles.pillTextActive]}>None</Text>
                  </TouchableOpacity>
                  {goals.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.pill, linkedGoalId === g.id && styles.pillActive]}
                      onPress={() => setLinkedGoalId(g.id)}
                    >
                      <Text style={[styles.pillText, linkedGoalId === g.id && styles.pillTextActive]}>
                        {g.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {noteToEdit && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Ionicons name="trash-outline" size={18} color={THEME.colors.danger} />
                <Text style={styles.deleteText}>Delete Note</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 60,
  },
  titleInput: {
    ...THEME.typography.h2,
    color: THEME.colors.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    marginBottom: THEME.spacing.md,
  },
  contentInput: {
    ...THEME.typography.bodyLg,
    color: THEME.colors.text,
    minHeight: 180,
    lineHeight: 24,
  },
  metaSection: {
    marginTop: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  metaLabel: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: THEME.spacing.md,
  },
  tagsInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    ...THEME.typography.bodySm,
    color: THEME.colors.text,
  },
  pinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: THEME.spacing.md,
    paddingVertical: 4,
  },
  pinToggleText: {
    ...THEME.typography.bodySm,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  horizontalPills: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 6,
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

