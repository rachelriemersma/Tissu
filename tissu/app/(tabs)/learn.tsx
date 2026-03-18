import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { LEARN_TOPICS, LEARN_TIPS } from '@/data/learn';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

const TOPIC_ICONS: Record<string, 'bar-chart-2' | 'help-circle' | 'tag' | 'alert-triangle' | 'layers'> = {
  'fabric-comparison': 'bar-chart-2',
  'what-is-gsm': 'help-circle',
  'care-label-guide': 'tag',
  'greenwashing': 'alert-triangle',
  'natural-vs-synthetic': 'layers',
};

export default function LearnScreen() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LEARN_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LEARN</Text>
        </View>

        {/* Featured tip card */}
        <TouchableOpacity style={styles.featuredCard} activeOpacity={0.92}>
          <Text style={styles.featuredText}>{LEARN_TIPS[tipIndex]}</Text>
        </TouchableOpacity>

        {/* Topic grid */}
        <View style={styles.grid}>
          {LEARN_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.slug}
              style={styles.topicCard}
              onPress={() => router.push(`/learn/${topic.slug}`)}
              activeOpacity={0.85}
            >
              <Feather
                name={TOPIC_ICONS[topic.slug] ?? 'book-open'}
                size={20}
                color={Colors.textSecondary}
                style={{ marginBottom: Spacing.sm }}
              />
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription} numberOfLines={3}>
                {topic.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 4,
  },
  featuredCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.textPrimary,
    padding: Spacing.xl,
    borderRadius: 4,
    minHeight: 140,
    justifyContent: 'center',
  },
  featuredText: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize.xl,
    color: Colors.surface,
    lineHeight: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  topicCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: Spacing.md,
    minHeight: 160,
    justifyContent: 'flex-end',
  },
  topicTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  topicDescription: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
