import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ACHIEVEMENTS } from '@/constants/xp-rules';

interface AchievementsSectionProps {
  stats: {
    totalTasksCompleted: number;
    totalFocusMinutes: number;
    completedHabitCount: number;
    weeklyPlansPrepared: number;
    weeklyReviewsCompleted: number;
    consecutiveDaysPlanned: number;
  };
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>ACHIEVEMENTS</Text>
      <View style={styles.list}>
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = ach.checkUnlocked(stats);
          return (
            <View
              key={ach.id}
              style={[styles.itemCard, !unlocked && styles.itemCardLocked]}
            >
              <View
                style={[
                  styles.iconWrap,
                  unlocked ? styles.iconWrapUnlocked : styles.iconWrapLocked,
                ]}
              >
                <Ionicons
                  name={unlocked ? 'trophy' : 'lock-closed-outline'}
                  size={18}
                  color={unlocked ? THEME.colors.peachDark : THEME.colors.textLight}
                />
              </View>

              <View style={styles.contentWrap}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !unlocked && styles.textLocked]}>{ach.title}</Text>
                  {unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>UNLOCKED</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.description, !unlocked && styles.textLocked]}>
                  {ach.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.xl,
  },
  heading: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: THEME.spacing.sm,
  },
  list: {
    gap: THEME.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  itemCardLocked: {
    opacity: 0.6,
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  iconWrapUnlocked: {
    backgroundColor: THEME.colors.peachLight,
  },
  iconWrapLocked: {
    backgroundColor: THEME.colors.border,
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...THEME.typography.bodyLg,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  description: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  textLocked: {
    color: THEME.colors.textMuted,
  },
  unlockedBadge: {
    backgroundColor: THEME.colors.mintLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
  },
  unlockedText: {
    ...THEME.typography.micro,
    color: THEME.colors.mintDark,
    fontWeight: '800',
  },
});
