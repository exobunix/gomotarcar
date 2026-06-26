import React from 'react';
import { View, StyleSheet, ViewStyle, ReactNode } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  children: ReactNode;
  variant?: 'elevated' | 'outlined';
  padding?: number;
  style?: ViewStyle;
}

const Card: React.FC<Props> = ({ children, variant = 'outlined', padding = 16, style }) => (
  <View style={[styles.base, variant === 'elevated' ? styles.elevated : styles.outlined, { padding }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: { borderRadius: 20 },
  elevated: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
