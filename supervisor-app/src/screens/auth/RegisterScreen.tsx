import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TextInput, Image, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { LoadingOverlay } from '../../components/common';
import api from '../../services/api';

interface Props { navigation: any }

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Required', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/supervisor/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `+91${phone}`,
        email: email.trim() || undefined,
        password,
      });

      Alert.alert(
        '🎉 Registration Submitted!',
        'Your account is pending admin approval. You will be able to log in once an admin approves your registration.',
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LoadingOverlay visible={loading} message="Submitting registration..." />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.appName}>GoMotarCar</Text>
          <Text style={styles.roleTag}>Supervisor Registration</Text>
        </View>

        <Text style={styles.formTitle}>Create your account</Text>
        <Text style={styles.formSubtitle}>Your account will be reviewed and approved by the admin before you can log in.</Text>

        <View style={styles.form}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>First Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Rahul"
                placeholderTextColor={colors.textLight}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Sharma"
                placeholderTextColor={colors.textLight}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit number"
                placeholderTextColor={colors.textLight}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.standaloneInput]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Password *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Confirm Password *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7}>
                <Icon name={showConfirm ? 'eye-off' : 'eye'} size={22} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon name="information-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>
              After registration, your account will be reviewed by the admin. Once approved, you'll be able to log in.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.registerBtnText}>Submit Registration</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  logoImg: {
    width: 56,
    height: 56,
    marginBottom: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  roleTag: {
    fontSize: 13,
    color: colors.primaryBlue,
    marginTop: 4,
    fontFamily: 'Inter-Medium',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  form: {},
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    fontFamily: 'Inter-Medium',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F0F4FF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  prefixText: { fontSize: 15, color: colors.primaryBlue, fontFamily: 'Inter-Medium' },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'Inter-Regular',
  },
  standaloneInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBlue,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  loginLink: {
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
});

export default RegisterScreen;
