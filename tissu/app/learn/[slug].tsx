import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { LEARN_TOPICS, ARTICLE_CONTENT, FABRIC_CHART_DATA } from '@/data/learn';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_MAX_WIDTH = SCREEN_WIDTH - Spacing.lg * 2 - 80;

const CARE_SYMBOLS = [
  { symbol: '30°', label: 'Machine wash cold', description: 'Wash at or below 30°C (86°F)' },
  { symbol: '40°', label: 'Machine wash warm', description: 'Wash at or below 40°C (104°F)' },
  { symbol: '⊠', label: 'Do not wash', description: 'Dry clean only or spot clean' },
  { symbol: '△', label: 'Bleach allowed', description: 'Any bleach may be used' },
  { symbol: '⊘△', label: 'Do not bleach', description: 'Do not use any bleach' },
  { symbol: '◻', label: 'Tumble dry low', description: 'Tumble dry on low heat' },
  { symbol: '⊠◻', label: 'Do not tumble dry', description: 'Lay flat to dry or hang dry' },
  { symbol: '◻◻', label: 'Dry flat', description: 'Reshape and dry on a flat surface' },
  { symbol: '♨', label: 'Iron low heat', description: 'Iron at low temperature (110°C max)' },
  { symbol: '♨♨', label: 'Iron medium heat', description: 'Iron at medium temperature (150°C max)' },
  { symbol: '⊠♨', label: 'Do not iron', description: 'Do not iron or press with heat' },
  { symbol: 'P', label: 'Dry clean', description: 'Professional dry clean recommended' },
];

function ArticleScreen({ slug }: { slug: string }) {
  const topic = LEARN_TOPICS.find((t) => t.slug === slug);
  const paragraphs = ARTICLE_CONTENT[slug] ?? [];

  return (
    <>
      <Text style={styles.articleTitle}>{topic?.title}</Text>
      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.articleParagraph}>{p}</Text>
      ))}
    </>
  );
}

function FabricChartScreen() {
  const metrics: Array<{ key: keyof typeof FABRIC_CHART_DATA[0]; label: string }> = [
    { key: 'durability', label: 'Durability' },
    { key: 'sustainability', label: 'Sustainability' },
    { key: 'breathability', label: 'Breathability' },
    { key: 'cost', label: 'Affordability' },
  ];

  return (
    <>
      <Text style={styles.articleTitle}>Fabric Comparison</Text>
      <Text style={styles.articleParagraph}>
        How do the most common fabrics compare? Each fabric is scored out of 100 across durability, sustainability, breathability, and cost.
      </Text>
      {metrics.map((metric) => (
        <View key={metric.key} style={styles.chartSection}>
          <Text style={styles.chartMetricLabel}>{metric.label.toUpperCase()}</Text>
          {FABRIC_CHART_DATA.map((fabric) => {
            const value = fabric[metric.key] as number;
            return (
              <View key={fabric.name} style={styles.chartRow}>
                <Text style={styles.chartFabricName}>{fabric.name}</Text>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBar, { width: (BAR_MAX_WIDTH * value) / 100 }]} />
                </View>
                <Text style={styles.chartValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
}

function CareGuideScreen() {
  return (
    <>
      <Text style={styles.articleTitle}>Read a Care Label</Text>
      <Text style={styles.articleParagraph}>
        Every care label tells a story. Learn to decode the universal symbols so your clothes last longer.
      </Text>
      {CARE_SYMBOLS.map((item, i) => (
        <View key={i} style={styles.careRow}>
          <View style={styles.careSymbolBox}>
            <Text style={styles.careSymbol}>{item.symbol}</Text>
          </View>
          <View style={styles.careInfo}>
            <Text style={styles.careLabel}>{item.label}</Text>
            <Text style={styles.careDescription}>{item.description}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

export default function LearnDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const topic = LEARN_TOPICS.find((t) => t.slug === slug);

  function renderContent() {
    if (slug === 'fabric-comparison') return <FabricChartScreen />;
    if (slug === 'care-label-guide') return <CareGuideScreen />;
    return <ArticleScreen slug={slug ?? ''} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.content}>
          {renderContent()}
        </View>
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xl },
  backBtn: {
    padding: Spacing.md,
    paddingLeft: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  articleTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    lineHeight: 44,
    marginBottom: Spacing.lg,
  },
  articleParagraph: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  chartSection: {
    marginBottom: Spacing.xl,
  },
  chartMetricLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  chartFabricName: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    width: 72,
  },
  chartBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  chartBar: {
    height: 6,
    backgroundColor: Colors.textPrimary,
    borderRadius: 3,
  },
  chartValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 28,
    textAlign: 'right',
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  careSymbolBox: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careSymbol: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  careInfo: { flex: 1 },
  careLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  careDescription: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
