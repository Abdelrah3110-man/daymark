import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/app-store';
import { useXPStore } from '@/store/xp-store';
import { exportAllDaymarkData } from '@/services/persistence';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AVATARS, getAvatarById, isAvatarUnlocked } from '@/constants/avatars';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAllData = useAppStore((s) => s.resetAllApplicationData);
  const totalXP = useXPStore((s) => s.totalXP);

  const [displayName, setDisplayName] = useState(settings.displayName || '');
  const [birthDate, setBirthDate] = useState(settings.birthDate || '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');

  const currentAvatar = getAvatarById(settings.avatarId);

  const handleSaveProfile = () => {
    updateSettings({
      displayName: displayName.trim(),
      birthDate: birthDate.trim(),
    });
    setSaveFeedback('Profile saved successfully.');
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ themePreference: theme });
    setSaveFeedback(`Theme set to ${theme === 'dark' ? 'Dark' : 'Light'} mode.`);
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  const handleSelectAvatar = (avatarId: string) => {
    if (!isAvatarUnlocked(avatarId, totalXP)) {
      const target = getAvatarById(avatarId);
      Alert.alert('Avatar Locked', `Requires ${target.requiredXP} XP to unlock. Keep completing tasks to unlock it!`);
      return;
    }
    updateSettings({ avatarId });
    setSaveFeedback('Avatar updated.');
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  const handleWeekStartChange = (day: 0 | 1 | 6) => {
    updateSettings({ weekStartDay: day });
  };

  const handleAvailabilityChange = (mins: number) => {
    updateSettings({ dailyAvailabilityMinutes: mins });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const jsonDump = await exportAllDaymarkData();
      await Share.share({
        title: 'Daymark Data Export',
        message: jsonDump,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Could not export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = async () => {
    setShowClearConfirm(false);
    await resetAllData();
    Alert.alert('Data Cleared', 'All local Daymark data has been reset to an empty state.');
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      {saveFeedback ? (
        <View style={styles.feedbackBanner}>
          <Ionicons name="checkmark-circle" size={16} color={THEME.colors.success} />
          <Text style={styles.feedbackText}>{saveFeedback}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>PROFILE & IDENTITY</Text>

          {/* Current Avatar Preview */}
          <View style={styles.avatarRow}>
            <View style={[styles.avatarBadge, { backgroundColor: currentAvatar.bgColor }]}>
              <Text style={styles.avatarEmojiLarge}>{currentAvatar.emoji}</Text>
            </View>
            <View style={styles.avatarTextCol}>
              <Text style={styles.avatarTitle}>{currentAvatar.name}</Text>
              <Text style={styles.avatarSubtitle}>{currentAvatar.title}</Text>
            </View>
          </View>

          {/* Avatars Selector */}
          <Text style={styles.label}>Choose Avatar Persona</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
            {AVATARS.map((a) => {
              const unlocked = isAvatarUnlocked(a.id, totalXP);
              const isSelected = settings.avatarId === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.avatarMiniCard,
                    { backgroundColor: a.bgColor },
                    isSelected && styles.avatarMiniCardSelected,
                    !unlocked && styles.avatarMiniCardLocked,
                  ]}
                  onPress={() => handleSelectAvatar(a.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarMiniEmoji}>{a.emoji}</Text>
                  <Text style={styles.avatarMiniName} numberOfLines={1}>{a.name}</Text>
                  {!unlocked ? (
                    <View style={styles.lockBadgeMini}>
                      <Ionicons name="lock-closed" size={10} color="#6B7280" />
                      <Text style={styles.lockTextMini}>{a.requiredXP} XP</Text>
                    </View>
                  ) : isSelected ? (
                    <View style={styles.checkBadgeMini}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sandra"
            placeholderTextColor={THEME.colors.textLight}
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={handleSaveProfile}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1998-05-25"
            placeholderTextColor={THEME.colors.textLight}
            value={birthDate}
            onChangeText={setBirthDate}
            onBlur={handleSaveProfile}
          />

          <TouchableOpacity
            style={styles.reopenOnboardingBtn}
            onPress={() => router.push('/onboarding')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color="#432C81" />
            <Text style={styles.reopenOnboardingText}>
              فتح شاشة التسجيل واختيار الأفاتار (Onboarding Setup)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appearance & Dark Mode */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>APPEARANCE (DARK MODE)</Text>
          <Text style={styles.label}>Theme Preference</Text>
          <View style={styles.pillRow}>
            {[
              { label: '☀️ Light', value: 'light' as const },
              { label: '🌙 Dark', value: 'dark' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.pill,
                  settings.themePreference === item.value && styles.pillActive,
                ]}
                onPress={() => handleThemeChange(item.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    settings.themePreference === item.value && styles.pillTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Planning Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>WEEKLY PLANNING PREFERENCES</Text>

          <Text style={styles.label}>Week Starts On</Text>
          <View style={styles.pillRow}>
            {[
              { label: 'Sunday', value: 0 as const },
              { label: 'Monday', value: 1 as const },
              { label: 'Saturday', value: 6 as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.pill,
                  settings.weekStartDay === item.value && styles.pillActive,
                ]}
                onPress={() => handleWeekStartChange(item.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    settings.weekStartDay === item.value && styles.pillTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Daily Workload Availability Limit</Text>
          <View style={styles.pillRow}>
            {[
              { label: '6 Hours', value: 360 },
              { label: '8 Hours (Std)', value: 480 },
              { label: '10 Hours', value: 600 },
              { label: '12 Hours', value: 720 },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.pill,
                  settings.dailyAvailabilityMinutes === item.value && styles.pillActive,
                ]}
                onPress={() => handleAvailabilityChange(item.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    settings.dailyAvailabilityMinutes === item.value && styles.pillTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>OFFLINE DATA & PRIVACY</Text>
          <Text style={styles.privacyNote}>
            Daymark operates strictly offline. All data is saved on your device in local storage. No servers, accounts, or trackers are utilized.
          </Text>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Ionicons name="download-outline" size={18} color={THEME.colors.text} />
            <Text style={styles.exportBtnText}>
              {isExporting ? 'Generating JSON...' : 'Export Local Data (JSON)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.sectionHeading, { color: THEME.colors.danger }]}>DANGER ZONE</Text>
          <Text style={styles.dangerNote}>
            Permanently clear all tasks, notes, goals, habits, focus logs, and earned XP. This cannot be undone.
          </Text>

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setShowClearConfirm(true)}
          >
            <Ionicons name="trash-outline" size={18} color={THEME.colors.textInverse} />
            <Text style={styles.clearBtnText}>Clear All Application Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={showClearConfirm}
        title="Reset All Data?"
        message="This will irrevocably delete all planned tasks, notes, habits, focus sessions, and XP achievements from this device. Are you sure?"
        confirmLabel="Yes, Clear Everything"
        cancelLabel="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
        isDestructive
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
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.successLight,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 10,
    gap: 8,
  },
  feedbackText: {
    ...THEME.typography.caption,
    color: THEME.colors.success,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  sectionHeading: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    fontWeight: '800',
    marginBottom: THEME.spacing.md,
    letterSpacing: 0.5,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  avatarBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...THEME.shadows.subtle,
  },
  avatarEmojiLarge: {
    fontSize: 30,
  },
  avatarTextCol: {
    flex: 1,
  },
  avatarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  avatarSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  avatarScroll: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  avatarMiniCard: {
    width: 74,
    height: 84,
    borderRadius: 18,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarMiniCardSelected: {
    borderColor: '#12131C',
    transform: [{ scale: 1.05 }],
  },
  avatarMiniCardLocked: {
    opacity: 0.55,
  },
  avatarMiniEmoji: {
    fontSize: 26,
    marginBottom: 2,
  },
  avatarMiniName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#12131C',
  },
  lockBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    marginTop: 2,
    gap: 2,
  },
  lockTextMini: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B7280',
  },
  checkBadgeMini: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#12131C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 12,
    ...THEME.typography.body,
    color: THEME.colors.text,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  reopenOnboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D8CEFC',
  },
  reopenOnboardingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#432C81',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  pill: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
  pillText: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: '700',
  },
  privacyNote: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.pill,
    gap: 8,
  },
  exportBtnText: {
    ...THEME.typography.bodySm,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  dangerCard: {
    borderColor: THEME.colors.dangerLight,
  },
  dangerNote: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.danger,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.pill,
    gap: 8,
  },
  clearBtnText: {
    ...THEME.typography.bodySm,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});
