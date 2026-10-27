import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Note } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '@/store/notes-store';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
  const togglePin = useNotesStore((s) => s.togglePinNote);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <TouchableOpacity
          style={styles.pinBtn}
          onPress={() => togglePin(note.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={note.isPinned ? 'pin' : 'pin-outline'}
            size={16}
            color={note.isPinned ? THEME.colors.peachDark : THEME.colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {note.content}
      </Text>

      {note.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {note.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {(note.linkedTaskId || note.linkedGoalId) && (
        <View style={styles.linkedRow}>
          <Ionicons name="link-outline" size={12} color={THEME.colors.lavenderDark} />
          <Text style={styles.linkedText}>
            Linked to {note.linkedTaskId ? 'task' : 'goal'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...THEME.typography.h3,
    fontSize: 16,
    color: THEME.colors.text,
    flex: 1,
  },
  pinBtn: {
    padding: 2,
    marginLeft: 6,
  },
  content: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: THEME.spacing.sm,
  },
  tagPill: {
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
  },
  tagText: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  linkedText: {
    ...THEME.typography.micro,
    color: THEME.colors.lavenderDark,
    fontWeight: '600',
  },
});

