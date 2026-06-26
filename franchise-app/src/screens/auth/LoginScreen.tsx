import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { colors } from '../../theme/colors';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.auth);

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }
    dispatch(login({ phone, password }) as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚗</Text>
        <Text style={styles.title}>Franchise Partner</Text>
        <Text style={styles.subtitle}>GoMotarCar</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 100, paddingBottom: 40, alignItems: 'center' },
  logo: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
  form: { paddingHorizontal: 24 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', fontFamily: 'Inter-Regular' },
  button: { backgroundColor: colors.primaryBlue, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  error: { color: colors.error, marginBottom: 12, textAlign: 'center', fontFamily: 'Inter-Regular' },
});

export default LoginScreen;
