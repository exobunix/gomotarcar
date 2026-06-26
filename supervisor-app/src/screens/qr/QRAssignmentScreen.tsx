import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { Input, Button, LoadingOverlay } from '../../components/common';
import { generateQR } from '../../redux/slices/qrSlice';
import { AppDispatch } from '../../redux/store';

interface Props { navigation: any; route: any }

const QRAssignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [apartmentId, setApartmentId] = useState(route.params?.apartmentId || '');
  const [customerId, setCustomerId] = useState(route.params?.customerId || '');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!apartmentId && !customerId) {
      Alert.alert('Required', 'Please provide apartment ID or customer ID');
      return;
    }
    setLoading(true);
    try {
      await dispatch(generateQR({ apartmentId: apartmentId || undefined, customerId: customerId || undefined })).unwrap();
      Alert.alert('Success', 'QR code generated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to generate QR');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <Header title="Assign QR Code" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <Text style={styles.info}>Generate a new QR code for an apartment or customer</Text>
        </Card>
        <Input label="Apartment ID" placeholder="Enter apartment ID" value={apartmentId} onChangeText={setApartmentId} />
        <Input label="Customer ID" placeholder="Enter customer ID" value={customerId} onChangeText={setCustomerId} />
        <Button title="Generate QR Code" onPress={handleGenerate} size="lg" loading={loading} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  info: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontFamily: 'Inter-Regular' },
});

export default QRAssignmentScreen;
