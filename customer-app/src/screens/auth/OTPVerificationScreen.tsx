import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import OTPInput from '../../components/ui/OTPInput';
import { sendOtp, verifyOtp } from '../../redux/slices/authSlice';
import { maskPhone } from '../../utils/helpers';
import { AppDispatch, RootState } from '../../redux/store';

interface OTPVerificationScreenProps {
  navigation: any;
  route: any;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { phone, mode = 'login' } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('Please enter the complete OTP');
      return;
    }
    setError('');

    try {
      const verified = await dispatch(verifyOtp({ phone, otp })).unwrap();
      if (verified) {
        if (mode === 'register') {
          navigation.navigate('Registration', { phone });
        } else {
          // Login flow — try to login
          navigation.navigate('Registration', { phone });
        }
      }
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(sendOtp(phone)).unwrap();
      setTimer(30);
      setCanResend(false);
      setOtp('');
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
      </View>

      <View style={styles.contentSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔐</Text>
        </View>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to{' '}
          <Text style={styles.phoneText}>{maskPhone(phone)}</Text>
        </Text>

        <View style={styles.otpSection}>
          <OTPInput
            length={4}
            value={otp}
            onChangeValue={(val) => {
              setOtp(val);
              setError('');
            }}
            error={error}
          />
        </View>

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          size="lg"
          style={styles.verifyBtn}
          disabled={otp.length < 4}
        />

        <View style={styles.resendSection}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerValue}>{timer}s</Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  lockIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 32,
  },
  phoneText: {
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  otpSection: {
    width: '100%',
    marginBottom: 32,
  },
  verifyBtn: {
    width: '100%',
  },
  resendSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  timerValue: {
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
});

export default OTPVerificationScreen;
