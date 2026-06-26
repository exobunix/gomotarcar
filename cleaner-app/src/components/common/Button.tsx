import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, style, textStyle }) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[`size_${size}`], isDisabled && styles.disabled, style]}
      onPress={onPress} disabled={isDisabled} activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primaryBlue : colors.white} size="small" />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, minHeight: 56 },
  primary: { backgroundColor: colors.primaryBlue },
  secondary: { backgroundColor: colors.lightBlue },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primaryBlue },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 40 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 32 },
  text: { fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  text_primary: { color: colors.white, fontSize: 16 },
  text_secondary: { color: colors.primaryBlue, fontSize: 16 },
  text_outline: { color: colors.primaryBlue, fontSize: 16 },
  text_ghost: { color: colors.primaryBlue, fontSize: 15 },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});

export default Button;
