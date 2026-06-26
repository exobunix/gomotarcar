import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

const Header: React.FC<Props> = ({ title, onBack, rightAction, style }) => (
  <View style={[styles.header, style]}>
    {onBack ? (
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.placeholder} />
    )}
    <Text style={styles.title} numberOfLines={1}>{title}</Text>
    {rightAction || <View style={styles.placeholder} />}
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: colors.primaryBlue, fontWeight: '600' },
  placeholder: { width: 40 },
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', flex: 1, textAlign: 'center', marginHorizontal: 8 },
});

export default Header;
