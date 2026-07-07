import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { registerUser } from '../../redux/slices/authSlice';
import { isValidName, isValidEmail } from '../../utils/validators';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface RegistrationScreenProps {
  navigation: any;
  route: any;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  navigation,
  route,
}) => {
  const { phone } = route.params || { phone: '' };
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(true);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [confPassError, setConfPassError] = useState('');

  const handleRegister = async () => {
    let hasError = false;

    if (!isValidName(name)) {
      setNameError('Please enter your full name');
      hasError = true;
    }
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    if (password.length < 8) {
      setPassError('Password must be at least 8 characters long');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfPassError('Passwords do not match');
      hasError = true;
    }
    if (!agree) {
      Alert.alert('Agreement Required', 'Please agree to the Terms & Conditions');
      return;
    }

    if (hasError) return;

    try {
      await dispatch(
        registerUser({ phone, name: name.trim(), email: email.trim() || undefined })
      ).unwrap();
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={isLoading} message="Creating account..." />

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>
          Join GoMotorCar and experience hassle-free car care and services
        </Text>

        <View style={styles.formSection}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            error={nameError}
            leftIcon={<Text style={{ fontSize: 16 }}>👤</Text>}
          />

          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.disabledPhoneBox}>
            <Text style={styles.disabledPhoneText}>+91 {phone}</Text>
            <Text style={styles.disabledBadge}>✓ Verified</Text>
          </View>

          <Input
            label="Email Address (Optional)"
            placeholder="Enter your email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            leftIcon={<Text style={{ fontSize: 16 }}>✉</Text>}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPassError('');
            }}
            secureTextEntry
            error={passError}
            leftIcon={<Text style={{ fontSize: 16 }}>🔒</Text>}
          />
          <Text style={styles.passwordHint}>Use 8+ characters with a mix of letters, numbers & symbols</Text>

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfPassError('');
            }}
            secureTextEntry
            error={confPassError}
            leftIcon={<Text style={{ fontSize: 16 }}>🔒</Text>}
          />

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree(!agree)}>
            <View style={[styles.checkbox, agree ? styles.checkboxChecked : null]}>
              {agree ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button
            title="Create Account"
            onPress={handleRegister}
            size="lg"
            style={styles.submitBtn}
          />

          <View style={styles.orSection}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialButtonsRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why GoMotorCar?</Text>
          
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <View>
              <Text style={styles.benefitRowTitle}>Trusted by Thousands</Text>
              <Text style={styles.benefitRowDesc}>Reliable car services you can count on.</Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <View>
              <Text style={styles.benefitRowTitle}>Secure & Safe</Text>
              <Text style={styles.benefitRowDesc}>Your data and payments are protected.</Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <View>
              <Text style={styles.benefitRowTitle}>Save Time & Money</Text>
              <Text style={styles.benefitRowDesc}>24/7 support when you need us.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerPrompt}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerPromptText}>
              Already have an account? <Text style={styles.footerPromptLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '950',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 24,
  },
  formSection: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  disabledPhoneBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  disabledPhoneText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
  disabledBadge: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
  passwordHint: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: -10,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlue,
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  linkText: {
    color: colors.primaryBlue,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
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
    marginBottom: 30,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  benefitsSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EAF3FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: 'bold',
  },
  benefitRowTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 1,
  },
  benefitRowDesc: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  footerPrompt: {
    alignItems: 'center',
  },
  footerPromptText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  footerPromptLink: {
    color: colors.primaryBlue,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});

export default RegistrationScreen;
