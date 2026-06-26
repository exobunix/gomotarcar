import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TextInput, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosClient from '../../api/axiosClient';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !phone || !password || !aadhaar) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Error', 'Enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        firstName,
        lastName,
        phone: `+91${phone}`,
        password,
        documents: [
          { type: 'aadhaar', documentNumber: aadhaar, status: 'pending' },
          { type: 'pan', documentNumber: pan, status: 'pending' }
        ]
      };

      const res = await axiosClient.post('/auth/register-cleaner', payload);
      
      if (res.data.success) {
        Alert.alert(
          'Registration Successful',
          'Your profile has been created and is pending admin approval. You will be able to log in once an admin verifies your documents.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Join the Team!</Text>
          <Text style={styles.subtitleText}>Create your cleaner account</Text>
        </View>

        <View style={styles.formSection}>
          
          <Text style={styles.inputLabel}>First Name *</Text>
          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Raj"
              placeholderTextColor={colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <Text style={styles.inputLabel}>Last Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Kumar"
              placeholderTextColor={colors.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <Text style={styles.inputLabel}>Mobile Number *</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>+91</Text>
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

          <Text style={styles.inputLabel}>Password *</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Choose a password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setSecureText(!secureText)}>
              <Icon name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionHeader}>Verification Documents</Text>

          <Text style={styles.inputLabel}>Aadhaar Number *</Text>
          <View style={styles.inputContainer}>
            <Icon name="card-account-details-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter 12-digit Aadhaar"
              placeholderTextColor={colors.textSecondary}
              value={aadhaar}
              onChangeText={setAadhaar}
              keyboardType="number-pad"
              maxLength={12}
            />
          </View>

          <Text style={styles.inputLabel}>PAN Number</Text>
          <View style={styles.inputContainer}>
            <Icon name="card-account-details-star-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter PAN Number"
              placeholderTextColor={colors.textSecondary}
              value={pan}
              onChangeText={setPan}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, (!firstName || phone.length < 10 || !password || !aadhaar) && styles.disabledBtn]} 
            onPress={handleRegister} 
            disabled={loading || (!firstName || phone.length < 10 || !password || !aadhaar)}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Registration</Text>}
          </TouchableOpacity>

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  
  scrollContent: { paddingBottom: 20 },
  titleSection: { alignItems: 'center', marginVertical: 10 },
  titleText: { fontSize: 24, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  subtitleText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 4 },
  
  formSection: { paddingHorizontal: 24, marginTop: 10 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, fontFamily: 'Inter-SemiBold', marginTop: 16, marginBottom: 8 },
  
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, height: 56, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Regular' },
  eyeBtn: { padding: 4 },

  phoneInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, height: 56, paddingHorizontal: 12,
  },
  countryCodeContainer: { flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border, paddingRight: 10, height: '60%' },
  countryCodeText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  phoneInput: { flex: 1, height: '100%', marginLeft: 12, fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Regular' },
  
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 4 },

  submitBtn: {
    height: 56, borderRadius: 14, backgroundColor: colors.primaryBlue,
    alignItems: 'center', justifyContent: 'center', marginTop: 32,
    shadowColor: colors.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: colors.white, fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },
  disabledBtn: { opacity: 0.5 },
});

export default RegisterScreen;
