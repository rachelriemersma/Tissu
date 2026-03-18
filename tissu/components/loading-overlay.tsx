import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

interface Props {
  message: string;
}

function PulseDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.2, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, style]} />;
}

export default function LoadingOverlay({ message }: Props) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.wordmark}>TISSU</Text>
      <View style={styles.dotsRow}>
        <PulseDot delay={0} />
        <PulseDot delay={200} />
        <PulseDot delay={400} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  wordmark: {
    fontFamily: FontFamily.serifBold,
    fontSize: 40,
    color: Colors.textPrimary,
    letterSpacing: 12,
    marginBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textPrimary,
  },
  message: {
    fontFamily: FontFamily.sansLight,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});
