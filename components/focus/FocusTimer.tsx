import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '@/store/focus-store';

interface FocusTimerProps {
  onFinishRequest: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onFinishRequest }) => {
  const activeSession = useFocusStore((s) => s.activeSession);
  const status = useFocusStore((s) => s.status);
  const startSession = useFocusStore((s) => s.startSession);
  const pauseSession = useFocusStore((s) => s.pauseSession);
  const resumeSession = useFocusStore((s) => s.resumeSession);
  const cancelSession = useFocusStore((s) => s.cancelSession);
  const getRemainingSeconds = useFocusStore((s) => s.getRemainingSeconds);

  const [remaining, setRemaining] = useState(
    activeSession ? getRemainingSeconds() : 25 * 60
  );
  const [selectedDuration, setSelectedDuration] = useState(25);

  useEffect(() => {
    let interval: any = null;

    if (status === 'running') {
      interval = setInterval(() => {
        const rem = getRemainingSeconds();
        setRemaining(rem);
        if (rem <= 0) {
          clearInterval(interval);
          onFinishRequest();
        }
      }, 500);
    } else if (status === 'paused') {
      setRemaining(getRemainingSeconds());
    } else if (status === 'idle') {
      setRemaining(selectedDuration * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, selectedDuration]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleStart = () => {
    startSession({ durationMinutes: selectedDuration });
  };

  return (
    <View style={styles.container}>
      {activeSession?.taskTitle && (
        <View style={styles.taskBadge}>
          <Ionicons name="checkbox-outline" size={14} color={THEME.colors.lavenderDark} />
          <Text style={styles.taskBadgeText} numberOfLines={1}>
            {activeSession.taskTitle}
          </Text>
        </View>
      )}

      {/* Timer Circle */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{timeFormatted}</Text>
        <Text style={styles.statusLabel}>
          {status === 'running'
            ? 'FOCUS IN PROGRESS'
            : status === 'paused'
            ? 'PAUSED'
            : 'READY TO FOCUS'}
        </Text>
      </View>

      {/* Duration selector when idle */}
      {status === 'idle' && (
        <View style={styles.durationRow}>
          {[15, 25, 45, 60].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[styles.durPill, selectedDuration === mins && styles.durPillActive]}
              onPress={() => {
                setSelectedDuration(mins);
                setRemaining(mins * 60);
              }}
            >
              <Text
                style={[
                  styles.durPillText,
                  selectedDuration === mins && styles.durPillTextActive,
                ]}
              >
                {mins}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsRow}>
        {status === 'idle' && (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
            <Ionicons name="play" size={24} color={THEME.colors.textInverse} />
            <Text style={styles.startBtnText}>Start Session</Text>
          </TouchableOpacity>
        )}

        {status === 'running' && (
          <>
            <TouchableOpacity style={styles.pauseBtn} onPress={pauseSession} activeOpacity={0.8}>
              <Ionicons name="pause" size={22} color={THEME.colors.text} />
              <Text style={styles.controlText}>Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={onFinishRequest}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={22} color={THEME.colors.textInverse} />
              <Text style={styles.finishBtnText}>Finish</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'paused' && (
          <>
            <TouchableOpacity style={styles.resumeBtn} onPress={resumeSession} activeOpacity={0.8}>
              <Ionicons name="play" size={22} color={THEME.colors.textInverse} />
              <Text style={styles.finishBtnText}>Resume</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={onFinishRequest}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={22} color={THEME.colors.textInverse} />
              <Text style={styles.finishBtnText}>Finish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={cancelSession} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.xxxl,
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.lavenderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    marginBottom: THEME.spacing.xl,
    gap: 6,
    maxWidth: '85%',
  },
  taskBadgeText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.lavenderDark,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: THEME.colors.surface,
    borderWidth: 4,
    borderColor: THEME.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.card,
    marginBottom: THEME.spacing.xxl,
  },
  timerText: {
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -1,
    color: THEME.colors.text,
  },
  statusLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: THEME.spacing.xxl,
  },
  durPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  durPillActive: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
  durPillText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  durPillTextActive: {
    color: THEME.colors.textInverse,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.text,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.pill,
    gap: 8,
    ...THEME.shadows.subtle,
  },
  startBtnText: {
    ...THEME.typography.bodyLg,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.pill,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.pill,
    gap: 6,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.pill,
    gap: 6,
  },
  cancelBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  finishBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});
