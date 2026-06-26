import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  description: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, fontFamily: 'Inter-Regular' },
});

export default EmptyState;
