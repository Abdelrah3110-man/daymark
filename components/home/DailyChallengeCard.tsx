import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/app-store';
import { getTodayKey } from '@/utils/dates';

export const DailyChallengeCard: React.FC = () => {
  const settings = useAppStore((s) => s.settings);
  const setDailyChallenge = useAppStore((s) => s.setDailyChallenge);
  const toggleCompleted = useAppStore((s) => s.toggleDailyChallengeCompleted);

  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(settings.dailyChallengeText || '');

  const todayKey = getTodayKey();
  const isCompleted = settings.dailyChallengeCompletedDate === todayKey;
  const hasChallenge = Boolean(settings.dailyChallengeText && settings.dailyChallengeText.trim());

  const handleSave = () => {
    setDailyChallenge(inputText);
    setIsEditing(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={13} color={THEME.colors.lavenderDark} />
          <Text style={styles.badgeText}>DAILY COMMITMENT</Text>
        </View>

        {!isEditing && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setInputText(settings.dailyChallengeText || '');
              setIsEditing(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={16} color={THEME.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editWrap}>
          <TextInput
            style={styles.input}
            placeholder="What is your single most important intention today?"
            placeholderTextColor={THEME.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            autoFocus
            multiline
          />
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Set Commitment</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : hasChallenge ? (
        <TouchableOpacity
          style={styles.challengeRow}
          onPress={toggleCompleted}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
            {isCompleted && <Ionicons name="checkmark" size={16} color={THEME.colors.textInverse} />}
          </View>
          <Text style={[styles.challengeText, isCompleted && styles.challengeTextDone]}>
            {settings.dailyChallengeText}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.emptyPrompt}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyTitle}>Set today's primary intention</Text>
          <Text style={styles.emptySub}>
            Choose one decisive commitment to focus on and conquer today.
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.lavender,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#C3BAF7',
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.pill,
    gap: 4,
  },
  badgeText: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.lavenderDark,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.colors.text,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  checkboxChecked: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
  challengeText: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
    flex: 1,
    lineHeight: 24,
  },
  challengeTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  emptyPrompt: {
    paddingVertical: 6,
  },
  emptyTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
    marginBottom: 2,
  },
  emptySub: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
  },
  editWrap: {
    marginTop: 4,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    ...THEME.typography.body,
    color: THEME.colors.text,
    minHeight: 64,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: THEME.spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  cancelBtnText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.text,
  },
  saveBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});

