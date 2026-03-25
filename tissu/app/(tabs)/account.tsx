import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { supabase, WishlistItem, Profile } from '@/lib/supabase';
import { useScanHistory } from '@/hooks/use-scan-history';
import { useScan } from '@/lib/scan-context';
import type { User } from '@supabase/supabase-js';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

type AccountTab = 'HISTORY' | 'WISHLIST';

export default function AccountScreen() {
  const [activeTab, setActiveTab] = useState<AccountTab>('HISTORY');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { history, fetchHistory } = useScanHistory();
  const { setCurrentResult } = useScan();

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUser();
      fetchWishlist();
      fetchHistory();
    }, [])
  );

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      if (profileData) setProfile(profileData as Profile);
    }
  }

  async function fetchWishlist() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    if (data) setWishlist(data as WishlistItem[]);
  }

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  }

  const displayName = profile?.display_name || user?.user_metadata?.name;
  const avatarUrl = profile?.avatar_url;
  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileSection}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {displayName && (
            <Text style={styles.name}>{displayName}</Text>
          )}
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/edit-profile')}
          >
            <Feather name="edit-2" size={14} color={Colors.textSecondary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['HISTORY', 'WISHLIST'] as AccountTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* History Tab */}
        {activeTab === 'HISTORY' && (
          <View style={styles.tabContent}>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No scans yet.</Text>
                <Text style={styles.emptySubtext}>
                  Scan a label or paste a product link to get started.
                </Text>
              </View>
            ) : (
              history.map((scan, i) => {
                const r = scan.result_json;
                const title = r.productName
                  ? `${r.brand ? r.brand + ' — ' : ''}${r.productName}`
                  : `Label scan · ${formatDate(scan.created_at ?? '')}`;
                const fiberSummary = r.fibers
                  .slice(0, 3)
                  .map((f) => `${f.percentage}% ${f.name}`)
                  .join(' · ');
                return (
                  <TouchableOpacity
                    key={scan.id ?? i}
                    style={styles.historyRow}
                    onPress={() => {
                      setCurrentResult(r, scan.type);
                      router.push('/results');
                    }}
                  >
                    {r.imageUrl ? (
                      <Image source={{ uri: r.imageUrl }} style={styles.historyThumb} />
                    ) : (
                      <View style={[styles.historyThumb, styles.historyThumbPlaceholder]}>
                        <Feather name="tag" size={16} color={Colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{title}</Text>
                      <Text style={styles.historyFibers} numberOfLines={1}>{fiberSummary}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'WISHLIST' && (
          <View style={styles.tabContent}>
            {wishlist.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Your wishlist is empty.</Text>
                <Text style={styles.emptySubtext}>
                  Heart items in Explore or results to save them here.
                </Text>
              </View>
            ) : (
              <View style={styles.wishlistGrid}>
                {wishlist.map((item, i) => {
                  const d = item.item_data_json;
                  return (
                    <View key={item.id ?? i} style={styles.wishCard}>
                      {d.image ? (
                        <Image source={{ uri: d.image }} style={styles.wishImage} />
                      ) : (
                        <View style={[styles.wishImage, styles.wishImagePlaceholder]} />
                      )}
                      <View style={styles.wishInfo}>
                        <Text style={styles.wishBrand}>{d.brand?.toUpperCase()}</Text>
                        <Text style={styles.wishName} numberOfLines={2}>{d.name}</Text>
                        {d.price ? <Text style={styles.wishPrice}>{d.price}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Settings / Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.lg,
    color: Colors.surface,
    letterSpacing: 2,
  },
  name: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  username: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  email: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bio: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
  },
  editBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  tabText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 3,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '20%',
    right: '20%',
    height: 1.5,
    backgroundColor: Colors.textPrimary,
  },
  tabContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyText: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  historyThumb: {
    width: 52,
    height: 52,
    borderRadius: 4,
  },
  historyThumbPlaceholder: {
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  historyFibers: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  wishlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  wishCard: { width: ITEM_WIDTH },
  wishImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  wishImagePlaceholder: { backgroundColor: Colors.border },
  wishInfo: {},
  wishBrand: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 2,
  },
  wishName: {
    fontFamily: FontFamily.serif,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  wishPrice: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
