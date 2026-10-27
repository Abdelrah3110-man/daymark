import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/app-store';
import { useXPStore } from '@/store/xp-store';
import { getTodayKey } from '@/utils/dates';

export const DailyChallengeCard: React.FC = () => {
  const settings = useAppStore((s) => s.settings);
  const setDailyChallenge = useAppStore((s) => s.setDailyChallenge);
  const toggleCompleted = useAppStore((s) => s.toggleDailyChallengeCompleted);
  const totalXP = useXPStore((s) => s.totalXP);

  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(settings.dailyChallengeText || '');

  const todayKey = getTodayKey();
  const isCompleted = settings.dailyChallengeCompletedDate === todayKey;
  const challengeTitle = settings.dailyChallengeText && settings.dailyChallengeText.trim()
    ? settings.dailyChallengeText
    : 'Do your plan before 09:00 AM';

  const handleSave = () => {
    setDailyChallenge(inputText);
    setIsEditing(false);
  };

  return (
    <View style={styles.card}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <Text style={styles.editHeader}>Set Daily Intention</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Finish client proposal by 11:00 AM"
            placeholderTextColor="rgba(18, 19, 28, 0.4)"
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
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {/* Left Column: Challenge texts and badges */}
          <View style={styles.leftColumn}>
            <TouchableOpacity
              onPress={() => {
                setInputText(settings.dailyChallengeText || '');
                setIsEditing(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.mainTitle}>Daily{'\n'}challenge</Text>
              <Text style={[styles.subText, isCompleted && styles.subTextCompleted]} numberOfLines={2}>
                {challengeTitle}
              </Text>
            </TouchableOpacity>

            {/* Overlapping avatar pills and counter */}
            <View style={styles.avatarRow}>
              <TouchableOpacity
                style={[styles.checkPill, isCompleted && styles.checkPillDone]}
                onPress={toggleCompleted}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'radio-button-off'}
                  size={18}
                  color={isCompleted ? '#10B981' : '#12131C'}
                />
                <Text style={styles.checkPillText}>
                  {isCompleted ? 'Completed' : 'Mark Done'}
                </Text>
              </TouchableOpacity>

              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>+{totalXP > 0 ? totalXP : 4} XP</Text>
              </View>
            </View>
          </View>

          {/* Right Column: 3D playful geometric composition */}
          <View style={styles.artContainer}>
            {/* Orange Torus / Ring */}
            <View style={styles.torusOuter}>
              <View style={styles.torusInner} />
            </View>

            {/* Dark Slate Cylinder */}
            <View style={styles.cylinder} />

            {/* Soft Gray Cube / Shape */}
            <View style={styles.roundedCube} />

            {/* Mini Yellow Torus Ring */}
            <View style={styles.miniRing}>
              <View style={styles.miniRingHole} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#C8B6FF',
    borderRadius: 30,
    padding: 22,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
    position: 'relative',
    ...THEME.shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#12131C',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(18, 19, 28, 0.75)',
    marginTop: 6,
    lineHeight: 18,
  },
  subTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  checkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
  },
  checkPillDone: {
    backgroundColor: '#FFFFFF',
  },
  checkPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12131C',
  },
  streakBadge: {
    backgroundColor: '#352C63',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  artContainer: {
    width: 110,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torusOuter: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9900',
    borderWidth: 12,
    borderColor: '#FFAE33',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-25deg' }, { scaleX: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  torusInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C8B6FF',
  },
  cylinder: {
    position: 'absolute',
    bottom: 24,
    left: 2,
    width: 48,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#4A5B67',
    borderTopColor: '#6B7E8C',
    borderTopWidth: 4,
    transform: [{ rotate: '15deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  roundedCube: {
    position: 'absolute',
    bottom: 12,
    right: 18,
    width: 46,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#B5A599',
    borderTopColor: '#D3C5BA',
    borderTopWidth: 6,
    transform: [{ rotate: '-12deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  miniRing: {
    position: 'absolute',
    bottom: 0,
    left: 26,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7E33B',
    borderWidth: 7,
    borderColor: '#FFE852',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '40deg' }],
    elevation: 5,
  },
  miniRingHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C8B6FF',
  },
  editContainer: {
    paddingVertical: 4,
  },
  editHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12131C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#12131C',
    minHeight: 60,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#12131C',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#12131C',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
