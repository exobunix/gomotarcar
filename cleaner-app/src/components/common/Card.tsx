import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
}

const Card: React.FC<CardProps> = ({ children, style, variant = 'default', padding = 16 }) => (
  <View style={[styles.base, styles[variant], { padding }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  base: { backgroundColor: colors.white, borderRadius: 20 },
  default: { backgroundColor: colors.white },
  elevated: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  outlined: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
});

export default Card;
