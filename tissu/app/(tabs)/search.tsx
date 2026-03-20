import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { analyzeLabelImage, analyzeProductUrl } from '@/lib/claude';
import { useScan } from '@/lib/scan-context';
import RecentScanCard from '@/components/recent-scan-card';
import { useScanHistory } from '@/hooks/use-scan-history';
import CameraModal from '@/components/camera-modal';
import LoadingOverlay from '@/components/loading-overlay';

export default function SearchScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('reading the label...');
  const [cameraVisible, setCameraVisible] = useState(false);
  const { setCurrentResult } = useScan();
  const { history } = useScanHistory();

  async function handleUrlSubmit() {
    if (!url.trim()) return;
    Keyboard.dismiss();
    setLoadingMessage('analysing the product...');
    setLoading(true);
    try {
      const result = await analyzeProductUrl(url.trim());
      setCurrentResult(result, 'url');
      router.push('/results');
    } catch (e) {
      Alert.alert('Error', 'Could not analyse this product link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageCaptured(uri: string) {
    setCameraVisible(false);
    setLoadingMessage('reading the label...');
    setLoading(true);
    try {
      console.log('[search] Converting image to base64, uri:', uri);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('[search] Base64 conversion done, length:', base64?.length ?? 0);

      const result = await analyzeLabelImage(base64);
      console.log('[search] Analysis complete, fibers:', result.fibers?.length);
      setCurrentResult(result, 'label');
      router.push('/results');
    } catch (e: any) {
      console.error('[search] Label scan failed:', e?.message ?? e);
      console.error('[search] Full error:', e);
      Alert.alert('Error', e?.message ?? 'Could not read the label. Please try again with a clearer photo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
            {/* Wordmark */}
            <View style={styles.headerSection}>
              <Text style={styles.wordmark}>TISSU</Text>
              <Text style={styles.subtitle}>know what you wear</Text>
            </View>

            {/* URL Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="paste a product link"
                placeholderTextColor={Colors.textSecondary}
                value={url}
                onChangeText={setUrl}
                onSubmitEditing={handleUrlSubmit}
                returnKeyType="go"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {url.length > 0 && (
                <TouchableOpacity style={styles.goButton} onPress={handleUrlSubmit}>
                  <Feather name="arrow-right" size={18} color={Colors.surface} />
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Camera Button */}
            <View style={styles.cameraSection}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setCameraVisible(true)}
                activeOpacity={0.85}
              >
                <Feather name="camera" size={32} color={Colors.surface} />
              </TouchableOpacity>
              <Text style={styles.scanLabel}>SCAN A LABEL</Text>
            </View>

            {/* Recent Scans */}
            {history.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionHeader}>RECENT</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentScroll}
                >
                  {history.map((scan, i) => (
                    <RecentScanCard key={scan.id ?? i} scan={scan} />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleImageCaptured}
      />

      {loading && <LoadingOverlay message={loadingMessage} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  wordmark: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['4xl'],
    color: Colors.textPrimary,
    letterSpacing: 12,
  },
  subtitle: {
    fontFamily: FontFamily.sansLight,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  goButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  cameraSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginTop: Spacing.md,
  },
  recentSection: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },
  recentScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
});
