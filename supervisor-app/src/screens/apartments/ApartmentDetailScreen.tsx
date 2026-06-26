import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchApartmentById } from '../../redux/slices/apartmentSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any; route: any }

const ApartmentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { apartmentId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedApartment: apt } = useSelector((s: RootState) => s.apartments);

  useEffect(() => { dispatch(fetchApartmentById(apartmentId)); }, [dispatch, apartmentId]);

  if (!apt) return null;

  return (
    <View style={styles.container}>
      <Header title="Apartment Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{apt.name}</Text>
            <StatusBadge status={apt.qrAssigned ? 'active' : 'pending_activation'} />
          </View>
          <View style={styles.detailRow}><Text style={styles.label}>Address</Text><Text style={styles.value}>{apt.address}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>City</Text><Text style={styles.value}>{apt.city}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>State</Text><Text style={styles.value}>{apt.state}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>Pincode</Text><Text style={styles.value}>{apt.pincode}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>Customer</Text><Text style={styles.value}>{apt.customerId?.name || 'N/A'}</Text></View>
        </Card>

        {/* QR Actions */}
        <Text style={styles.sectionTitle}>QR Code</Text>
        <Card variant="outlined" padding={16}>
          {apt.qrAssigned ? (
            <View>
              <Text style={styles.qrLabel}>QR Code: {apt.qrCode?.code || 'Assigned'}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button title="Replace" variant="outline" size="sm" onPress={() => navigation.navigate('QRReassignment', { apartmentId, qrId: apt.qrCode?._id })} />
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.qrLabel}>No QR assigned yet</Text>
              <Button title="Assign QR" size="sm" onPress={() => navigation.navigate('QRAssignment', { apartmentId })} style={{ marginTop: 12 }} />
            </View>
          )}
        </Card>

        <Button title="Edit Apartment" variant="outline" onPress={() => {}} style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  value: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium', flex: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12, marginTop: 20 },
  qrLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
});

export default ApartmentDetailScreen;
