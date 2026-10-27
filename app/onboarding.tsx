import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, getAvatarById, isAvatarUnlocked } from '@/constants/avatars';
import { useAppStore } from '@/store/app-store';
import { useXPStore } from '@/store/xp-store';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const totalXP = useXPStore((s) => s.totalXP);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('fox');
  const [errorMessage, setErrorMessage] = useState('');

  const currentAvatar = getAvatarById(selectedAvatarId);

  const handleNextToAvatars = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your name to continue');
      return;
    }
    setErrorMessage('');
    setCurrentStep(2);
  };

  const handleSelectAvatar = (avatarId: string) => {
    const isUnlocked = isAvatarUnlocked(avatarId, totalXP);
    if (!isUnlocked) {
      const target = getAvatarById(avatarId);
      Alert.alert(
        'Avatar Locked by XP',
        `This avatar requires ${target.requiredXP} XP to unlock.\nComplete tasks and focus sessions to unlock it automatically!`
      );
      return;
    }
    setSelectedAvatarId(avatarId);
  };

  const handleFinishOnboarding = () => {
    let formattedBirthDate = '';
    if (birthYear.trim() && birthMonth.trim() && birthDay.trim()) {
      const y = birthYear.trim().padStart(4, '2000');
      const m = birthMonth.trim().padStart(2, '01');
      const d = birthDay.trim().padStart(2, '01');
      formattedBirthDate = `${y}-${m}-${d}`;
    }

    completeOnboarding(
      name.trim(),
      formattedBirthDate,
      selectedAvatarId
    );

    // Navigate straight to the Home dashboard
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: colors.lavender }]}>
            <Ionicons name="sparkles" size={24} color="#12131C" />
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to DAYMARK</Text>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
            Plan your week. Prepare each day. Execute with intention.
          </Text>

          {/* Stepper Indicator */}
          <View style={styles.stepperRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: currentStep >= 1 ? (isDark ? '#FFFFFF' : '#12131C') : colors.border },
              ]}
            >
              <Text
                style={[
                  styles.stepDotNumber,
                  { color: currentStep >= 1 ? (isDark ? '#12131C' : '#FFFFFF') : colors.textMuted },
                ]}
              >
                1
              </Text>
            </View>
            <View
              style={[
                styles.stepLine,
                { backgroundColor: currentStep >= 2 ? (isDark ? '#FFFFFF' : '#12131C') : colors.border },
              ]}
            />
            <View
              style={[
                styles.stepDot,
                { backgroundColor: currentStep >= 2 ? (isDark ? '#FFFFFF' : '#12131C') : colors.border },
              ]}
            >
              <Text
                style={[
                  styles.stepDotNumber,
                  { color: currentStep >= 2 ? (isDark ? '#12131C' : '#FFFFFF') : colors.textMuted },
                ]}
              >
                2
              </Text>
            </View>
          </View>
          <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
            {currentStep === 1 ? 'Step 1: Personal Profile' : 'Step 2: Choose Your Avatar'}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 ? (
            /* STEP 1: Name and Birthday */
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>What is your name?</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                We will personalize your planning dashboard and daily greeting.
              </Text>

              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your name (e.g. Alex or Sandra)"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus
                maxLength={32}
              />

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Date of Birth (Optional)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Used to celebrate your milestones and calculate age benchmarks.
              </Text>

              <View style={styles.birthRow}>
                <View style={styles.birthCol}>
                  <Text style={[styles.birthLabel, { color: colors.textSecondary }]}>Day (DD)</Text>
                  <TextInput
                    style={[
                      styles.birthInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="DD"
                    placeholderTextColor={colors.textMuted}
                    value={birthDay}
                    onChangeText={setBirthDay}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={styles.birthCol}>
                  <Text style={[styles.birthLabel, { color: colors.textSecondary }]}>Month (MM)</Text>
                  <TextInput
                    style={[
                      styles.birthInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="MM"
                    placeholderTextColor={colors.textMuted}
                    value={birthMonth}
                    onChangeText={setBirthMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={[styles.birthCol, { flex: 1.4 }]}>
                  <Text style={[styles.birthLabel, { color: colors.textSecondary }]}>Year (YYYY)</Text>
                  <TextInput
                    style={[
                      styles.birthInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="YYYY"
                    placeholderTextColor={colors.textMuted}
                    value={birthYear}
                    onChangeText={setBirthYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              {errorMessage ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* STEP 2: Avatar Selection with XP Unlockables */
            <View style={styles.stepTwoContainer}>
              {/* Selected Avatar Live Preview */}
              <View style={[styles.heroAvatarCard, { backgroundColor: currentAvatar.bgColor }]}>
                <Text style={styles.heroEmoji}>{currentAvatar.emoji}</Text>
                <Text style={styles.heroName}>{currentAvatar.name}</Text>
                <Text style={styles.heroTitle}>{currentAvatar.title}</Text>
                <Text style={styles.heroDesc}>{currentAvatar.description}</Text>
              </View>

              <Text style={[styles.subHeading, { color: colors.text }]}>Available & XP-Locked Avatars</Text>
              <Text style={[styles.subHeadingHint, { color: colors.textSecondary }]}>
                Avatars marked with 🔒 unlock automatically as you earn XP from completing tasks.
              </Text>

              {/* All Avatars Grid */}
              <View style={styles.avatarsGrid}>
                {AVATARS.map((avatar) => {
                  const isUnlocked = isAvatarUnlocked(avatar.id, totalXP);
                  const isSelected = avatar.id === selectedAvatarId;

                  return (
                    <TouchableOpacity
                      key={avatar.id}
                      style={[
                        styles.avatarTile,
                        { backgroundColor: avatar.bgColor },
                        isSelected && styles.avatarTileSelected,
                        !isUnlocked && styles.avatarTileLocked,
                      ]}
                      onPress={() => handleSelectAvatar(avatar.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.tileEmoji}>{avatar.emoji}</Text>
                      <Text style={styles.tileName} numberOfLines={1}>
                        {avatar.name}
                      </Text>

                      {isSelected ? (
                        <View style={styles.selectedPill}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          <Text style={styles.selectedPillText}>Selected</Text>
                        </View>
                      ) : isUnlocked ? (
                        <View style={styles.unlockedPill}>
                          <Text style={styles.unlockedPillText}>Unlocked</Text>
                        </View>
                      ) : (
                        <View style={styles.xpLockPill}>
                          <Ionicons name="lock-closed" size={10} color="#7C3AED" />
                          <Text style={styles.xpLockText}>{avatar.requiredXP} XP</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Navigation */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {currentStep === 2 && (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
              <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && { flex: 1 }, { backgroundColor: colors.text }]}
            onPress={currentStep === 1 ? handleNextToAvatars : handleFinishOnboarding}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
              {currentStep === 1 ? 'Next: Choose Avatar →' : 'Get Started ✨'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...THEME.shadows.subtle,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    ...THEME.shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'left',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 14,
    textAlign: 'left',
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  birthRow: {
    flexDirection: 'row',
    gap: 10,
  },
  birthCol: {
    flex: 1,
  },
  birthLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'left',
  },
  birthInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  stepTwoContainer: {
    gap: 14,
  },
  heroAvatarCard: {
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  heroEmoji: {
    fontSize: 52,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12131C',
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(18, 19, 28, 0.7)',
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(18, 19, 28, 0.65)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'left',
  },
  subHeadingHint: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'left',
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  avatarTile: {
    width: '31%',
    aspectRatio: 0.9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
    ...THEME.shadows.subtle,
  },
  avatarTileSelected: {
    borderWidth: 3,
    borderColor: '#12131C',
    transform: [{ scale: 1.03 }],
  },
  avatarTileLocked: {
    opacity: 0.65,
  },
  tileEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  tileName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#12131C',
  },
  selectedPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#12131C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  unlockedPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unlockedPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  xpLockPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EDE9FE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
  },
  xpLockText: {
    color: '#7C3AED',
    fontSize: 9,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    ...THEME.shadows.subtle,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
