import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Input, Button, LoadingOverlay } from '../../components/common';
import { login, clearError } from '../../redux/slices/authSlice';
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
    dispatch(login({ phone: `+91${phone}`, password }));
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
          <Input
            label="Phone Number"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChangeText={(t) => { setPhone(t.replace(/[^0-9]/g, '').slice(0, 10)); dispatch(clearError()); }}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(t) => { setPassword(t); dispatch(clearError()); }}
            secureTextEntry={!showPassword}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button title="Sign In" onPress={handleLogin} size="lg" fullWidth loading={isLoading} />
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
  logoCircle: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 36, fontWeight: '800', color: colors.white, fontFamily: 'Inter-Bold' },
  appName: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  roleTag: { fontSize: 14, color: colors.primaryBlue, marginTop: 4, fontFamily: 'Inter-Medium', backgroundColor: colors.lightBlue, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20 },
  form: { marginBottom: 32 },
  errorText: { fontSize: 13, color: colors.error, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter-Regular' },
  footerText: { textAlign: 'center', fontSize: 12, color: colors.textLight, fontFamily: 'Inter-Regular' },
});

export default LoginScreen;
