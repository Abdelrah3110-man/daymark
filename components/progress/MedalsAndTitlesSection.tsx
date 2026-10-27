import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useXPStore } from '@/store/xp-store';
import { useAppStore } from '@/store/app-store';
import { calculateLevelInfo, getMedalsWithStatus } from '@/constants/xp-rules';
import { AVATARS, getAvatarById, isAvatarUnlocked } from '@/constants/avatars';

export const MedalsAndTitlesSection: React.FC = () => {
  const { colors, isDark } = useTheme();
  const totalXP = useXPStore((s) => s.totalXP);
  const currentAvatarId = useAppStore((s) => s.settings.avatarId);
  const setAvatarId = useAppStore((s) => s.setAvatarId);

  const levelInfo = calculateLevelInfo(totalXP);
  const medals = getMedalsWithStatus(totalXP);

  return (
    <View style={styles.container}>
      {/* 1. Current Rank Title & Insignia Banner */}
      <View style={[styles.rankBanner, { backgroundColor: colors.lavender }]}>
        <View style={styles.rankBadgeRow}>
          <View style={[styles.rankIconCircle, { backgroundColor: colors.surface }]}>
            <Ionicons name="ribbon" size={24} color="#12131C" />
          </View>
          <View style={styles.rankTextWrap}>
            <Text style={styles.rankHeaderTag}>CURRENT HONORARY TITLE</Text>
            <Text style={styles.rankTitleEn}>{levelInfo.title}</Text>
            <Text style={styles.rankLevelSub}>
              Level {levelInfo.level} • {levelInfo.progressPercent}% to next rank
            </Text>
          </View>
        </View>

        <View style={styles.xpScorePill}>
          <Ionicons name="sparkles" size={14} color="#EAB308" />
          <Text style={styles.xpScoreText}>{totalXP} Total XP</Text>
        </View>
      </View>

      {/* 2. Medals & Insignias */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="medal-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Medals & Insignias</Text>
          </View>
          <Text style={[styles.sectionSubTitle, { color: colors.textMuted }]}>Milestone Honors</Text>
        </View>

        <View style={styles.medalsList}>
          {medals.map((medal) => (
            <View
              key={medal.id}
              style={[
                styles.medalRow,
                { borderColor: colors.border },
                medal.isUnlocked
                  ? [styles.medalRowUnlocked, { backgroundColor: colors.surfaceSecondary }]
                  : [styles.medalRowLocked, { backgroundColor: isDark ? '#141622' : '#F3F4F6' }],
              ]}
            >
              <View style={[styles.medalIconCircle, { backgroundColor: medal.isUnlocked ? medal.color : colors.border }]}>
                <Ionicons
                  name={medal.icon as any}
                  size={20}
                  color={medal.isUnlocked ? '#FFFFFF' : colors.textMuted}
                />
              </View>

              <View style={styles.medalInfoCol}>
                <View style={styles.medalTitleRow}>
                  <Text style={[styles.medalTitle, { color: colors.text }, !medal.isUnlocked && { color: colors.textMuted }]}>
                    {medal.title}
                  </Text>
                  {medal.isUnlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.unlockedText}>Earned</Text>
                    </View>
                  ) : (
                    <Text style={[styles.remainingText, { color: colors.textMuted }]}>{medal.remainingXP} XP needed</Text>
                  )}
                </View>

                <Text style={[styles.medalDesc, { color: colors.textSecondary }]}>{medal.description}</Text>

                {!medal.isUnlocked && (
                  <View style={[styles.medalProgressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.medalProgressFill, { width: `${medal.progress}%`, backgroundColor: colors.lavender }]} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Unlockable Avatars Gallery */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="people-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Avatar Collection</Text>
          </View>
          <Text style={[styles.sectionSubTitle, { color: colors.textMuted }]}>XP Unlocks</Text>
        </View>

        <Text style={[styles.galleryInstruction, { color: colors.textSecondary }]}>
          Equip any unlocked persona as your active profile avatar.
        </Text>

        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => {
            const unlocked = isAvatarUnlocked(avatar.id, totalXP);
            const isEquipped = currentAvatarId === avatar.id;

            return (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarCard,
                  { backgroundColor: avatar.bgColor },
                  isEquipped && styles.avatarCardEquipped,
                  !unlocked && styles.avatarCardLocked,
                ]}
                onPress={() => {
                  if (unlocked) {
                    setAvatarId(avatar.id);
                  }
                }}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                <Text style={styles.cardEmoji}>{avatar.emoji}</Text>
                <Text style={styles.cardName}>{avatar.name}</Text>
                <Text style={styles.cardTitle}>{avatar.title}</Text>

                {isEquipped ? (
                  <View style={styles.equippedBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    <Text style={styles.equippedText}>Equipped</Text>
                  </View>
                ) : unlocked ? (
                  <View style={styles.equipBtn}>
                    <Text style={styles.equipBtnText}>Equip</Text>
                  </View>
                ) : (
                  <View style={styles.lockedPill}>
                    <Ionicons name="lock-closed" size={11} color="#6B7280" />
                    <Text style={styles.lockedPillText}>{avatar.requiredXP} XP</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  rankBanner: {
    borderRadius: 26,
    padding: 20,
    marginBottom: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  rankBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  rankTextWrap: {
    flex: 1,
  },
  rankHeaderTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B2771',
    letterSpacing: 0.5,
  },
  rankTitleEn: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12131C',
    marginTop: 2,
  },
  rankLevelSub: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(18, 19, 28, 0.7)',
  },
  xpScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12131C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
  },
  xpScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionCard: {
    borderRadius: 26,
    padding: 20,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    ...THEME.shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  galleryInstruction: {
    fontSize: 13,
    marginBottom: 14,
  },
  medalsList: {
    gap: 12,
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  medalRowUnlocked: {},
  medalRowLocked: {
    opacity: 0.8,
  },
  medalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  medalInfoCol: {
    flex: 1,
  },
  medalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  medalDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  medalProgressBar: {
    height: 5,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  medalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarCard: {
    flex: 1,
    minWidth: '47%',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    ...THEME.shadows.subtle,
  },
  avatarCardEquipped: {
    borderColor: '#12131C',
  },
  avatarCardLocked: {
    opacity: 0.65,
  },
  cardEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#12131C',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(18, 19, 28, 0.65)',
    marginBottom: 10,
  },
  equippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12131C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  equippedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  equipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  equipBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12131C',
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lockedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
});
