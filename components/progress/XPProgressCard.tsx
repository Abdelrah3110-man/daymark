import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { calculateLevelInfo } from '@/constants/xp-rules';
import { useXPStore } from '@/store/xp-store';

export const XPProgressCard: React.FC = () => {
  const { colors, isDark } = useTheme();
  const totalXP = useXPStore((s) => s.totalXP);
  const transactions = useXPStore((s) => s.transactions);
  const levelInfo = calculateLevelInfo(totalXP);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.levelBadge, { backgroundColor: colors.lavender }]}>
          <Text style={[styles.levelNum, { color: colors.lavenderDark }]}>LVL {levelInfo.level}</Text>
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.levelTitle, { color: colors.text }]}>{levelInfo.title}</Text>
          <Text style={[styles.xpText, { color: colors.textMuted }]}>
            {levelInfo.totalXP} Total XP • {levelInfo.nextLevelXP - levelInfo.totalXP} XP to Level {levelInfo.level + 1}
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={[styles.fill, { width: `${levelInfo.progressPercent}%`, backgroundColor: colors.lavender }]} />
      </View>

      {transactions.length > 0 && (
        <View style={[styles.recentWrap, { borderTopColor: colors.borderSubtle }]}>
          <Text style={[styles.recentHeading, { color: colors.textMuted }]}>RECENT ACTIVITY REWARDS</Text>
          {transactions.slice(0, 3).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <Ionicons name="sparkles" size={12} color={colors.lavenderDark} />
              <Text style={[styles.txReason, { color: colors.textSecondary }]} numberOfLines={1}>
                {tx.reason}
              </Text>
              <Text style={[styles.txAmount, { color: colors.lavenderDark }]}>+{tx.amount} XP</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C3BAF7',
  },
  levelNum: {
    ...THEME.typography.h3,
    fontSize: 14,
    color: THEME.colors.lavenderDark,
    fontWeight: '800',
  },
  titleWrap: {
    flex: 1,
  },
  levelTitle: {
    ...THEME.typography.h2,
    fontSize: 20,
    color: THEME.colors.text,
  },
  xpText: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  track: {
    height: 8,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: THEME.colors.lavenderDark,
    borderRadius: 4,
  },
  recentWrap: {
    marginTop: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
  },
  recentHeading: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 6,
  },
  txReason: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  txAmount: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.lavenderDark,
  },
});

