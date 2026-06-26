import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button } from '../../components/common';
import Card from '../../components/common/Card';
import { fetchVehicles } from '../../redux/slices/vehicleSlice';
import { fetchApartments } from '../../redux/slices/apartmentSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props {
  navigation: any;
}

const ApartmentVehicleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((s: RootState) => s.vehicles);
  const { apartments } = useSelector((s: RootState) => s.apartments);
  const { user } = useSelector((s: RootState) => s.auth);

  const [selectedVehicle, setSelectedVehicle] = React.useState<string>('');
  const [selectedApartment, setSelectedApartment] = React.useState<string>('');

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchVehicles(user._id));
      dispatch(fetchApartments(user._id));
    }
  }, [user?._id]);

  const defaultVehicle = vehicles.find((v) => v.isPrimary) || vehicles[0];
  const defaultApartment = apartments.find((a) => a.isDefault) || apartments[0];

  useEffect(() => {
    if (defaultVehicle?._id) setSelectedVehicle(defaultVehicle._id);
    if (defaultApartment?._id) setSelectedApartment(defaultApartment._id);
  }, [vehicles.length, apartments.length]);

  const canProceed = selectedVehicle && selectedApartment;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Cleaner</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Select Vehicle</Text>
        {vehicles.map((v) => (
          <TouchableOpacity
            key={v._id}
            style={[styles.selectCard, selectedVehicle === v._id && styles.selectCardActive]}
            onPress={() => setSelectedVehicle(v._id!)}
          >
            <Text style={styles.vehicleEmoji}>
              {v.vehicleType === 'suv' || v.vehicleType === 'luxury' ? '🚙' : '🚗'}
            </Text>
            <View style={styles.selectInfo}>
              <Text style={styles.selectTitle}>{v.vehicleNumber}</Text>
              <Text style={styles.selectSub}>{v.make} {v.model} ({v.year})</Text>
            </View>
            {selectedVehicle === v._id && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Select Apartment</Text>
        {apartments.map((a) => (
          <TouchableOpacity
            key={a._id}
            style={[styles.selectCard, selectedApartment === a._id && styles.selectCardActive]}
            onPress={() => setSelectedApartment(a._id!)}
          >
            <Text style={styles.vehicleEmoji}>🏠</Text>
            <View style={styles.selectInfo}>
              <Text style={styles.selectTitle}>{a.buildingName} - {a.unitNumber}</Text>
              <Text style={styles.selectSub}>{a.city}, {a.pincode}</Text>
            </View>
            {selectedApartment === a._id && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Continue →"
          onPress={() => navigation.navigate('HirePackageSelect', {
            vehicleId: selectedVehicle,
            apartmentId: selectedApartment,
          })}
          size="lg"
          disabled={!canProceed}
          style={styles.continueBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  selectCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1.5, borderColor: colors.border,
  },
  selectCardActive: { borderColor: colors.primaryBlue, backgroundColor: colors.lightBlue },
  vehicleEmoji: { fontSize: 24, marginRight: 12 },
  selectInfo: { flex: 1 },
  selectTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  selectSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  checkmark: { fontSize: 18, color: colors.primaryBlue, fontWeight: '700' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  continueBtn: { width: '100%' },
});

export default ApartmentVehicleSelectionScreen;
