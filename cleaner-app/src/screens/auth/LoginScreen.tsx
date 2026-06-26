import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image, TextInput, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { loginCleaner, sendOtp } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    if (phone.length < 10) { Alert.alert('Error', 'Enter valid mobile number'); return; }
    if (!password) { Alert.alert('Error', 'Enter password'); return; }

    try {
      await dispatch(loginCleaner({ phone: `+91${phone}`, password })).unwrap();
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Login failed');
    }
  };

  const handleLoginWithOtp = async () => {
    if (phone.length < 10) { Alert.alert('Error', 'Enter valid mobile number'); return; }
    try {
      await dispatch(sendOtp(`+91${phone}`)).unwrap();
      navigation.navigate('OTPVerification', { phone: `+91${phone}` });
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to send OTP');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>• CLEANER APP •</Text>
          </View>
        </View>

        <Image source={require('../../assets/cleaner_wash.png')} style={styles.illustration} resizeMode="contain" />

        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Welcome Back!</Text>
          <Text style={styles.subtitleText}>Login to continue to your account</Text>
        </View>

        <View style={styles.formSection}>
          {/* Phone Input */}
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.phoneIconBg}>
              <Text style={{ fontSize: 16 }}>📞</Text>
            </View>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>+91</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your mobile number"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <View style={styles.phoneIconBg}>
              <Text style={{ fontSize: 16 }}>🔒</Text>
            </View>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setSecureText(!secureText)}>
              <Text style={{ fontSize: 16 }}>{secureText ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Please contact your supervisor to reset your password.')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={[styles.submitBtn, (phone.length < 10 || isLoading) && styles.disabledBtn]} onPress={handleLogin} disabled={isLoading || phone.length < 10}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>✓  Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OTP Button */}
          <TouchableOpacity style={styles.otpBtn} onPress={handleLoginWithOtp} disabled={isLoading}>
            <Text style={styles.otpBtnText}>🔓  Login with OTP</Text>
          </TouchableOpacity>

          {/* Register Button */}
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Medium' }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 14, color: colors.primaryBlue, fontFamily: 'Inter-Bold', fontWeight: '700' }}>
                Register as Cleaner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Supervisor Card */}
          <TouchableOpacity style={styles.supervisorCard} onPress={() => navigation.navigate('Support')}>
            <View style={styles.supervisorIconBg}>
              <Text style={{ fontSize: 18 }}>🎧</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.supTitle}>Need Help?</Text>
              <Text style={styles.supSub}>Contact your supervisor for assistance.</Text>
            </View>
            <Text style={styles.supArrow}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  topSection: { alignItems: 'center', marginTop: 32 },
  logoImage: { width: width * 0.72, height: 70 },
  badgeContainer: { backgroundColor: colors.primaryBlue, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 1 },
  illustration: { width: width * 0.8, height: width * 0.5, alignSelf: 'center', marginVertical: 10 },
  titleSection: { alignItems: 'center', marginVertical: 10 },
  titleText: { fontSize: 24, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  subtitleText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 4 },
  formSection: { paddingHorizontal: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, fontFamily: 'Inter-SemiBold', marginTop: 16, marginBottom: 8 },
  phoneInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, height: 56, paddingHorizontal: 12,
  },
  phoneIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  countryCodeContainer: { flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border, paddingRight: 10, marginLeft: 8, height: '60%' },
  countryCodeText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginRight: 4 },
  dropdownArrow: { fontSize: 8, color: colors.textSecondary },
  phoneInput: { flex: 1, height: '100%', marginLeft: 12, fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Regular' },
  passwordInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, height: 56, paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, height: '100%', marginLeft: 12, fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Regular' },
  eyeBtn: { padding: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  checkboxActive: { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
  checkboxTick: { color: colors.white, fontSize: 12, fontWeight: '700' },
  checkboxText: { fontSize: 13, color: colors.textSecondary, marginLeft: 8, fontFamily: 'Inter-Medium' },
  forgotText: { fontSize: 13, color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  submitBtn: {
    height: 56, borderRadius: 14, backgroundColor: colors.primaryBlue,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: colors.white, fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },
  disabledBtn: { opacity: 0.7 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 14, fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  otpBtn: {
    height: 56, borderRadius: 14, backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.primaryBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  otpBtnText: { color: colors.primaryBlue, fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },
  supervisorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 14, borderStyle: 'solid', borderWidth: 1, borderColor: colors.border,
    padding: 14, marginTop: 24,
  },
  supervisorIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  supTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  supSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  supArrow: { fontSize: 18, color: colors.textSecondary },
});

export default LoginScreen;
