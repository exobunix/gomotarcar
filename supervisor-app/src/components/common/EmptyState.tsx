import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  icon?: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<Props> = ({ icon, title, description }) => (
  <View style={styles.container}>
    {icon && <Text style={styles.icon}>{icon}</Text>}
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', fontFamily: 'Inter-SemiBold' },
  description: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20, fontFamily: 'Inter-Regular' },
});

export default EmptyState;
