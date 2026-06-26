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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import Input from '../../components/common/Input';
import { registerUser } from '../../redux/slices/authSlice';
import { isValidName, isValidEmail } from '../../utils/validators';
import { AppDispatch, RootState } from '../../redux/store';

interface RegistrationScreenProps {
  navigation: any;
  route: any;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  navigation,
  route,
}) => {
  const { phone } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

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

    if (hasError) return;

    try {
      await dispatch(
        registerUser({ phone, name: name.trim(), email: email.trim() || undefined })
      ).unwrap();
      // Navigation will be handled by auth state change in AppNavigator
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
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to get started
          </Text>
        </View>

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
            autoCapitalize="words"
            leftIcon={<Text style={{ fontSize: 18 }}>👤</Text>}
          />

          <Input
            label="Email (Optional)"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            leftIcon={<Text style={{ fontSize: 18 }}>📧</Text>}
          />

          <Input
            label="Mobile Number"
            value={phone}
            editable={false}
            leftIcon={<Text style={{ fontSize: 18 }}>📱</Text>}
            style={{ color: colors.textSecondary }}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            size="lg"
            style={styles.submitBtn}
            disabled={!name.trim()}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
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
  },
  formSection: {
    paddingHorizontal: 24,
    flex: 1,
  },
  submitBtn: {
    width: '100%',
    marginTop: 16,
  },
});

export default RegistrationScreen;
