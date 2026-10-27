import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, getAvatarById } from '@/constants/avatars';
import { useAppStore } from '@/store/app-store';

interface OnboardingModalProps {
  visible: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible }) => {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('fox');
  const [errorMessage, setErrorMessage] = useState('');

  // Starter avatars available for new users
  const starterAvatars = AVATARS.filter((a) => a.requiredXP === 0);
  const currentAvatar = getAvatarById(selectedAvatarId);

  const handleNextStep = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your name to continue.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleFinish = () => {
    let formattedBirthDate = '';
    if (birthYear.trim() && birthMonth.trim() && birthDay.trim()) {
      const y = birthYear.padStart(4, '2000');
      const m = birthMonth.padStart(2, '01');
      const d = birthDay.padStart(2, '01');
      formattedBirthDate = `${y}-${m}-${d}`;
    }

    completeOnboarding(
      name.trim(),
      formattedBirthDate,
      selectedAvatarId
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="sparkles" size={20} color="#12131C" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to DAYMARK</Text>
            <Text style={styles.welcomeSub}>
              Plan your week. Prepare each day. Execute with intention.
            </Text>

            {/* Step Indicators */}
            <View style={styles.stepsRow}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {step === 1 ? (
              <View style={styles.formContainer}>
                <Text style={styles.sectionHeading}>What should we call you?</Text>
                <Text style={styles.sectionSub}>Enter your name or preferred nickname.</Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Sandra or Alex"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus
                  maxLength={32}
                />

                <Text style={[styles.sectionHeading, { marginTop: 24 }]}>When is your birthday?</Text>
                <Text style={styles.sectionSub}>Used to celebrate your milestones and calculate age (optional).</Text>

                <View style={styles.dateInputsRow}>
                  <View style={styles.dateInputCol}>
                    <Text style={styles.dateInputLabel}>Day</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={birthDay}
                      onChangeText={setBirthDay}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>

                  <View style={styles.dateInputCol}>
                    <Text style={styles.dateInputLabel}>Month</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="MM"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={birthMonth}
                      onChangeText={setBirthMonth}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>

                  <View style={[styles.dateInputCol, { flex: 1.4 }]}>
                    <Text style={styles.dateInputLabel}>Year</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={birthYear}
                      onChangeText={setBirthYear}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </View>
                </View>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={THEME.colors.danger} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.sectionHeading}>Choose your Avatar</Text>
                <Text style={styles.sectionSub}>
                  Select your starter persona. You can unlock rare & legendary avatars as you earn XP!
                </Text>

                {/* Live Preview Card */}
                <View style={[styles.previewCard, { backgroundColor: currentAvatar.bgColor }]}>
                  <Text style={styles.previewEmoji}>{currentAvatar.emoji}</Text>
                  <Text style={styles.previewName}>{currentAvatar.name}</Text>
                  <Text style={styles.previewTitle}>{currentAvatar.title}</Text>
                  <Text style={styles.previewDesc}>{currentAvatar.description}</Text>
                </View>

                {/* Avatar Selection Grid */}
                <View style={styles.avatarsGrid}>
                  {starterAvatars.map((avatar) => {
                    const isSelected = avatar.id === selectedAvatarId;
                    return (
                      <TouchableOpacity
                        key={avatar.id}
                        style={[
                          styles.avatarOption,
                          { backgroundColor: avatar.bgColor },
                          isSelected && styles.avatarOptionSelected,
                        ]}
                        onPress={() => setSelectedAvatarId(avatar.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                        <Text style={styles.avatarNameLabel}>{avatar.name}</Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.lockedNotice}>
                  <Ionicons name="lock-closed-outline" size={16} color={THEME.colors.lavenderDark} />
                  <Text style={styles.lockedNoticeText}>
                    5 more legendary avatars (Owl, Rocket, Crown, Dragon, Cosmos) will unlock automatically as you earn XP!
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={styles.footer}>
            {step === 2 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(1)}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color="#12131C" />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, step === 1 && { flex: 1 }]}
              onPress={step === 1 ? handleNextStep : handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {step === 1 ? 'Choose Avatar →' : 'Start My Journey ✨'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C8B6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...THEME.shadows.subtle,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#12131C',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#6B7082',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  stepDotActive: {
    backgroundColor: '#12131C',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepLine: {
    width: 36,
    height: 3,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: '#12131C',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  formContainer: {
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12131C',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13,
    color: '#6B7082',
    marginTop: 3,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8EAF2',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#12131C',
    ...THEME.shadows.subtle,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7082',
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8EAF2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#12131C',
    textAlign: 'center',
    ...THEME.shadows.subtle,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  previewCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    ...THEME.shadows.card,
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 6,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12131C',
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(18, 19, 28, 0.7)',
    marginTop: 2,
  },
  previewDesc: {
    fontSize: 12,
    color: 'rgba(18, 19, 28, 0.65)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  avatarOption: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...THEME.shadows.subtle,
  },
  avatarOptionSelected: {
    borderColor: '#12131C',
    transform: [{ scale: 1.02 }],
  },
  avatarEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  avatarNameLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#12131C',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#12131C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAFF',
    padding: 12,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#D8CEFC',
  },
  lockedNoticeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#432C81',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#E8EAF2',
    backgroundColor: '#FFFFFF',
    gap: 12,
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#F5F6FA',
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12131C',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#12131C',
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});

