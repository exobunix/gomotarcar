import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';

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
        <View style={styles.logoBox}>
          <Image source={{ uri: 'https://franchise-website-lovat.vercel.app/logo.png' }} style={styles.logoImg} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Franchise Partner</Text>
        <Text style={styles.subtitle}>GoMotorCar Portal</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
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
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 72, height: 72, backgroundColor: '#E0F2FE', borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 8, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  logoImg: { width: '100%', height: '100%' },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '600' },
  form: { paddingHorizontal: 24 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A', fontWeight: '600' },
  button: { backgroundColor: '#0D5BD7', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, shadowColor: '#0D5BD7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  error: { color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: '600' },
});

export default LoginScreen;
