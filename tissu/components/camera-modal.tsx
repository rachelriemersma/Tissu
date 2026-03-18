import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export default function CameraModal({ visible, onClose, onCapture }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  async function handleCapture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    if (photo?.uri) {
      setCaptured(photo.uri);
    }
  }

  function handleRetake() {
    setCaptured(null);
  }

  function handleConfirm() {
    if (captured) {
      setCaptured(null);
      onCapture(captured);
    }
  }

  if (!visible) return null;

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionText}>
            Tissu needs camera access to scan clothing care labels.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>ALLOW CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top bar */}
            <SafeAreaView edges={['top']}>
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color={Colors.surface} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Viewfinder */}
            <View style={styles.viewfinderWrapper}>
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.instruction}>
                flatten the label and ensure good lighting
              </Text>
            </View>

            {/* Bottom controls */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
              {captured ? (
                <View style={styles.confirmRow}>
                  <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                    <Text style={styles.retakeText}>RETAKE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.captureButton} onPress={handleConfirm}>
                    <Feather name="check" size={28} color={Colors.surface} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                  <View style={styles.captureInner} />
                </TouchableOpacity>
              )}
            </SafeAreaView>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  viewfinderWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  viewfinder: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.surface,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  instruction: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.surface,
    textAlign: 'center',
    marginTop: Spacing.lg,
    opacity: 0.85,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  retakeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  retakeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.surface,
    letterSpacing: 2,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  permissionText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 2,
  },
  permissionButtonText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.surface,
    letterSpacing: 2,
  },
  cancelLink: {
    marginTop: Spacing.lg,
  },
  cancelLinkText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
