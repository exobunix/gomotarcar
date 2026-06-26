import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { addService } from '../../redux/slices/servicesSlice';
import { AppDispatch, RootState } from '../../redux/store';

const serviceCategories = [
  'Cleaning', 'Repair', 'Painting', 'Plumbing', 'Electrical', 'Pest Control', 'Other',
];

const AddServiceScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.services);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');

  const handleSubmit = async () => {
    if (!name || !basePrice) return;
    const result = await dispatch(addService({
      name, description, category,
      price: parseFloat(basePrice),
    }));
    if (addService.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={loading} message="Adding service..." />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.formCard}>
          <Input label="Service Name *" value={name} onChangeText={setName}
            placeholder="e.g., Full Home Deep Cleaning" autoCapitalize="sentences" />
          
          <Input label="Description" value={description} onChangeText={setDescription}
            placeholder="Describe your service..." multiline />
          
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {serviceCategories.map((cat) => (
              <Button
                key={cat}
                title={cat}
                onPress={() => setCategory(cat)}
                variant={category === cat ? 'primary' : 'outline'}
                size="small"
                style={styles.categoryBtn}
              />
            ))}
          </View>

          <Input label="Base Price (₹) *" value={basePrice} onChangeText={setBasePrice}
            placeholder="e.g., 999" keyboardType="numeric" />

          <View style={styles.btnRow}>
            <Button title="Cancel" onPress={() => navigation.goBack()}
              variant="outline" size="medium" style={styles.cancelBtn} />
            <Button title="Add Service" onPress={handleSubmit}
              variant="primary" size="medium" disabled={!name || !basePrice} />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 32 },
  formCard: { padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryBtn: { marginBottom: 0 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1 },
});

export default AddServiceScreen;
