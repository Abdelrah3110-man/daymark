import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useXPStore } from '@/store/xp-store';
import { useAppStore } from '@/store/app-store';
import { calculateLevelInfo, getMedalsWithStatus, LEVEL_TITLES_AR } from '@/constants/xp-rules';
import { AVATARS, getAvatarById, isAvatarUnlocked } from '@/constants/avatars';

export const MedalsAndTitlesSection: React.FC = () => {
  const totalXP = useXPStore((s) => s.totalXP);
  const currentAvatarId = useAppStore((s) => s.settings.avatarId);
  const setAvatarId = useAppStore((s) => s.setAvatarId);

  const levelInfo = calculateLevelInfo(totalXP);
  const titleAr = LEVEL_TITLES_AR[Math.min(10, levelInfo.level)] || 'المخطط البارع';
  const medals = getMedalsWithStatus(totalXP);
  const equippedAvatar = getAvatarById(currentAvatarId);

  return (
    <View style={styles.container}>
      {/* 1. Current Rank Title & Insignia Banner */}
      <View style={styles.rankBanner}>
        <View style={styles.rankBadgeRow}>
          <View style={styles.rankIconCircle}>
            <Ionicons name="ribbon" size={24} color="#12131C" />
          </View>
          <View style={styles.rankTextWrap}>
            <Text style={styles.rankHeaderTag}>CURRENT HONORARY RANK</Text>
            <Text style={styles.rankTitleAr}>{titleAr}</Text>
            <Text style={styles.rankTitleEn}>
              {levelInfo.title} • Level {levelInfo.level}
            </Text>
          </View>
        </View>

        <View style={styles.xpScorePill}>
          <Ionicons name="sparkles" size={14} color="#EAB308" />
          <Text style={styles.xpScoreText}>{totalXP} Total XP</Text>
        </View>
      </View>

      {/* 2. Medals & Insignias (نياشين وأوسمة الإنجاز) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="medal-outline" size={20} color="#12131C" />
            <Text style={styles.sectionTitle}>Medals & Insignias</Text>
          </View>
          <Text style={styles.sectionSubTitle}>نياشين الشرف التراكمية</Text>
        </View>

        <View style={styles.medalsList}>
          {medals.map((medal) => (
            <View
              key={medal.id}
              style={[styles.medalRow, medal.isUnlocked ? styles.medalRowUnlocked : styles.medalRowLocked]}
            >
              <View style={[styles.medalIconCircle, { backgroundColor: medal.isUnlocked ? medal.color : '#E5E7EB' }]}>
                <Ionicons
                  name={medal.icon as any}
                  size={20}
                  color={medal.isUnlocked ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>

              <View style={styles.medalInfoCol}>
                <View style={styles.medalTitleRow}>
                  <Text style={[styles.medalTitle, !medal.isUnlocked && styles.textMuted]}>
                    {medal.titleAr}
                  </Text>
                  {medal.isUnlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.unlockedText}>Acquired</Text>
                    </View>
                  ) : (
                    <Text style={styles.remainingText}>{medal.remainingXP} XP needed</Text>
                  )}
                </View>

                <Text style={styles.medalDesc}>{medal.descriptionAr}</Text>

                {!medal.isUnlocked && (
                  <View style={styles.medalProgressBar}>
                    <View style={[styles.medalProgressFill, { width: `${medal.progress}%` }]} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Unlockable Avatars Gallery (أفاتارات تفتح بالـ XP) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="people-outline" size={20} color="#12131C" />
            <Text style={styles.sectionTitle}>Avatar Collection</Text>
          </View>
          <Text style={styles.sectionSubTitle}>أفاتارات تفتح بالـ XP</Text>
        </View>

        <Text style={styles.galleryInstruction}>
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
    backgroundColor: '#C8B6FF',
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
    backgroundColor: '#FFFFFF',
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
  rankTitleAr: {
    fontSize: 18,
    fontWeight: '800',
    color: '#12131C',
    marginTop: 2,
  },
  rankTitleEn: {
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
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#ECEEF5',
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
    color: '#12131C',
    letterSpacing: -0.3,
  },
  sectionSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E92A4',
  },
  galleryInstruction: {
    fontSize: 13,
    color: '#6B7082',
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
  medalRowUnlocked: {
    backgroundColor: '#F9FAFC',
    borderColor: '#E5E7EB',
  },
  medalRowLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
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
    color: '#12131C',
  },
  textMuted: {
    color: '#6B7280',
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
    color: '#8E92A4',
  },
  medalDesc: {
    fontSize: 12,
    color: '#6B7082',
    marginTop: 2,
    lineHeight: 16,
  },
  medalProgressBar: {
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  medalProgressFill: {
    height: '100%',
    backgroundColor: '#C8B6FF',
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
