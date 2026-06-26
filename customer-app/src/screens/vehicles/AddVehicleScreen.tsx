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
import { createVehicle, updateVehicle } from '../../redux/slices/vehicleSlice';
import { isValidVehicleNumber } from '../../utils/validators';
import { AppDispatch } from '../../redux/store';

const VEHICLE_TYPES = ['hatchback', 'sedan', 'suv', 'muv', 'pickup', 'luxury'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'cng', 'hybrid'];

interface AddVehicleScreenProps {
  navigation: any;
  route: any;
}

const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const existingVehicle = route.params?.vehicle;
  const isEditing = !!existingVehicle;

  const [vehicleNumber, setVehicleNumber] = useState(
    existingVehicle?.vehicleNumber || ''
  );
  const [make, setMake] = useState(existingVehicle?.make || '');
  const [model, setModel] = useState(existingVehicle?.model || '');
  const [year, setYear] = useState(existingVehicle?.year || '');
  const [color, setColor] = useState(existingVehicle?.color || '');
  const [vehicleType, setVehicleType] = useState(
    existingVehicle?.vehicleType || 'sedan'
  );
  const [fuelType, setFuelType] = useState(
    existingVehicle?.fuelType || 'petrol'
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidVehicleNumber(vehicleNumber)) {
      newErrors.vehicleNumber = 'Enter a valid number (e.g., KA01AB1234)';
    }
    if (!make.trim()) newErrors.make = 'Make is required';
    if (!model.trim()) newErrors.model = 'Model is required';
    if (!year || isNaN(Number(year)) || Number(year) < 2000 || Number(year) > 2026) {
      newErrors.year = 'Enter a valid year (2000-2026)';
    }
    if (!color.trim()) newErrors.color = 'Color is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      vehicleNumber: vehicleNumber.toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      year: year.trim(),
      color: color.trim(),
      vehicleType: vehicleType as any,
      fuelType: fuelType as any,
    };

    setLoading(true);
    try {
      if (isEditing && existingVehicle?._id) {
        await dispatch(
          updateVehicle({ id: existingVehicle._id, data })
        ).unwrap();
        Alert.alert('Success', 'Vehicle updated successfully');
      } else {
        await dispatch(createVehicle(data)).unwrap();
        Alert.alert('Success', 'Vehicle added successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const SelectChip: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={loading} message="Saving vehicle..." />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Vehicle Number"
          placeholder="e.g., KA01AB1234"
          value={vehicleNumber}
          onChangeText={(text) => {
            setVehicleNumber(text.toUpperCase());
            setErrors({ ...errors, vehicleNumber: '' });
          }}
          error={errors.vehicleNumber}
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Make"
              placeholder="e.g., Toyota"
              value={make}
              onChangeText={(text) => {
                setMake(text);
                setErrors({ ...errors, make: '' });
              }}
              error={errors.make}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Model"
              placeholder="e.g., Camry"
              value={model}
              onChangeText={(text) => {
                setModel(text);
                setErrors({ ...errors, model: '' });
              }}
              error={errors.model}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Year"
              placeholder="e.g., 2023"
              value={year}
              onChangeText={(text) => {
                setYear(text.replace(/[^0-9]/g, '').slice(0, 4));
                setErrors({ ...errors, year: '' });
              }}
              keyboardType="number-pad"
              maxLength={4}
              error={errors.year}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Color"
              placeholder="e.g., White"
              value={color}
              onChangeText={(text) => {
                setColor(text);
                setErrors({ ...errors, color: '' });
              }}
              error={errors.color}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Vehicle Type</Text>
        <View style={styles.chipGroup}>
          {VEHICLE_TYPES.map((type) => (
            <SelectChip
              key={type}
              label={type}
              selected={vehicleType === type}
              onPress={() => setVehicleType(type)}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Fuel Type</Text>
        <View style={styles.chipGroup}>
          {FUEL_TYPES.map((type) => (
            <SelectChip
              key={type}
              label={type}
              selected={fuelType === type}
              onPress={() => setFuelType(type)}
            />
          ))}
        </View>

        <Button
          title={isEditing ? 'Update Vehicle' : 'Add Vehicle'}
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    marginTop: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.lightBlue,
    borderColor: colors.primaryBlue,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  chipTextSelected: {
    color: colors.primaryBlue,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  submitBtn: {
    marginTop: 16,
  },
});

export default AddVehicleScreen;
