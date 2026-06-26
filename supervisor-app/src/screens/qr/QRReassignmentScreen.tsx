import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { Button, LoadingOverlay } from '../../components/common';
import { reportQrDamaged } from '../../redux/slices/qrSlice';
import { AppDispatch } from '../../redux/store';

interface Props { navigation: any; route: any }

const QRReassignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { qrId, apartmentId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const handleReplace = async () => {
    setLoading(true);
    try {
      await dispatch(reportQrDamaged({ id: qrId, data: { reason: 'replaced', apartmentId } })).unwrap();
      Alert.alert('Replaced', 'QR code marked for replacement. A new code will be generated.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch { Alert.alert('Error', 'Failed to replace QR'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <Header title="Replace QR Code" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <Text style={styles.warning}>⚠️</Text>
          <Text style={styles.info}>This will mark the current QR code as replaced. A new QR code will need to be generated for this apartment.</Text>
        </Card>
        <Card variant="outlined" padding={16}>
          <Text style={styles.detail}>QR ID: {qrId}</Text>
          {apartmentId && <Text style={styles.detail}>Apartment ID: {apartmentId}</Text>}
        </Card>
        <Button title="Confirm Replacement" variant="danger" onPress={handleReplace} size="lg" loading={loading} style={{ marginTop: 12 }} />
        <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} size="lg" style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  warning: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  info: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, fontFamily: 'Inter-Regular' },
  detail: { fontSize: 13, color: colors.textPrimary, fontFamily: 'Inter-Medium', marginBottom: 4 },
});

export default QRReassignmentScreen;
