import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { supabase, Profile } from '@/lib/supabase';

export default function EditProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace('/auth/login');
      return;
    }
    setUserId(userData.user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (data) {
      setDisplayName(data.display_name ?? '');
      setUsername(data.username ?? '');
      setBio(data.bio ?? '');
      setAvatarUrl(data.avatar_url ?? null);
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, which is fine for new users
      console.error('[edit-profile] Failed to load profile:', error.message);
    }
  }

  async function pickAvatar() {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    await uploadAvatar(asset.uri);
  }

  async function uploadAvatar(uri: string) {
    if (!userId) return;
    setUploading(true);

    try {
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${userId}.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });

      if (uploadError) {
        console.error('[edit-profile] Avatar upload failed:', uploadError.message);
        Alert.alert('Upload failed', 'Could not upload profile picture. Please try again.');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      // Append cache-buster so the image updates immediately
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
    } catch (e: any) {
      console.error('[edit-profile] Avatar upload error:', e?.message ?? e);
      Alert.alert('Upload failed', 'Something went wrong uploading your photo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!userId) return;
    if (!displayName.trim()) {
      Alert.alert('Required', 'Please enter a display name.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Required', 'Please enter a username.');
      return;
    }

    setLoading(true);
    try {
      const profile: Profile = {
        user_id: userId,
        display_name: displayName.trim(),
        username: username.trim().toLowerCase(),
        avatar_url: avatarUrl ?? undefined,
        bio: bio.trim() || undefined,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'user_id' });

      if (error) {
        console.error('[edit-profile] Save failed:', error.message);
        if (error.message.includes('unique') || error.message.includes('duplicate')) {
          Alert.alert('Username taken', 'That username is already in use. Please choose another.');
        } else {
          Alert.alert('Error', 'Could not save profile. Please try again.');
        }
        return;
      }

      router.back();
    } catch (e: any) {
      console.error('[edit-profile] Save error:', e?.message ?? e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : username
    ? username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Feather name="x" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.iconBtn}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickAvatar} disabled={uploading} activeOpacity={0.7}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                {uploading ? (
                  <ActivityIndicator size="small" color={Colors.surface} />
                ) : (
                  <Feather name="camera" size={14} color={Colors.surface} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
              <TextInput
                style={styles.fieldInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>USERNAME</Text>
              <TextInput
                style={styles.fieldInput}
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>BIO</Text>
              <TextInput
                style={[styles.fieldInput, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself (optional)"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBtn: { padding: Spacing.sm },
  title: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  saveText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xl,
    color: Colors.surface,
    letterSpacing: 2,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarHint: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  fields: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  field: {},
  fieldLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  fieldInput: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  bioInput: {
    minHeight: 90,
    paddingTop: 14,
  },
});
