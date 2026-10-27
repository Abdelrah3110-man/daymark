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
import { exportAllDaymarkData } from '@/services/persistence';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAllData = useAppStore((s) => s.resetAllApplicationData);

  const [displayName, setDisplayName] = useState(settings.displayName || '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');

  const handleSaveProfile = () => {
    updateSettings({ displayName: displayName.trim() });
    setSaveFeedback('Settings saved successfully.');
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
          <Text style={styles.sectionHeading}>PROFILE</Text>
          <Text style={styles.label}>Display Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex"
            placeholderTextColor={THEME.colors.textLight}
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={handleSaveProfile}
          />
          <Text style={styles.helpText}>Used to greet you on the home dashboard.</Text>
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showClearConfirm}
        title="Clear All Application Data?"
        message="This will completely erase all your tasks, weekly plans, notes, goals, habits, focus logs, and XP. You will start with a fresh, empty workspace."
        confirmLabel="Erase Everything"
        isDestructive
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
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
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
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
    backgroundColor: THEME.colors.mintLight,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    gap: 8,
  },
  feedbackText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.mintDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
    gap: THEME.spacing.md,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  dangerCard: {
    borderColor: THEME.colors.dangerLight,
    backgroundColor: '#FFF8F8',
  },
  sectionHeading: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: THEME.spacing.sm,
  },
  label: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: THEME.spacing.sm,
  },
  input: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    ...THEME.typography.body,
    color: THEME.colors.text,
  },
  helpText: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  pillActive: {
    backgroundColor: THEME.colors.text,
  },
  pillText: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: THEME.colors.textInverse,
  },
  privacyNote: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.pill,
    gap: 6,
  },
  exportBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  dangerNote: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.danger,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.pill,
    gap: 6,
  },
  clearBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});

