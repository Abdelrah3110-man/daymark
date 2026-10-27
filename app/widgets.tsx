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
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/task-store';
import { useXPStore } from '@/store/xp-store';
import { useAppStore } from '@/store/app-store';
import { getTodayKey, formatDayShort, formatDurationMinutes } from '@/utils/dates';
import { calculateLevelInfo, LEVEL_TITLES_AR } from '@/constants/xp-rules';
import { getAvatarById } from '@/constants/avatars';
import { saveItem } from '@/services/persistence';

export type WidgetType = 'today_tasks' | 'xp_streak' | 'quick_actions';
export type WidgetTheme = 'pastel' | 'dark' | 'light';
export type WidgetSize = 'medium' | 'small';

export default function WidgetStudioScreen() {
  const router = useRouter();
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
  const titleAr = LEVEL_TITLES_AR[Math.min(10, levelInfo.level)] || 'المخطط البارع';
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
        rankTitle: titleAr,
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
    setSyncedNotice('تمت مزامنة بيانات الويدجت بنجاح وتحديث الكاش!');
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: THEME.colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: THEME.colors.surface, borderBottomColor: THEME.colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: THEME.colors.text }]}>ويدجت الشاشة الرئيسية (Home Widgets)</Text>
        <View style={{ width: 36 }} />
      </View>

      {syncedNotice ? (
        <View style={styles.noticeBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.noticeText}>{syncedNotice}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introWrap}>
          <Text style={[styles.mainHeading, { color: THEME.colors.text }]}>استوديو ويدجت الموبايل</Text>
          <Text style={[styles.subHeading, { color: THEME.colors.textMuted }]}>
            خصص مظهر الويدجت التفاعلي وضعه على الشاشة الرئيسية لهاتفك للوصول السريع لمهامك ونقاطك دون فتح التطبيق!
          </Text>
        </View>

        {/* 1. Live Interactive Widget Phone Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTag}>معاينة حية لشكل الويدجت على هاتفك</Text>

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
                    {titleAr}
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
        <View style={[styles.card, { backgroundColor: THEME.colors.surface, borderColor: THEME.colors.border }]}>
          {/* Widget Type Selector */}
          <Text style={[styles.controlLabel, { color: THEME.colors.text }]}>1. نوع الويدجت (Widget Type)</Text>
          <View style={styles.segmentedRow}>
            {[
              { id: 'today_tasks' as const, label: 'مهام اليوم', icon: 'checkbox-outline' },
              { id: 'xp_streak' as const, label: 'الرتبة والـ XP', icon: 'ribbon-outline' },
              { id: 'quick_actions' as const, label: 'إجراءات سريعة', icon: 'flash-outline' },
            ].map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.segmentBtn,
                  selectedWidgetType === t.id && styles.segmentBtnActive,
                ]}
                onPress={() => setSelectedWidgetType(t.id)}
              >
                <Ionicons
                  name={t.icon as any}
                  size={14}
                  color={selectedWidgetType === t.id ? '#FFFFFF' : THEME.colors.textMuted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    selectedWidgetType === t.id && styles.segmentTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Theme Selector */}
          <Text style={[styles.controlLabel, { color: THEME.colors.text, marginTop: 16 }]}>
            2. مظهر الويدجت (Widget Theme)
          </Text>
          <View style={styles.segmentedRow}>
            {[
              { id: 'pastel' as const, label: 'باستيل روناسيت 🎨' },
              { id: 'dark' as const, label: 'ميدنايت داكن 🌙' },
              { id: 'light' as const, label: 'أبيض ناصع ☀️' },
            ].map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.segmentBtn,
                  selectedTheme === theme.id && styles.segmentBtnActive,
                ]}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selectedTheme === theme.id && styles.segmentTextActive,
                  ]}
                >
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Size Selector */}
          <Text style={[styles.controlLabel, { color: THEME.colors.text, marginTop: 16 }]}>
            3. حجم الويدجت (Widget Size)
          </Text>
          <View style={styles.segmentedRow}>
            {[
              { id: 'medium' as const, label: 'مستطيل عريض (4x2)' },
              { id: 'small' as const, label: 'مربع مدمج (2x2)' },
            ].map((sz) => (
              <TouchableOpacity
                key={sz.id}
                style={[
                  styles.segmentBtn,
                  selectedSize === sz.id && styles.segmentBtnActive,
                ]}
                onPress={() => setSelectedSize(sz.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selectedSize === sz.id && styles.segmentTextActive,
                  ]}
                >
                  {sz.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sync Button */}
          <TouchableOpacity style={styles.syncBtn} onPress={handleSyncWidget} activeOpacity={0.85}>
            <Ionicons name="sync" size={18} color="#FFFFFF" />
            <Text style={styles.syncBtnText}>تحديث وحفظ بيانات الويدجت (Sync Data)</Text>
          </TouchableOpacity>
        </View>

        {/* 3. How to Add to Phone Home Screen Instructions */}
        <View style={[styles.card, { backgroundColor: THEME.colors.surface, borderColor: THEME.colors.border }]}>
          <Text style={[styles.controlLabel, { color: THEME.colors.text }]}>
            📱 كيفية إضافة الويدجت على شاشة هاتفك الرئيسية:
          </Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={[styles.stepItemText, { color: THEME.colors.text }]}>
                اذهب إلى الشاشة الرئيسية لهاتفك (Home Screen) واضغط مطولاً في أي مساحة فارغة.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={[styles.stepItemText, { color: THEME.colors.text }]}>
                اضغط على زر **Widgets (الأدوات/التطبيقات المصغرة)** أو علامة (+) في أعلى الشاشة.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={[styles.stepItemText, { color: THEME.colors.text }]}>
                ابحث عن تطبيق **DAYMARK** واختر الحجم والمظهر ثم اسحبه وضعْه على شاشتك.
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
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introWrap: {
    marginBottom: 16,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
  },
  subHeading: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    textAlign: 'right',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  widgetBox: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    justifyContent: 'space-between',
    ...THEME.shadows.floating,
  },
  widgetBoxMedium: {
    width: '100%',
    maxWidth: 360,
    minHeight: 145,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  widgetTaskSection: {
    marginVertical: 8,
  },
  widgetMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  widgetSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  secondaryTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  quickIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    ...THEME.shadows.subtle,
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'right',
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 5,
  },
  segmentBtnActive: {
    backgroundColor: '#12131C',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12131C',
    paddingVertical: 14,
    borderRadius: 22,
    marginTop: 20,
    gap: 8,
    ...THEME.shadows.subtle,
  },
  syncBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepsList: {
    gap: 12,
    marginTop: 6,
  },
  stepItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C8B6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#12131C',
  },
  stepItemText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    textAlign: 'right',
  },
});
