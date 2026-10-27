import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task } from '@/types/app';
import { formatDayShort, formatDurationMinutes } from '@/utils/dates';
import { useTaskStore } from '@/store/task-store';

interface YourPlanBentoGridProps {
  selectedDate: string;
  tasks: Task[];
  onAddTask: () => void;
  onOpenDay: () => void;
}

export const YourPlanBentoGrid: React.FC<YourPlanBentoGridProps> = ({
  selectedDate,
  tasks,
  onAddTask,
  onOpenDay,
}) => {
  const router = useRouter();
  const completeTask = useTaskStore((s) => s.completeTask);
  const reopenTask = useTaskStore((s) => s.reopenTask);

  const activeTasks = tasks.filter((t) => t.status !== 'cancelled');
  const primaryTask = activeTasks[0];
  const secondaryTask = activeTasks[1];

  const formattedDate = formatDayShort(selectedDate);

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'low':
        return 'Light';
      case 'medium':
      default:
        return 'Medium';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your plan</Text>
        <TouchableOpacity onPress={onOpenDay} activeOpacity={0.7} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View day</Text>
          <Ionicons name="arrow-forward" size={14} color="#12131C" />
        </TouchableOpacity>
      </View>

      <View style={styles.bentoRow}>
        {/* Left Column: Tall Peach/Gold Card */}
        <TouchableOpacity
          style={styles.tallPeachCard}
          onPress={() => {
            if (primaryTask) {
              const isDone = primaryTask.status === 'completed';
              if (isDone) reopenTask(primaryTask.id);
              else completeTask(primaryTask.id);
            } else {
              onAddTask();
            }
          }}
          activeOpacity={0.88}
        >
          {primaryTask ? (
            <View style={styles.tallContent}>
              <View>
                <View style={styles.priorityPill}>
                  <Text style={styles.priorityText}>{getPriorityLabel(primaryTask.priority)}</Text>
                </View>

                <Text style={styles.tallTitle} numberOfLines={2}>
                  {primaryTask.title}
                </Text>

                <Text style={styles.tallSubText}>{formattedDate}</Text>
                <Text style={styles.tallSubText}>
                  {primaryTask.scheduledTime || `${formatDurationMinutes(primaryTask.estimatedDuration || 30)}`}
                </Text>
                <Text style={styles.tallSubText}>
                  {primaryTask.category || 'General priority'}
                </Text>
              </View>

              <View style={styles.trainerRow}>
                <View style={[styles.avatarCircle, primaryTask.status === 'completed' && styles.avatarCircleDone]}>
                  <Ionicons
                    name={primaryTask.status === 'completed' ? 'checkmark' : 'person'}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerLabel}>Status</Text>
                  <Text style={styles.trainerName}>
                    {primaryTask.status === 'completed' ? 'Completed' : 'Tap to finish'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyTall}>
              <View style={styles.priorityPill}>
                <Text style={styles.priorityText}>Main Focus</Text>
              </View>
              <Text style={styles.tallTitle}>Plan first priority</Text>
              <Text style={styles.tallSubText}>Tap to add a commitment for {formattedDate}</Text>
              <View style={styles.emptyAddBtn}>
                <Ionicons name="add" size={20} color="#12131C" />
                <Text style={styles.emptyAddText}>Add Task</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Right Column: Light Blue card + Soft Pink action card */}
        <View style={styles.rightColumn}>
          {/* Top Right Card: Light Blue */}
          <TouchableOpacity
            style={styles.blueCard}
            onPress={() => {
              if (secondaryTask) {
                const isDone = secondaryTask.status === 'completed';
                if (isDone) reopenTask(secondaryTask.id);
                else completeTask(secondaryTask.id);
              } else {
                onAddTask();
              }
            }}
            activeOpacity={0.88}
          >
            {secondaryTask ? (
              <View style={styles.blueContent}>
                <View style={styles.priorityPill}>
                  <Text style={styles.priorityText}>{getPriorityLabel(secondaryTask.priority)}</Text>
                </View>
                <Text style={styles.blueTitle} numberOfLines={1}>
                  {secondaryTask.title}
                </Text>
                <Text style={styles.blueSubText}>{formattedDate}</Text>
                <Text style={styles.blueSubText}>
                  {secondaryTask.scheduledTime || `${formatDurationMinutes(secondaryTask.estimatedDuration || 25)}`}
                </Text>
                <Text style={styles.blueSubText}>{secondaryTask.category || 'Secondary'}</Text>
              </View>
            ) : (
              <View style={styles.blueContent}>
                <View style={styles.priorityPill}>
                  <Text style={styles.priorityText}>Light</Text>
                </View>
                <Text style={styles.blueTitle}>Balance</Text>
                <Text style={styles.blueSubText}>{formattedDate}</Text>
                <Text style={styles.blueSubText}>Open for deep work</Text>
              </View>
            )}

            {/* 3D spheres decorative accent */}
            <View style={styles.artSpheres}>
              <View style={styles.sphereBig} />
              <View style={styles.sphereSmall} />
            </View>
          </TouchableOpacity>

          {/* Bottom Right Card: Soft Pink Quick Action Hub */}
          <View style={styles.pinkCard}>
            <View style={styles.pinkIconsRow}>
              <TouchableOpacity
                style={styles.pinkIconCircle}
                onPress={onAddTask}
                activeOpacity={0.8}
                accessibilityLabel="Add new task"
              >
                <Ionicons name="add" size={18} color="#12131C" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pinkIconCircle}
                onPress={() => router.push('/focus/new' as any)}
                activeOpacity={0.8}
                accessibilityLabel="Start focus timer"
              >
                <Ionicons name="play" size={16} color="#12131C" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pinkIconCircle}
                onPress={() => router.push('/notes')}
                activeOpacity={0.8}
                accessibilityLabel="Open notes"
              >
                <Ionicons name="create-outline" size={16} color="#12131C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#12131C',
    letterSpacing: -0.4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#12131C',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tallPeachCard: {
    flex: 1.1,
    backgroundColor: '#FFBA59',
    borderRadius: 28,
    padding: 18,
    minHeight: 230,
    justifyContent: 'space-between',
    ...THEME.shadows.card,
  },
  tallContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  priorityPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12131C',
  },
  tallTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12131C',
    lineHeight: 24,
    marginBottom: 8,
  },
  tallSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 19, 28, 0.75)',
    marginTop: 2,
  },
  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#12131C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleDone: {
    backgroundColor: '#10B981',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(18, 19, 28, 0.6)',
  },
  trainerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#12131C',
  },
  emptyTall: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 14,
  },
  emptyAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#12131C',
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  blueCard: {
    backgroundColor: '#BCE2FF',
    borderRadius: 24,
    padding: 16,
    minHeight: 150,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...THEME.shadows.card,
  },
  blueContent: {
    zIndex: 2,
  },
  blueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#12131C',
    marginBottom: 4,
  },
  blueSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 19, 28, 0.75)',
    marginTop: 2,
  },
  artSpheres: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 52,
    height: 52,
    zIndex: 1,
  },
  sphereBig: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5C0A4',
    borderTopWidth: 4,
    borderTopColor: '#F7D6BD',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sphereSmall: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#5A8078',
    borderTopWidth: 3,
    borderTopColor: '#78A198',
    elevation: 4,
  },
  pinkCard: {
    backgroundColor: '#FFB4E8',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  pinkIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  pinkIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
});

