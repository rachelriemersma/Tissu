import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'welcome',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    title: 'TISSU',
    subtitle: 'know what you wear',
    isHero: true,
  },
  {
    key: 'scan',
    icon: 'camera' as const,
    title: 'Scan any care label.',
    body: 'Point your camera at any clothing label. We\'ll tell you exactly what it\'s made of, how durable it is, and how sustainable it really is.',
    isHero: false,
  },
  {
    key: 'decide',
    icon: 'check-circle' as const,
    title: 'Make informed decisions.',
    body: 'Quality scores, sustainability ratings, and plain-language breakdowns — everything you need to buy less and wear better.',
    isHero: false,
    isFinal: true,
  },
];

export default function OnboardingScreen() {
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
    onMomentumEnd: (e) => {
      const index = Math.round(e.contentOffset.x / SCREEN_WIDTH);
      setCurrentIndex(index);
    },
  });

  function goNext() {
    const next = currentIndex + 1;
    if (next < SLIDES.length) {
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setCurrentIndex(next);
    }
  }

  async function handleGetStarted() {
    await AsyncStorage.setItem('onboarding_complete', '1');
    router.replace('/auth/signup');
  }

  async function handleLogin() {
    await AsyncStorage.setItem('onboarding_complete', '1');
    router.replace('/auth/login');
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={slide.key} style={styles.slide}>
            {slide.isHero ? (
              <View style={{ flex: 1 }}>
                <Image source={{ uri: slide.image }} style={styles.heroImage} />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroWordmark}>{slide.title}</Text>
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                </View>
              </View>
            ) : (
              <SafeAreaView style={styles.slidePadded} edges={['top', 'bottom']}>
                <View style={styles.slideContent}>
                  <View style={styles.iconCircle}>
                    <Feather name={slide.icon!} size={32} color={Colors.textPrimary} />
                  </View>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideBody}>{slide.body}</Text>
                </View>

                {slide.isFinal ? (
                  <View style={styles.finalActions}>
                    <TouchableOpacity style={styles.ctaPrimary} onPress={handleGetStarted}>
                      <Text style={styles.ctaPrimaryText}>GET STARTED</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ctaSecondary} onPress={handleLogin}>
                      <Text style={styles.ctaSecondaryText}>I already have an account</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
                    <Feather name="arrow-right" size={22} color={Colors.surface} />
                  </TouchableOpacity>
                )}
              </SafeAreaView>
            )}

            {/* Dots */}
            {!slide.isHero && (
              <View style={styles.dots}>
                {SLIDES.map((_, di) => (
                  <View
                    key={di}
                    style={[styles.dot, di === i && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Skip on first slide */}
      {currentIndex === 0 && (
        <SafeAreaView style={styles.skipWrapper} edges={['top']}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleGetStarted}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { width: SCREEN_WIDTH, flex: 1 },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWordmark: {
    fontFamily: FontFamily.serifBold,
    fontSize: 56,
    color: Colors.surface,
    letterSpacing: 16,
  },
  heroSubtitle: {
    fontFamily: FontFamily.sansLight,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginTop: Spacing.sm,
  },
  slidePadded: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  slideTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    lineHeight: 44,
    marginBottom: Spacing.md,
  },
  slideBody: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  finalActions: { gap: Spacing.md },
  ctaPrimary: {
    backgroundColor: Colors.accent,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  ctaPrimaryText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.surface,
    letterSpacing: 2,
  },
  ctaSecondary: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondaryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  dots: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.textPrimary,
    width: 20,
  },
  skipWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.md,
  },
  skipBtn: { padding: Spacing.sm },
  skipText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.surface,
  },
});
