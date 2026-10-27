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
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, getAvatarById, isAvatarUnlocked } from '@/constants/avatars';
import { useAppStore } from '@/store/app-store';
import { useXPStore } from '@/store/xp-store';

export default function OnboardingScreen() {
  const router = useRouter();
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
      setErrorMessage('من فضلك اكتب اسمك للمتابعة (Please enter your name)');
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
        'أفاتار مقفل بنقاط XP',
        `هذا الأفاتار يتطلب ${target.requiredXP} نقطة XP لفتحه.\nستفتحه تلقائياً عند إنجاز المهام وجلسات التركيز!`
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={24} color="#12131C" />
          </View>
          <Text style={styles.welcomeTitle}>مرحباً بك في DAYMARK</Text>
          <Text style={styles.welcomeSub}>
            Plan your week. Prepare each day. Execute with intention.
          </Text>

          {/* Stepper Indicator */}
          <View style={styles.stepperRow}>
            <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
              <Text style={[styles.stepDotNumber, currentStep >= 1 && styles.stepDotNumberActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
              <Text style={[styles.stepDotNumber, currentStep >= 2 && styles.stepDotNumberActive]}>2</Text>
            </View>
          </View>
          <Text style={styles.stepLabel}>
            {currentStep === 1 ? 'الخطوة 1: البيانات الشخصية' : 'الخطوة 2: اختيار الأفاتار (والأفاتارات بالـ XP)'}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 ? (
            /* STEP 1: Name and Birthday */
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>ما هو اسمك؟</Text>
              <Text style={styles.sectionSubtitle}>سنستخدم اسمك لتخصيص خطتك وتحيتك يومياً.</Text>

              <TextInput
                style={styles.nameInput}
                placeholder="اكتب اسمك هنا (مثال: أحمد أو سارة)"
                placeholderTextColor={THEME.colors.textMuted}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus
                maxLength={32}
              />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>تاريخ ميلادك (Date of Birth)</Text>
              <Text style={styles.sectionSubtitle}>
                لحساب عمرك والاحتفال بمحطاتك ومواليدك الإنتاجية (اختياري).
              </Text>

              <View style={styles.birthRow}>
                <View style={styles.birthCol}>
                  <Text style={styles.birthLabel}>اليوم (Day)</Text>
                  <TextInput
                    style={styles.birthInput}
                    placeholder="DD"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={birthDay}
                    onChangeText={setBirthDay}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={styles.birthCol}>
                  <Text style={styles.birthLabel}>الشهر (Month)</Text>
                  <TextInput
                    style={styles.birthInput}
                    placeholder="MM"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={birthMonth}
                    onChangeText={setBirthMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={[styles.birthCol, { flex: 1.4 }]}>
                  <Text style={styles.birthLabel}>السنة (Year)</Text>
                  <TextInput
                    style={styles.birthInput}
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
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* STEP 2: Avatar Selection with XP Unlockables */
            <View style={styles.stepTwoContainer}>
              {/* Selected Avatar Live Preview */}
              <View style={[styles.heroAvatarCard, { backgroundColor: currentAvatar.bgColor }]}>
                <Text style={styles.heroEmoji}>{currentAvatar.emoji}</Text>
                <Text style={styles.heroName}>{currentAvatar.nameAr} • {currentAvatar.name}</Text>
                <Text style={styles.heroTitle}>{currentAvatar.title}</Text>
                <Text style={styles.heroDesc}>{currentAvatar.description}</Text>
              </View>

              <Text style={styles.subHeading}>الأفاتارات المتاحة والأفاتارات المقفلة بالـ XP</Text>
              <Text style={styles.subHeadingHint}>
                الأفاتارات التي عليها قفل 🔒 تفتح تلقائياً كلما جمعت نقاط XP من إنجاز المهام.
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
                        {avatar.nameAr}
                      </Text>

                      {isSelected ? (
                        <View style={styles.selectedPill}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          <Text style={styles.selectedPillText}>المختار</Text>
                        </View>
                      ) : isUnlocked ? (
                        <View style={styles.unlockedPill}>
                          <Text style={styles.unlockedPillText}>متاح</Text>
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
        <View style={styles.footer}>
          {currentStep === 2 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color="#12131C" />
              <Text style={styles.backButtonText}>رجوع</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && { flex: 1 }]}
            onPress={currentStep === 1 ? handleNextToAvatars : handleFinishOnboarding}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === 1 ? 'التالي: اختيار الأفاتار ←' : 'ابدأ استخدام DAYMARK ✨'}
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
    backgroundColor: '#F5F6FA',
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
    backgroundColor: '#C8B6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...THEME.shadows.subtle,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#12131C',
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#6B7082',
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
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#12131C',
  },
  stepDotNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepDotNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: '#12131C',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: '#ECEEF5',
    ...THEME.shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#12131C',
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7082',
    marginTop: 3,
    marginBottom: 14,
    textAlign: 'right',
  },
  nameInput: {
    backgroundColor: '#F7F8FC',
    borderWidth: 1.5,
    borderColor: '#E8EAF2',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#12131C',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEEF5',
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
    color: '#6B7082',
    marginBottom: 6,
    textAlign: 'center',
  },
  birthInput: {
    backgroundColor: '#F7F8FC',
    borderWidth: 1.5,
    borderColor: '#E8EAF2',
    borderRadius: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#12131C',
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
    textAlign: 'right',
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
    color: '#12131C',
    marginTop: 6,
    textAlign: 'right',
  },
  subHeadingHint: {
    fontSize: 12,
    color: '#6B7082',
    textAlign: 'right',
    marginTop: 2,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  avatarTile: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
    position: 'relative',
    ...THEME.shadows.subtle,
  },
  avatarTileSelected: {
    borderColor: '#12131C',
    transform: [{ scale: 1.03 }],
  },
  avatarTileLocked: {
    opacity: 0.6,
  },
  tileEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  tileName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#12131C',
    marginBottom: 8,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12131C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  unlockedPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlockedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#12131C',
  },
  xpLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  xpLockText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECEEF5',
    gap: 10,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: '#F5F6FA',
    gap: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12131C',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#12131C',
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
