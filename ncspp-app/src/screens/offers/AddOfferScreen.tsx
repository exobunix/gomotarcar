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
import { createOffer } from '../../redux/slices/offersSlice';
import { AppDispatch, RootState } from '../../redux/store';

const AddOfferScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.offers);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [code, setCode] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const handleSubmit = async () => {
    if (!title || !discountValue) return;
    const result = await dispatch(createOffer({
      title,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      code: code || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      endDate: validUntil || undefined,
    }));
    if (createOffer.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={loading} message="Creating offer..." />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Offer Details</Text>

          <Input label="Offer Title *" value={title} onChangeText={setTitle}
            placeholder="e.g., Summer Special Discount" autoCapitalize="sentences" />
          <Input label="Description" value={description} onChangeText={setDescription}
            placeholder="Describe the offer..." multiline />

          <Text style={styles.fieldLabel}>Discount Type</Text>
          <View style={styles.typeToggle}>
            <Button title="Percentage %"
              onPress={() => setDiscountType('percentage')}
              variant={discountType === 'percentage' ? 'primary' : 'outline'}
              size="small" style={styles.typeBtn} />
            <Button title="Fixed ₹"
              onPress={() => setDiscountType('fixed')}
              variant={discountType === 'fixed' ? 'primary' : 'outline'}
              size="small" style={styles.typeBtn} />
          </View>

          <Input label={discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (₹) *'}
            value={discountValue} onChangeText={setDiscountValue}
            placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
            keyboardType="numeric" />

          <Input label="Coupon Code" value={code} onChangeText={setCode}
            placeholder="e.g., SUMMER20" autoCapitalize="characters" />

          <Input label="Min. Order Amount (₹)" value={minAmount} onChangeText={setMinAmount}
            placeholder="Optional" keyboardType="numeric" />

          <Input label="Valid Until (YYYY-MM-DD)" value={validUntil} onChangeText={setValidUntil}
            placeholder="e.g., 2025-12-31" autoCapitalize="none" />

          <View style={styles.btnRow}>
            <Button title="Cancel" onPress={() => navigation.goBack()}
              variant="outline" size="medium" style={styles.cancelBtn} />
            <Button title="Create Offer" onPress={handleSubmit}
              variant="primary" size="medium" disabled={!title || !discountValue} />
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
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { marginBottom: 0 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1 },
});

export default AddOfferScreen;
