import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/task-store';
import { useXPStore } from '@/store/xp-store';
import { useAppStore } from '@/store/app-store';
import { getTodayKey, formatDayShort } from '@/utils/dates';
import { calculateLevelInfo } from '@/constants/xp-rules';
import { getAvatarById } from '@/constants/avatars';
import { saveItem } from '@/services/persistence';

export type WidgetType = 'today_tasks' | 'xp_streak' | 'quick_actions';
export type WidgetTheme = 'pastel' | 'dark' | 'light';
export type WidgetSize = 'medium' | 'small';

export default function WidgetStudioScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const tasks = useTaskStore((s) => s.tasks);
  const totalXP = useXPStore((s) => s.totalXP);

  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType>('today_tasks');
  const [selectedTheme, setSelectedTheme] = useState<WidgetTheme>('pastel');
  const [selectedSize, setSelectedSize] = useState<WidgetSize>('medium');
  const [syncedNotice, setSyncedNotice] = useState('');

  const todayKey = getTodayKey();
  const todayTasks = tasks.filter((t) => t.scheduledDate === todayKey && t.status !== 'cancelled');
  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const primaryTask = todayTasks[0];
  const secondaryTask = todayTasks[1];

  const levelInfo = calculateLevelInfo(totalXP);
  const avatar = getAvatarById(settings.avatarId);

  const handleSyncWidget = async () => {
    // Save widget payload to local persistent storage for native bridge/app widget
    const widgetPayload = {
      type: selectedWidgetType,
      theme: selectedTheme,
      size: selectedSize,
      updatedAt: new Date().toISOString(),
      user: {
        name: settings.displayName || 'Planner',
        avatarEmoji: avatar.emoji,
        totalXP,
        level: levelInfo.level,
        rankTitle: levelInfo.title,
      },
      tasks: {
        total: todayTasks.length,
        completed: completedCount,
        primaryTitle: primaryTask?.title || 'No tasks scheduled yet',
        primaryTime: primaryTask?.scheduledTime || '',
        secondaryTitle: secondaryTask?.title || '',
      },
    };

    await saveItem('daymark_widget_data', widgetPayload);
    setSyncedNotice('Widget data synchronized and cached successfully!');
    setTimeout(() => setSyncedNotice(''), 3500);
  };

  const getWidgetThemeStyles = () => {
    switch (selectedTheme) {
      case 'dark':
        return {
          bg: '#12141F',
          text: '#FFFFFF',
          textMuted: '#9CA3AF',
          pillBg: '#1E2132',
          border: '#282C40',
        };
      case 'light':
        return {
          bg: '#FFFFFF',
          text: '#12131C',
          textMuted: '#6B7280',
          pillBg: '#F3F4F6',
          border: '#E5E7EB',
        };
      case 'pastel':
      default:
        return {
          bg: selectedWidgetType === 'today_tasks' ? '#FFBA59' : selectedWidgetType === 'xp_streak' ? '#C8B6FF' : '#FFB4E8',
          text: '#12131C',
          textMuted: 'rgba(18, 19, 28, 0.7)',
          pillBg: 'rgba(255, 255, 255, 0.65)',
          border: 'rgba(0, 0, 0, 0.08)',
        };
    }
  };

  const widgetTheme = getWidgetThemeStyles();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Home Screen Widgets</Text>
        <View style={{ width: 36 }} />
      </View>

      {syncedNotice ? (
        <View style={[styles.noticeBanner, { backgroundColor: colors.successLight }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.noticeText, { color: colors.success }]}>{syncedNotice}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introWrap}>
          <Text style={[styles.mainHeading, { color: colors.text }]}>Mobile Widget Studio</Text>
          <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
            Customize your phone home screen widgets to quickly glance at today's agenda, your XP rank, and quick actions right from your home screen.
          </Text>
        </View>

        {/* 1. Live Interactive Widget Phone Preview */}
        <View style={styles.previewContainer}>
          <Text style={[styles.previewTag, { color: colors.textSecondary }]}>Live Phone Widget Preview</Text>

          <View
            style={[
              styles.widgetBox,
              selectedSize === 'small' ? styles.widgetBoxSmall : styles.widgetBoxMedium,
              { backgroundColor: widgetTheme.bg, borderColor: widgetTheme.border },
            ]}
          >
            {/* Today Tasks Widget Content */}
            {selectedWidgetType === 'today_tasks' && (
              <View style={styles.widgetContent}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.pillBadge, { backgroundColor: widgetTheme.pillBg }]}>
                    <Ionicons name="calendar-outline" size={12} color={widgetTheme.text} />
                    <Text style={[styles.pillText, { color: widgetTheme.text }]}>{formatDayShort(todayKey)}</Text>
                  </View>
                  <View style={[styles.pillBadge, { backgroundColor: widgetTheme.pillBg }]}>
                    <Text style={[styles.pillText, { color: widgetTheme.text }]}>
                      {completedCount}/{todayTasks.length} Done
                    </Text>
                  </View>
                </View>

                <View style={styles.widgetTaskSection}>
                  <Text style={[styles.widgetMainTitle, { color: widgetTheme.text }]} numberOfLines={1}>
                    {primaryTask ? primaryTask.title : 'No tasks planned'}
                  </Text>
                  <Text style={[styles.widgetSubText, { color: widgetTheme.textMuted }]}>
                    {primaryTask?.scheduledTime || 'Top priority commitment'}
                  </Text>
                </View>

                {selectedSize === 'medium' && secondaryTask && (
                  <View style={[styles.secondaryTaskRow, { backgroundColor: widgetTheme.pillBg }]}>
                    <Ionicons name="radio-button-off" size={12} color={widgetTheme.text} />
                    <Text style={[styles.secondaryText, { color: widgetTheme.text }]} numberOfLines={1}>
                      {secondaryTask.title}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* XP & Streak Widget Content */}
            {selectedWidgetType === 'xp_streak' && (
              <View style={styles.widgetContent}>
                <View style={styles.widgetTopRow}>
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  <View style={[styles.pillBadge, { backgroundColor: widgetTheme.pillBg }]}>
                    <Text style={[styles.pillText, { color: widgetTheme.text }]}>Level {levelInfo.level}</Text>
                  </View>
                </View>

                <View style={styles.widgetTaskSection}>
                  <Text style={[styles.widgetMainTitle, { color: widgetTheme.text }]}>
                    {levelInfo.title}
                  </Text>
                  <Text style={[styles.widgetSubText, { color: widgetTheme.textMuted }]}>
                    ⚡ {totalXP} Total XP • 🔥 Streak: 7 Days
                  </Text>
                </View>
              </View>
            )}

            {/* Quick Actions Widget Content */}
            {selectedWidgetType === 'quick_actions' && (
              <View style={styles.widgetContent}>
                <Text style={[styles.widgetMainTitle, { color: widgetTheme.text, marginBottom: 8 }]}>
                  DAYMARK Quick Hub
                </Text>

                <View style={styles.quickIconsRow}>
                  <View style={[styles.quickIconCircle, { backgroundColor: widgetTheme.pillBg }]}>
                    <Ionicons name="add" size={18} color={widgetTheme.text} />
                  </View>
                  <View style={[styles.quickIconCircle, { backgroundColor: widgetTheme.pillBg }]}>
                    <Ionicons name="play" size={16} color={widgetTheme.text} />
                  </View>
                  <View style={[styles.quickIconCircle, { backgroundColor: widgetTheme.pillBg }]}>
                    <Ionicons name="create-outline" size={16} color={widgetTheme.text} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 2. Customization Controls */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Widget Type Selector */}
          <Text style={[styles.controlLabel, { color: colors.text }]}>1. Widget Type</Text>
          <View style={styles.segmentedRow}>
            {[
              { id: 'today_tasks' as const, label: "Today's Tasks", icon: 'checkbox-outline' },
              { id: 'xp_streak' as const, label: 'XP & Rank', icon: 'ribbon-outline' },
              { id: 'quick_actions' as const, label: 'Quick Actions', icon: 'flash-outline' },
            ].map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.segmentBtn,
                  { backgroundColor: selectedWidgetType === t.id ? (isDark ? '#FFFFFF' : '#12131C') : colors.surfaceSecondary },
                ]}
                onPress={() => setSelectedWidgetType(t.id)}
              >
                <Ionicons
                  name={t.icon as any}
                  size={14}
                  color={selectedWidgetType === t.id ? (isDark ? '#12131C' : '#FFFFFF') : colors.textMuted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: selectedWidgetType === t.id ? (isDark ? '#12131C' : '#FFFFFF') : colors.textSecondary },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Theme Selector */}
          <Text style={[styles.controlLabel, { color: colors.text, marginTop: 16 }]}>
            2. Widget Theme
          </Text>
          <View style={styles.segmentedRow}>
            {[
              { id: 'pastel' as const, label: 'Pastel 🎨' },
              { id: 'dark' as const, label: 'Midnight Dark 🌙' },
              { id: 'light' as const, label: 'Crisp Light ☀️' },
            ].map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.segmentBtn,
                  { backgroundColor: selectedTheme === theme.id ? (isDark ? '#FFFFFF' : '#12131C') : colors.surfaceSecondary },
                ]}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: selectedTheme === theme.id ? (isDark ? '#12131C' : '#FFFFFF') : colors.textSecondary },
                  ]}
                >
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Size Selector */}
          <Text style={[styles.controlLabel, { color: colors.text, marginTop: 16 }]}>
            3. Widget Size
          </Text>
          <View style={styles.segmentedRow}>
            {[
              { id: 'medium' as const, label: 'Wide (4x2)' },
              { id: 'small' as const, label: 'Compact (2x2)' },
            ].map((sz) => (
              <TouchableOpacity
                key={sz.id}
                style={[
                  styles.segmentBtn,
                  { backgroundColor: selectedSize === sz.id ? (isDark ? '#FFFFFF' : '#12131C') : colors.surfaceSecondary },
                ]}
                onPress={() => setSelectedSize(sz.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: selectedSize === sz.id ? (isDark ? '#12131C' : '#FFFFFF') : colors.textSecondary },
                  ]}
                >
                  {sz.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sync Button */}
          <TouchableOpacity
            style={[styles.syncBtn, { backgroundColor: colors.text }]}
            onPress={handleSyncWidget}
            activeOpacity={0.85}
          >
            <Ionicons name="sync" size={18} color={colors.textInverse} />
            <Text style={[styles.syncBtnText, { color: colors.textInverse }]}>Sync Widget Data</Text>
          </TouchableOpacity>
        </View>

        {/* 3. How to Add to Phone Home Screen Instructions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>
            📱 How to Add DAYMARK Widget to Your Phone Home Screen:
          </Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.lavender }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepItemText, { color: colors.textSecondary }]}>
                Go to your phone's Home Screen and touch and hold an empty space.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.lavender }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepItemText, { color: colors.textSecondary }]}>
                Tap the <Text style={{ fontWeight: '700', color: colors.text }}>Widgets</Text> button or the (+) icon at the top of your screen.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.lavender }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepItemText, { color: colors.textSecondary }]}>
                Search for <Text style={{ fontWeight: '700', color: colors.text }}>DAYMARK</Text>, choose your preferred size, and drag it onto your home screen.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  introWrap: {
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subHeading: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  previewTag: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  widgetBox: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    ...THEME.shadows.card,
    justifyContent: 'space-between',
  },
  widgetBoxMedium: {
    width: '100%',
    height: 140,
  },
  widgetBoxSmall: {
    width: 170,
    height: 170,
  },
  widgetContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  widgetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  widgetTaskSection: {
    marginVertical: 4,
  },
  widgetMainTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  widgetSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  secondaryTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  quickIconsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    ...THEME.shadows.subtle,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    ...THEME.shadows.subtle,
  },
  syncBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepsList: {
    gap: 12,
    marginTop: 6,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#12131C',
  },
  stepItemText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
