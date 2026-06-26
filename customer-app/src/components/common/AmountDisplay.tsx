import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface AmountDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  prefix?: string;
  showZeroAsFree?: boolean;
  style?: TextStyle;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  size = 'md',
  color = colors.textPrimary,
  prefix = '₹',
  showZeroAsFree = false,
  style,
}) => {
  if (showZeroAsFree && amount === 0) {
    return <Text style={[styles[size], { color: colors.success }, style]}>Free</Text>;
  }

  const formatted = amount.toLocaleString('en-IN');

  return (
    <Text style={[styles[size], { color }, style]}>
      {prefix}{formatted}
    </Text>
  );
};

const styles = StyleSheet.create({
  sm: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  md: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  lg: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});

export default AmountDisplay;
