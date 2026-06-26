import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<Props> = ({ visible, message }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { backgroundColor: colors.white, borderRadius: 20, padding: 32, alignItems: 'center', minWidth: 160 },
  message: { fontSize: 14, color: colors.textSecondary, marginTop: 12, fontFamily: 'Inter-Regular', textAlign: 'center' },
});

export default LoadingOverlay;
