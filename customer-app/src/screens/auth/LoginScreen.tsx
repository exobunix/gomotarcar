import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import Input from '../../components/common/Input';
import { sendOtp } from '../../redux/slices/authSlice';
import { isValidPhone } from '../../utils/validators';
import { AppDispatch, RootState } from '../../redux/store';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleSendOtp = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');

    try {
      await dispatch(sendOtp(phone)).unwrap();
      navigation.navigate('OTPVerification', { phone });
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to send OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={isLoading} message="Sending OTP..." />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🚗</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to receive an OTP
        </Text>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Mobile Number"
          placeholder="Enter your 10-digit number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
            setPhoneError('');
          }}
          keyboardType="phone-pad"
          maxLength={10}
          error={phoneError}
          leftIcon={<Text style={{ fontSize: 18 }}>📱</Text>}
        />

        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          size="lg"
          style={styles.submitBtn}
          disabled={phone.length !== 10}
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formSection: {
    paddingHorizontal: 24,
    flex: 1,
  },
  submitBtn: {
    width: '100%',
    marginTop: 8,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  linkText: {
    color: colors.primaryBlue,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default LoginScreen;
