import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { Input, Button, LoadingOverlay } from '../../components/common';
import Header from '../../components/common/Header';
import { isValidPincode } from '../../utils/validators';
import { apartmentService } from '../../services/apartment.service';

interface Props { navigation: any; route: any }

const AddApartmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !city.trim()) {
      Alert.alert('Required', 'Please fill in name, address, and city');
      return;
    }
    setLoading(true);
    try {
      await apartmentService.create({ name: name.trim(), address: address.trim(), city: city.trim(), state: state.trim(), pincode });
      Alert.alert('Success', 'Apartment added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to add apartment');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Saving..." />
      <Header title="Add Apartment" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Input label="Apartment Name" placeholder="e.g. Green Valley Towers" value={name} onChangeText={setName} />
        <Input label="Address" placeholder="Street address" value={address} onChangeText={setAddress} />
        <Input label="City" placeholder="City" value={city} onChangeText={setCity} />
        <Input label="State" placeholder="State" value={state} onChangeText={setState} />
        <Input label="Pincode" placeholder="6-digit pincode" value={pincode} onChangeText={(t) => setPincode(t.replace(/[^0-9]/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} />
        <Button title="Add Apartment" onPress={handleSubmit} size="lg" loading={loading} disabled={!name.trim()} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
});

export default AddApartmentScreen;
