import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { EDITS } from '@/data/edits';
import { ExploreItem } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

export default function EditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const edit = EDITS.find((e) => e.id === id);
  const [heartedItems, setHeartedItems] = useState<Set<string>>(new Set());

  if (!edit) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Edit not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function toggleHeart(item: ExploreItem) {
    const { data: user } = await supabase.auth.getUser();
    const newSet = new Set(heartedItems);
    if (newSet.has(item.id)) {
      newSet.delete(item.id);
    } else {
      newSet.add(item.id);
      if (user.user) {
        await supabase.from('wishlist').insert([{
          user_id: user.user.id,
          item_data_json: item,
        }]);
      }
    }
    setHeartedItems(newSet);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: edit.coverImage }} style={styles.heroImage} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={Colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Edit info */}
        <View style={styles.editInfo}>
          <Text style={styles.editTitle}>{edit.title}</Text>
          <Text style={styles.editDescription}>{edit.description}</Text>
        </View>

        {/* Item grid */}
        <View style={styles.grid}>
          {edit.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                onPress={() => Linking.openURL(item.link)}
                activeOpacity={0.88}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => toggleHeart(item)}
              >
                <Feather
                  name="heart"
                  size={16}
                  color={heartedItems.has(item.id) ? Colors.heart : Colors.textSecondary}
                />
              </TouchableOpacity>
              <View style={styles.itemInfo}>
                <Text style={styles.itemBrand}>{item.brand.toUpperCase()}</Text>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroWrapper: { position: 'relative' },
  heroImage: { width: '100%', height: 320 },
  backBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20,
  },
  editInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  editTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  editDescription: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  itemCard: {
    width: ITEM_WIDTH,
    position: 'relative',
  },
  itemImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    borderRadius: 2,
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  itemBrand: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 2,
  },
  itemName: {
    fontFamily: FontFamily.serif,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  itemPrice: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, color: Colors.textSecondary },
});
