import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import Input from '../../components/common/Input';
import { sendOtp } from '../../redux/slices/authSlice';
import { isValidPhone } from '../../utils/validators';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

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
        <View style={styles.brandHeader}>
          <Text style={styles.logoEmoji}>🚗</Text>
          <Text style={styles.brandTitle}>GOMOTARCAR</Text>
          <Text style={styles.brandTagline}>Anything & Everything For Your Car</Text>
        </View>
        
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to continue to your account</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.inputLabel}>Login with Mobile Number</Text>
        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.countryCodeText}>+91</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
          <View style={styles.divider} />
          <Input
            placeholder="Enter mobile number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
              setPhoneError('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.phoneInputField}
            containerStyle={styles.phoneInputWrap}
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        <View style={styles.agreementRow}>
          <Text style={styles.agreementTick}>✓</Text>
          <Text style={styles.agreementText}>
            We will send you a One Time Password (OTP)\non this number
          </Text>
        </View>

        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          size="lg"
          style={styles.submitBtn}
          disabled={phone.length !== 10}
        />

        <View style={styles.orSection}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.socialButtonsRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}> Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}> Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityBadge}>
          <Text style={styles.securityBadgeText}>🔒 Your data is safe and secure with us</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={() => navigation.navigate('Registration', { phone })}>
          <Text style={styles.registerPrompt}>
            Don't have an account? <Text style={styles.registerLink}>Register Now ›</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 60,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryBlue,
    letterSpacing: 1.5,
    fontFamily: 'Inter-Bold',
  },
  brandTagline: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  formSection: {
    width: '100%',
    marginTop: -20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 56,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  dropdownArrow: {
    fontSize: 8,
    color: '#64748B',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  phoneInputWrap: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    height: '100%',
    margin: 0,
    padding: 0,
  },
  phoneInputField: {
    borderWidth: 0,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  agreementTick: {
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  submitBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
  },
  orSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    fontFamily: 'Inter-SemiBold',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  securityBadge: {
    alignItems: 'center',
    marginBottom: 10,
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    fontFamily: 'Inter-Medium',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  registerLink: {
    color: colors.primaryBlue,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});

export default LoginScreen;
