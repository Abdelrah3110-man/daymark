import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '@/store/focus-store';

interface FocusReflectionModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const FocusReflectionModal: React.FC<FocusReflectionModalProps> = ({
  visible,
  onDismiss,
}) => {
  const activeSession = useFocusStore((s) => s.activeSession);
  const finishSession = useFocusStore((s) => s.finishSession);

  const [reflection, setReflection] = useState('');
  const [markComplete, setMarkComplete] = useState(false);

  const handleSubmit = () => {
    finishSession(reflection, markComplete);
    setReflection('');
    setMarkComplete(false);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={20} color={THEME.colors.lavenderDark} />
            </View>
            <Text style={styles.title}>Session Complete</Text>
          </View>

          <Text style={styles.sub}>
            Take a moment to record what was achieved during this deep work sprint.
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Key accomplishments, discoveries, or next steps..."
            placeholderTextColor={THEME.colors.textLight}
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {activeSession?.taskId && (
            <TouchableOpacity
              style={styles.checkTaskRow}
              onPress={() => setMarkComplete(!markComplete)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, markComplete && styles.checkboxChecked]}>
                {markComplete && <Ionicons name="checkmark" size={14} color={THEME.colors.textInverse} />}
              </View>
              <Text style={styles.checkTaskText} numberOfLines={1}>
                Also mark "{activeSession.taskTitle}" as completed
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Complete & Record Session</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 19, 28, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  sub: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    ...THEME.typography.body,
    color: THEME.colors.text,
    minHeight: 80,
    marginBottom: THEME.spacing.md,
  },
  checkTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: THEME.colors.text,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: THEME.colors.text,
  },
  checkTaskText: {
    ...THEME.typography.bodySm,
    color: THEME.colors.text,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: THEME.colors.text,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.pill,
    alignItems: 'center',
  },
  submitBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});

