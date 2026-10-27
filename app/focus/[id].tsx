import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/task-store';
import { useFocusStore } from '@/store/focus-store';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { FocusReflectionModal } from '@/components/focus/FocusReflectionModal';

export default function FocusScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;

  const tasks = useTaskStore((s) => s.tasks);
  const activeSession = useFocusStore((s) => s.activeSession);
  const startSession = useFocusStore((s) => s.startSession);

  const [reflectionModalVisible, setReflectionModalVisible] = useState(false);

  const matchedTask = taskId && taskId !== 'new' ? tasks.find((t) => t.id === taskId) : null;

  useEffect(() => {
    if (matchedTask && (!activeSession || activeSession.taskId !== matchedTask.id)) {
      startSession({
        taskId: matchedTask.id,
        taskTitle: matchedTask.title,
        durationMinutes: matchedTask.estimatedDuration || 25,
      });
    }
  }, [taskId]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Deep Focus</Text>

        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <FocusTimer onFinishRequest={() => setReflectionModalVisible(true)} />
      </View>

      <FocusReflectionModal
        visible={reflectionModalVisible}
        onDismiss={() => {
          setReflectionModalVisible(false);
          router.back();
        }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

