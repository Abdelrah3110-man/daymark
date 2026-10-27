import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface QuickActionsRowProps {
  onAddTask: () => void;
  onOpenNotes?: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onAddTask,
  onOpenNotes,
}) => {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      <TouchableOpacity
        style={[styles.tile, { backgroundColor: THEME.colors.lightBlue }]}
        onPress={onAddTask}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="add" size={20} color={THEME.colors.text} />
        </View>
        <Text style={styles.tileTitle}>New Task</Text>
        <Text style={styles.tileSubtitle}>Schedule commitment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tile, { backgroundColor: THEME.colors.lavender }]}
        onPress={() => router.push('/focus/new' as any)}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="timer-outline" size={20} color={THEME.colors.text} />
        </View>
        <Text style={styles.tileTitle}>Focus Session</Text>
        <Text style={styles.tileSubtitle}>Deep work timer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tile, { backgroundColor: THEME.colors.peach }]}
        onPress={() => router.push('/planner')}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={20} color={THEME.colors.text} />
        </View>
        <Text style={styles.tileTitle}>Weekly Plan</Text>
        <Text style={styles.tileSubtitle}>Organize 7 days</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tile, { backgroundColor: THEME.colors.mint }]}
        onPress={() => router.push('/notes')}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="create-outline" size={20} color={THEME.colors.text} />
        </View>
        <Text style={styles.tileTitle}>Capture Note</Text>
        <Text style={styles.tileSubtitle}>Quick idea or log</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  tile: {
    flex: 1,
    minWidth: '47%',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...THEME.shadows.subtle,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  tileTitle: {
    ...THEME.typography.h3,
    fontSize: 16,
    color: THEME.colors.text,
  },
  tileSubtitle: {
    ...THEME.typography.micro,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});
