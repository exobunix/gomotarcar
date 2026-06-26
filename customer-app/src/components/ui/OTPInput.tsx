import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { colors } from '../../theme/colors';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeValue: (otp: string) => void;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value,
  onChangeValue,
  error,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= length) {
      onChangeValue(numeric);
    }
  };

  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  return (
    <View style={styles.container}>
      <TouchableArea onPress={handlePress}>
        <View style={styles.codeContainer}>
          {digits.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.codeBox,
                digit !== ' ' && styles.codeBoxFilled,
                isFocused && styles.codeBoxFocused,
                error ? styles.codeBoxError : undefined,
              ]}
            >
              <Text style={[styles.codeText, digit !== ' ' && styles.codeTextFilled]}>
                {digit}
              </Text>
              {isFocused && digit === ' ' && index === value.length && (
                <View style={styles.cursor} />
              )}
            </View>
          ))}
        </View>
      </TouchableArea>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const TouchableArea: React.FC<{ onPress: () => void; children: React.ReactNode }> = ({
  onPress,
  children,
}) => (
  <View onTouchEnd={onPress}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  codeBox: {
    width: 56,
    height: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  codeBoxFilled: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.lightBlue,
  },
  codeBoxFocused: {
    borderColor: colors.primaryBlue,
  },
  codeBoxError: {
    borderColor: colors.error,
  },
  codeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: colors.textSecondary,
  },
  codeTextFilled: {
    color: colors.textPrimary,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: colors.primaryBlue,
    position: 'absolute',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
});

export default OTPInput;
