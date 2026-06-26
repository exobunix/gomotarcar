import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import Input from '../../components/common/Input';
import { createApartment, updateApartment } from '../../redux/slices/apartmentSlice';
import { isValidPincode } from '../../utils/validators';
import { AppDispatch } from '../../redux/store';

interface AddApartmentScreenProps {
  navigation: any;
  route: any;
}

const AddApartmentScreen: React.FC<AddApartmentScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const existingApartment = route.params?.apartment;
  const isEditing = !!existingApartment;

  const [buildingName, setBuildingName] = useState(
    existingApartment?.buildingName || ''
  );
  const [unitNumber, setUnitNumber] = useState(
    existingApartment?.unitNumber || ''
  );
  const [floor, setFloor] = useState(existingApartment?.floor || '');
  const [wing, setWing] = useState(existingApartment?.wing || '');
  const [fullAddress, setFullAddress] = useState(
    existingApartment?.fullAddress || ''
  );
  const [city, setCity] = useState(existingApartment?.city || '');
  const [state, setState] = useState(existingApartment?.state || '');
  const [pincode, setPincode] = useState(existingApartment?.pincode || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!buildingName.trim()) newErrors.buildingName = 'Building name is required';
    if (!unitNumber.trim()) newErrors.unitNumber = 'Unit/Flat number is required';
    if (!fullAddress.trim()) newErrors.fullAddress = 'Full address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!isValidPincode(pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      buildingName: buildingName.trim(),
      unitNumber: unitNumber.trim(),
      floor: floor.trim(),
      wing: wing.trim(),
      fullAddress: fullAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    setLoading(true);
    try {
      if (isEditing && existingApartment?._id) {
        await dispatch(
          updateApartment({ id: existingApartment._id, data })
        ).unwrap();
        Alert.alert('Success', 'Apartment updated successfully');
      } else {
        await dispatch(createApartment(data)).unwrap();
        Alert.alert('Success', 'Apartment added successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={loading} message="Saving apartment..." />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Apartment' : 'Add Apartment'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Building Name"
              placeholder="e.g., Green Towers"
              value={buildingName}
              onChangeText={(text) => {
                setBuildingName(text);
                setErrors({ ...errors, buildingName: '' });
              }}
              error={errors.buildingName}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Unit/Flat No"
              placeholder="e.g., 3B"
              value={unitNumber}
              onChangeText={(text) => {
                setUnitNumber(text);
                setErrors({ ...errors, unitNumber: '' });
              }}
              error={errors.unitNumber}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Floor"
              placeholder="e.g., 5"
              value={floor}
              onChangeText={setFloor}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Wing / Block"
              placeholder="e.g., A"
              value={wing}
              onChangeText={setWing}
            />
          </View>
        </View>

        <Input
          label="Full Address"
          placeholder="Street, landmark, etc."
          value={fullAddress}
          onChangeText={(text) => {
            setFullAddress(text);
            setErrors({ ...errors, fullAddress: '' });
          }}
          error={errors.fullAddress}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="City"
              placeholder="Enter city"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                setErrors({ ...errors, city: '' });
              }}
              error={errors.city}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="State"
              placeholder="Enter state"
              value={state}
              onChangeText={(text) => {
                setState(text);
                setErrors({ ...errors, state: '' });
              }}
              error={errors.state}
            />
          </View>
        </View>

        <Input
          label="Pincode"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChangeText={(text) => {
            setPincode(text.replace(/[^0-9]/g, '').slice(0, 6));
            setErrors({ ...errors, pincode: '' });
          }}
          keyboardType="number-pad"
          maxLength={6}
          error={errors.pincode}
        />

        <Button
          title={isEditing ? 'Update Apartment' : 'Add Apartment'}
          onPress={handleSubmit}
          size="lg"
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  submitBtn: {
    marginTop: 16,
  },
});

export default AddApartmentScreen;
