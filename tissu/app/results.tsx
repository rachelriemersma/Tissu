import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useScan } from '@/lib/scan-context';
import { supabase } from '@/lib/supabase';
import { useScanHistory } from '@/hooks/use-scan-history';

export default function ResultsScreen() {
  const { currentResult, currentType } = useScan();
  const [hearted, setHearted] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const { saveScan } = useScanHistory();

  useEffect(() => {
    if (currentResult && currentType) {
      // Save scan to history
      saveToHistory();
    }
  }, []);

  async function saveToHistory() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user || !currentResult || !currentType) return;
    await saveScan({
      user_id: user.user.id,
      type: currentType,
      result_json: currentResult,
    });
  }

  async function handleHeart() {
    if (!currentResult) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    if (hearted) {
      setHearted(false);
    } else {
      await supabase.from('wishlist').insert([{
        user_id: user.user.id,
        item_data_json: {
          id: Date.now().toString(),
          image: currentResult.imageUrl ?? '',
          brand: currentResult.brand ?? '',
          name: currentResult.productName ?? 'Label scan',
          price: currentResult.price ?? '',
          link: '',
        },
      }]);
      setHearted(true);
    }
  }

  if (!currentResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No results to display.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const r = currentResult;
  const totalPct = r.fibers.reduce((s, f) => s + f.percentage, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleHeart} style={styles.iconBtn}>
            <Feather
              name={hearted ? 'heart' : 'heart'}
              size={22}
              color={hearted ? Colors.heart : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Product image + name (URL scans) */}
        {currentType === 'url' && r.imageUrl ? (
          <View>
            <Image source={{ uri: r.imageUrl }} style={styles.heroImage} />
            <View style={styles.productInfo}>
              {r.brand && <Text style={styles.brand}>{r.brand.toUpperCase()}</Text>}
              {r.productName && <Text style={styles.productName}>{r.productName}</Text>}
              {r.price && <Text style={styles.price}>{r.price}</Text>}
            </View>
          </View>
        ) : (
          currentType === 'url' && (
            <View style={styles.productInfo}>
              {r.brand && <Text style={styles.brand}>{r.brand.toUpperCase()}</Text>}
              {r.productName && <Text style={styles.productName}>{r.productName}</Text>}
            </View>
          )
        )}

        <View style={styles.cards}>
          {/* Card 1: Fiber Blend */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>FIBER BLEND</Text>
            {/* Segmented bar */}
            <View style={styles.fiberBar}>
              {r.fibers.map((fiber, i) => (
                <View
                  key={i}
                  style={[
                    styles.fiberSegment,
                    {
                      flex: fiber.percentage / totalPct,
                      backgroundColor: FIBER_COLORS[i % FIBER_COLORS.length],
                    },
                    i === 0 && { borderTopLeftRadius: 2, borderBottomLeftRadius: 2 },
                    i === r.fibers.length - 1 && { borderTopRightRadius: 2, borderBottomRightRadius: 2 },
                  ]}
                />
              ))}
            </View>
            {/* Fiber labels */}
            <View style={styles.fiberLabels}>
              {r.fibers.map((fiber, i) => (
                <View key={i} style={styles.fiberLabelRow}>
                  <View style={[styles.fiberDot, { backgroundColor: FIBER_COLORS[i % FIBER_COLORS.length] }]} />
                  <Text style={styles.fiberLabel}>{fiber.percentage}% {fiber.name}</Text>
                </View>
              ))}
            </View>
            {/* Descriptions */}
            <View style={styles.divider} />
            {r.fiberDescriptions?.map((fd, i) => (
              <View key={i} style={styles.fiberDesc}>
                <Text style={styles.fiberDescName}>{fd.name}</Text>
                <Text style={styles.fiberDescText}>{fd.description}</Text>
              </View>
            ))}
          </View>

          {/* Card 2: Durability */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>DURABILITY</Text>
            <Text style={styles.score}>{r.durability.score} / 100</Text>
            <Text style={styles.scoreSummary}>{r.durability.summary}</Text>
            <View style={styles.tagsRow}>
              {r.durability.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card 3: Sustainability */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>SUSTAINABILITY</Text>
            <Text style={styles.score}>{r.sustainability.score} / 100</Text>
            <Text style={styles.scoreSummary}>{r.sustainability.summary}</Text>
            <View style={styles.tagsRow}>
              {r.sustainability.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Collapsible additional info */}
          {(r.country || r.rn || (r.care && r.care.length > 0)) && (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setAdditionalOpen((o) => !o)}
              activeOpacity={0.7}
            >
              <View style={styles.collapsibleHeader}>
                <Text style={styles.cardHeader}>ADDITIONAL INFO</Text>
                <Feather
                  name={additionalOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </View>
              {additionalOpen && (
                <View style={{ marginTop: Spacing.md }}>
                  {r.country && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>COUNTRY OF ORIGIN</Text>
                      <Text style={styles.infoValue}>{r.country}</Text>
                    </View>
                  )}
                  {r.rn && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>RN NUMBER</Text>
                      <Text style={styles.infoValue}>{r.rn}</Text>
                    </View>
                  )}
                  {r.care && r.care.length > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>CARE INSTRUCTIONS</Text>
                      {r.care.map((c, i) => (
                        <Text key={i} style={styles.infoValue}>· {c}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FIBER_COLORS = ['#0A0A0A', '#6B6560', '#C4BCBA', '#E8E4DF', '#4A4540'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.md },
  backLink: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base, color: Colors.textPrimary },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconBtn: { padding: Spacing.sm },
  heroImage: {
    width: '100%',
    height: 280,
  },
  productInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  brand: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginBottom: 4,
  },
  productName: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  price: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cards: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: Spacing.lg,
  },
  cardHeader: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },
  fiberBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  fiberSegment: { height: '100%' },
  fiberLabels: { gap: 6 },
  fiberLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fiberDot: { width: 8, height: 8, borderRadius: 4 },
  fiberLabel: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  fiberDesc: { marginBottom: Spacing.sm },
  fiberDescName: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 2 },
  fiberDescText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  score: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  scoreSummary: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 2,
  },
  tagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: { marginBottom: Spacing.md },
  infoLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
