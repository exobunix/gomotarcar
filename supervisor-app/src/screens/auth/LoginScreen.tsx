import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import { login, clearError, logout, loadProfile } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert('Required', 'Please enter your password');
      return;
    }
    dispatch(clearError());
    const result = await dispatch(login({ phone: `+91${phone}`, password })) as any;

    if (result.meta.requestStatus === 'fulfilled') {
      // Check role
      const role = result.payload?.user?.role;
      if (role && role !== 'supervisor') {
        Alert.alert(
          'Wrong App',
          `This account has the role "${role}". Only supervisors can log in here.`,
        );
        dispatch(logout());
      } else {
        dispatch(loadProfile());
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LoadingOverlay visible={isLoading} message="Signing in..." />
      <View style={styles.content}>

        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <Text style={styles.appName}>GoMotarCar</Text>
          <Text style={styles.roleTag}>Supervisor Panel</Text>
        </View>

        <View style={styles.form}>

          {/* Phone Field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit number"
                placeholderTextColor={colors.textLight}
                value={phone}
                onChangeText={(t) => { setPhone(t.replace(/[^0-9]/g, '').slice(0, 10)); dispatch(clearError()); }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={(t) => { setPassword(t); dispatch(clearError()); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button title="Sign In" onPress={handleLogin} size="lg" fullWidth loading={isLoading} />

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>GoMotarCar Supervisor v1.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: colors.white, fontFamily: 'Inter-Bold' },
  appName: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  roleTag: {
    fontSize: 14, color: colors.primaryBlue, marginTop: 4,
    fontFamily: 'Inter-Medium', backgroundColor: colors.lightBlue,
    paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20,
  },
  form: { marginBottom: 32 },
  fieldWrapper: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, fontFamily: 'Inter-Medium' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    backgroundColor: '#FAFAFA', overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: 12, paddingVertical: 14,
    backgroundColor: '#F0F4FF', borderRightWidth: 1, borderRightColor: '#E0E0E0',
  },
  prefixText: { fontSize: 15, color: colors.primaryBlue, fontFamily: 'Inter-Medium' },
  textInput: {
    flex: 1, paddingHorizontal: 12, paddingVertical: 14,
    fontSize: 15, color: colors.textPrimary, fontFamily: 'Inter-Regular',
  },
  eyeButton: {
    paddingHorizontal: 12, paddingVertical: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  eyeIcon: { fontSize: 18 },
  errorText: {
    fontSize: 13, color: colors.error, textAlign: 'center',
    marginBottom: 12, fontFamily: 'Inter-Regular',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular',
  },
  registerLink: {
    fontSize: 14, color: colors.primaryBlue, fontWeight: '700', fontFamily: 'Inter-SemiBold',
  },
  footerText: { textAlign: 'center', fontSize: 12, color: colors.textLight, fontFamily: 'Inter-Regular' },
});

export default LoginScreen;
