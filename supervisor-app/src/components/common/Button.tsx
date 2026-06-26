import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const Button: React.FC<Props> = ({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style, fullWidth }) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && { width: '100%' },
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primaryBlue} size="small" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], isDisabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: colors.primaryBlue },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primaryBlue },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  sm: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
  md: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
  lg: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 56 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  primaryText: { color: colors.white },
  outlineText: { color: colors.primaryBlue },
  ghostText: { color: colors.primaryBlue },
  dangerText: { color: colors.white },
  smText: { fontSize: 13 },
  mdText: { fontSize: 14 },
  lgText: { fontSize: 16 },
  disabledText: { opacity: 0.7 },
});

export default Button;
