import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { EDITS, FILTER_TAGS } from '@/data/edits';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

export default function ExploreScreen() {
  const [activeTag, setActiveTag] = useState('ALL');

  const filtered = activeTag === 'ALL'
    ? EDITS
    : EDITS.filter((e) => e.tag === activeTag);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>EXPLORE</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterTab, activeTag === tag && styles.filterTabActive]}
              onPress={() => setActiveTag(tag)}
            >
              <Text style={[styles.filterTabText, activeTag === tag && styles.filterTabTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Edit */}
        {featured && (
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => router.push(`/explore/${featured.id}`)}
            activeOpacity={0.92}
          >
            <Image source={{ uri: featured.coverImage }} style={styles.featuredImage} />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>{featured.title}</Text>
              <Text style={styles.featuredCount}>{featured.items.length} pieces</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <View style={styles.grid}>
            {rest.map((edit) => (
              <TouchableOpacity
                key={edit.id}
                style={styles.gridCard}
                onPress={() => router.push(`/explore/${edit.id}`)}
                activeOpacity={0.88}
              >
                <Image source={{ uri: edit.coverImage }} style={styles.gridImage} />
                <Text style={styles.gridTitle}>{edit.title}</Text>
                <Text style={styles.gridCount}>{edit.items.length} pieces</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No edits in this category yet.</Text>
          </View>
        )}

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
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterTabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterTabText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  filterTabTextActive: {
    color: Colors.surface,
  },
  featuredCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 4,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 320,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['2xl'],
    color: Colors.surface,
    letterSpacing: 2,
  },
  featuredCount: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  gridCard: {
    width: CARD_WIDTH,
  },
  gridImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 2,
  },
  gridTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  gridCount: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
