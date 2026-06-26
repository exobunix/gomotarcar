import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { LoadingOverlay } from '../../components/common';
import { sendOtp, verifyOtp } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

const OTPBoxes: React.FC<{ value: string; onChange: (v: string) => void; error?: boolean }> = ({ value, onChange, error }) => {
  const textInputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);
  
  return (
    <TouchableOpacity style={otpStyles.container} activeOpacity={1} onPress={() => textInputRef.current?.focus()}>
      <View style={otpStyles.row}>
        {digits.map((d, i) => {
          const isFocused = value.length === i;
          const isFilled = d !== ' ';
          return (
            <View 
              key={i} 
              style={[
                otpStyles.box, 
                isFocused && otpStyles.focused, 
                isFilled && otpStyles.filled, 
                error && otpStyles.error
              ]}
            >
              <Text style={otpStyles.text}>{isFilled ? d : '-'}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={textInputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        style={otpStyles.hiddenInput}
        caretHidden
      />
    </TouchableOpacity>
  );
};

const otpStyles = StyleSheet.create({
  container: { width: '100%', marginVertical: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  box: {
    width: (width - 80) / 6,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focused: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filled: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
  },
  error: {
    borderColor: colors.error,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
});

interface Props { navigation: any; route: any }

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(105); // 01:45 countdown
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((p) => {
        if (p <= 1) {
          setCanResend(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert('Error', 'Enter 6-digit OTP');
      setError(true);
      return;
    }
    setError(false);
    try {
      const verified = await dispatch(verifyOtp({ phone, otp })).unwrap();
      if (verified) {
        Alert.alert('Success', 'OTP verified. You can now login with your password.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err: any) {
      setError(true);
      Alert.alert('Error', typeof err === 'string' ? err : 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(sendOtp(phone)).unwrap();
      setTimer(105);
      setCanResend(false);
      setOtp('');
      setError(false);
      Alert.alert('Success', 'OTP Resent successfully');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LoadingOverlay visible={isLoading} message="Verifying OTP..." />
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoSection}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>• CLEANER APP •</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Security Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationOuterRing}>
            <View style={styles.illustrationInnerRing}>
              <Text style={styles.shieldEmoji}>🛡️</Text>
              <Text style={styles.lockEmoji}>🔒</Text>
              <Text style={styles.dotsEmoji}>💬</Text>
            </View>
          </View>
        </View>

        {/* Title & Mobile Details */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Verify Your Mobile Number</Text>
          <Text style={styles.subtitleText}>Enter the 6-digit OTP sent to</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.phoneText}>{formattedPhone}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.formSection}>
          <OTPBoxes value={otp} onChange={(v) => { setOtp(v); setError(false); }} error={error} />

          {/* Security Banner Card */}
          <View style={styles.securityCard}>
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.securityTitle}>Your security is important to us</Text>
              <Text style={styles.securitySub}>We will never share your OTP with anyone.</Text>
            </View>
          </View>

          {/* Expiration Timer */}
          <View style={styles.timerRow}>
            <Text style={styles.clockIcon}>🕒</Text>
            <Text style={styles.timerText}>
              OTP will expire in <Text style={styles.timerValue}>{formatTimer(timer)}</Text>
            </Text>
          </View>

          {/* Verify & Continue Button */}
          <TouchableOpacity style={[styles.submitBtn, otp.length < 6 && styles.disabledBtn]} onPress={handleVerify} disabled={otp.length < 6}>
            <Text style={styles.submitBtnText}>✓  Verify & Continue</Text>
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the OTP?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
                <Text style={styles.resendText}>🔄 Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendDisabledText}>Resend OTP</Text>
            )}
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  logoSection: { alignItems: 'center', flex: 1 },
  logoImage: { width: width * 0.4, height: 40 },
  badgeContainer: { backgroundColor: colors.primaryBlue, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
  badgeText: { color: colors.white, fontSize: 8, fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 1 },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  illustrationOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInnerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldEmoji: { fontSize: 44, zIndex: 1 },
  lockEmoji: { fontSize: 22, position: 'absolute', top: 12, right: 12, zIndex: 2 },
  dotsEmoji: { fontSize: 20, position: 'absolute', bottom: 12, left: 12, zIndex: 2 },
  titleSection: { alignItems: 'center', paddingHorizontal: 24, marginVertical: 10 },
  titleText: { fontSize: 22, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  subtitleText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 6, textAlign: 'center' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  phoneText: { fontSize: 15, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  editBtn: { marginLeft: 8, padding: 4 },
  editIcon: { fontSize: 14 },
  formSection: { paddingHorizontal: 24 },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D0E1FD',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  securityTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  securitySub: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  clockIcon: { fontSize: 14, marginRight: 6 },
  timerText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  timerValue: { fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  submitBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  submitBtnText: { color: colors.white, fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },
  disabledBtn: { opacity: 0.6 },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  resendLabel: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  resendBtn: { marginLeft: 6 },
  resendText: { fontSize: 13, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  resendDisabledText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6, opacity: 0.5 },
});

export default OTPVerificationScreen;
