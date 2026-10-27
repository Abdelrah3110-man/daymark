import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '@/store/notes-store';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { EmptyState } from '@/components/common/EmptyState';
import { Note } from '@/types/app';

export default function NotesScreen() {
  const notes = useNotesStore((s) => s.notes);

  const [searchQuery, setSearchQuery] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = n.title.toLowerCase().includes(query);
    const contentMatch = n.content.toLowerCase().includes(query);
    const tagMatch = n.tags.some((t) => t.toLowerCase().includes(query));
    return titleMatch || contentMatch || tagMatch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.subtitle}>Fast capture, reflections, and playbooks</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setNoteToEdit(null);
            setEditorVisible(true);
          }}
          accessibilityLabel="Create note"
        >
          <Ionicons name="add" size={22} color={THEME.colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, body, or #tag..."
          placeholderTextColor={THEME.colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {notes.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No notes recorded"
            description="Capture quick ideas, project specs, meeting takeaways, and link them to tasks or goals."
            actionLabel="Create Note"
            onAction={() => {
              setNoteToEdit(null);
              setEditorVisible(true);
            }}
            accentColor={THEME.colors.mint}
          />
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No matching notes"
            description={`No notes matched "${searchQuery}". Check your keywords or clear the search.`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
            accentColor={THEME.colors.surfaceSecondary}
          />
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pin" size={13} color={THEME.colors.peachDark} />
                  <Text style={styles.sectionTitle}>PINNED</Text>
                </View>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPress={() => {
                      setNoteToEdit(note);
                      setEditorVisible(true);
                    }}
                  />
                ))}
              </View>
            )}

            {otherNotes.length > 0 && (
              <View style={styles.sectionWrap}>
                {pinnedNotes.length > 0 && (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ALL NOTES</Text>
                  </View>
                )}
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPress={() => {
                      setNoteToEdit(note);
                      setEditorVisible(true);
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Note Editor Modal */}
      <NoteEditor
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        noteToEdit={noteToEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.sm,
  },
  title: {
    ...THEME.typography.h1,
    color: THEME.colors.text,
  },
  subtitle: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.pill,
    marginHorizontal: THEME.spacing.lg,
    marginVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.md,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...THEME.typography.bodySm,
    color: THEME.colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: 110,
  },
  sectionWrap: {
    marginBottom: THEME.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  sectionTitle: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
});
