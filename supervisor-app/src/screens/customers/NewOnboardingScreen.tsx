import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { Input, Button, LoadingOverlay } from '../../components/common';
import Header from '../../components/common/Header';
import { isValidPhone } from '../../utils/validators';
import { customerService } from '../../services/customer.service';
import { apartmentService } from '../../services/apartment.service';
import { qrService } from '../../services/qr.service';

interface Props { navigation: any }

const NewOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: customer info, 2: apartment, 3: QR
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aptName, setAptName] = useState('');
  const [aptAddress, setAptAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomerSubmit = () => {
    if (!name.trim() || !isValidPhone(phone)) {
      Alert.alert('Required', 'Enter valid name and 10-digit phone number');
      return;
    }
    setStep(2);
  };

  const handleAptSubmit = () => {
    if (!aptName.trim() || !city.trim()) {
      Alert.alert('Required', 'Enter apartment name and city');
      return;
    }
    setStep(3);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Step 1: Create customer
      const customerRes = await customerService.create({ name: name.trim(), phone: `+91${phone}`, email: email.trim() || undefined });
      const customerId = customerRes.data._id;

      // Step 2: Create apartment
      await apartmentService.create({ name: aptName.trim(), address: aptAddress.trim(), city: city.trim(), customerId });

      // Step 3: Generate QR code for the customer
      const qrRes = await qrService.generate({ customerId });
      const qrCode = qrRes.data;

      Alert.alert('Onboarding Complete', `Customer, apartment & QR code created!\nQR: ${qrCode.code}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Onboarding failed');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Processing..." />
      <Header title="New Customer" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.stepsIndicator}>
          {['Customer', 'Apartment', 'QR'].map((s, i) => (
            <View key={i} style={[styles.stepDot, step >= i + 1 && styles.stepActive]}>
              <Text style={[styles.stepNumber, step >= i + 1 && styles.stepNumberActive]}>{i + 1}</Text>
              <Text style={[styles.stepLabel, step >= i + 1 && styles.stepLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <>
            <Input label="Full Name" placeholder="Customer name" value={name} onChangeText={setName} />
            <Input label="Phone Number" placeholder="10-digit phone" value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} />
            <Input label="Email (optional)" placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Button title="Next → Apartment" onPress={handleCustomerSubmit} size="lg" />
          </>
        )}

        {step === 2 && (
          <>
            <Input label="Apartment Name" placeholder="e.g. Green Valley" value={aptName} onChangeText={setAptName} />
            <Input label="Address" placeholder="Street address" value={aptAddress} onChangeText={setAptAddress} />
            <Input label="City" placeholder="City" value={city} onChangeText={setCity} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="← Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }} />
              <Button title="Next → QR" onPress={handleAptSubmit} style={{ flex: 1 }} />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Review & Complete</Text>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Customer</Text><Text style={styles.summaryValue}>{name}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Phone</Text><Text style={styles.summaryValue}>+91{phone}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Apartment</Text><Text style={styles.summaryValue}>{aptName}</Text></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="← Back" variant="outline" onPress={() => setStep(2)} style={{ flex: 1 }} />
              <Button title="Complete Onboarding" onPress={handleComplete} loading={loading} style={{ flex: 1 }} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepsIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 32, paddingTop: 8 },
  stepDot: { alignItems: 'center' },
  stepActive: {},
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, textAlign: 'center', lineHeight: 32, fontSize: 14, fontWeight: '600', color: colors.textSecondary, fontFamily: 'Inter-SemiBold' },
  stepNumberActive: { backgroundColor: colors.primaryBlue, color: colors.white },
  stepLabel: { fontSize: 11, color: colors.textLight, marginTop: 4, fontFamily: 'Inter-Medium' },
  stepLabelActive: { color: colors.primaryBlue, fontWeight: '600' },
  summary: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 24 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16, fontFamily: 'Inter-SemiBold' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  summaryLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
});

export default NewOnboardingScreen;
