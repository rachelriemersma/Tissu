import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { ScanRecord } from '@/lib/supabase';
import { useScan } from '@/lib/scan-context';

interface Props {
  scan: ScanRecord;
}

export default function RecentScanCard({ scan }: Props) {
  const { setCurrentResult } = useScan();
  const result = scan.result_json;

  function handlePress() {
    setCurrentResult(result, scan.type);
    router.push('/results');
  }

  const title = result.productName
    ? `${result.brand ? result.brand + ' — ' : ''}${result.productName}`
    : `Label scan`;

  const fiberSummary = result.fibers
    .slice(0, 2)
    .map((f) => `${f.percentage}% ${f.name}`)
    .join(' · ');

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      {result.imageUrl ? (
        <Image source={{ uri: result.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🏷</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.fibers} numberOfLines={1}>{fiberSummary}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  info: {
    padding: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  fibers: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
