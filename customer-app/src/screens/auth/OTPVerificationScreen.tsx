import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import { sendOtp, verifyOtp } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface OTPVerificationScreenProps {
  navigation: any;
  route: any;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { phone } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(58);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    if (cleanText && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = code.join('');
    if (otpValue.length < 6) {
      setError('Please enter complete 6-digit OTP code');
      return;
    }
    setError('');

    try {
      await dispatch(verifyOtp({ phone, otp: otpValue })).unwrap();
      navigation.navigate('Registration', { phone });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(sendOtp(phone)).unwrap();
      setTimer(58);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      setError('');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} message="Verifying OTP..." />

      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.brandHeader}>
          <Text style={styles.logoText}>GOMOTARCAR</Text>
          <Text style={styles.logoTagline}>Anything & Everything For Your Car</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.title}>Verify Your OTP</Text>
        <Text style={styles.subtitle}>
          We have sent a One Time Password (OTP)\nto your mobile number
        </Text>

        <View style={styles.phoneDisplayRow}>
          <Text style={styles.phoneDisplayLabel}>+91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changePhoneLink}>Change Number ✎</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.enterOtpLabel}>Enter 6-digit OTP</Text>
        <View style={styles.otpGrid}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => (inputs.current[idx] = ref)}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.timerRow}>
          <Text style={styles.timerText}>
            ⏱ OTP will expire in{' '}
            <Text style={styles.timerDuration}>
              {`00:${timer < 10 ? '0' + timer : timer}`}
            </Text>
          </Text>
          <TouchableOpacity disabled={!canResend} onPress={handleResend}>
            <Text style={[styles.resendLink, !canResend ? styles.resendDisabled : null]}>
              Resend OTP ↻
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notReceivedAlert}>
          <Text style={styles.alertText}>
            ✓ Didn't receive the OTP? Check your SMS or try resending.
          </Text>
        </View>

        <Button
          title="Verify OTP"
          onPress={handleVerify}
          size="lg"
          style={styles.verifyBtn}
        />
      </View>

      <View style={styles.securitySection}>
        <View style={styles.securityBox}>
          <View style={styles.securityTitleRow}>
            <Text style={styles.securityLockEmoji}>🔒</Text>
            <View>
              <Text style={styles.securityTitle}>Your Security is Our Priority</Text>
              <Text style={styles.securitySubtitle}>Your information is safe with GoMotorCar. We never share your details with anyone.</Text>
            </View>
          </View>
          <View style={styles.securityBadgesRow}>
            <Text style={styles.securityBadge}>✓ Secure Login</Text>
            <Text style={styles.securityBadge}>✓ Encrypted Data</Text>
            <Text style={styles.securityBadge}>✓ Privacy Protected</Text>
          </View>
        </View>
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
  },
  backBtn: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  brandHeader: {
    flex: 1,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryBlue,
    letterSpacing: 1.2,
    fontFamily: 'Inter-Bold',
  },
  logoTagline: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  contentSection: {
    width: '100%',
    marginTop: -40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 16,
  },
  phoneDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EAF3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  phoneDisplayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  changePhoneLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontFamily: 'Inter-Medium',
  },
  enterOtpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#EAF3FF',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
    marginBottom: 10,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  timerDuration: {
    color: colors.primaryBlue,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  resendDisabled: {
    color: '#94A3B8',
  },
  notReceivedAlert: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  alertText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  verifyBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
  },
  securitySection: {
    paddingBottom: 40,
  },
  securityBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
  },
  securityTitleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  securityLockEmoji: {
    fontSize: 24,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 12,
    width: width - 110,
  },
  securityBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  securityBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#22C55E',
    fontFamily: 'Inter-SemiBold',
  },
});

export default OTPVerificationScreen;
