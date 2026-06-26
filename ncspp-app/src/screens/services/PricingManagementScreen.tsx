import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchServices, updateService } from '../../redux/slices/servicesSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const PricingManagementScreen = ({ navigation, route }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { services, loading } = useSelector((state: RootState) => state.services);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDiscountedPrice, setEditDiscountedPrice] = useState('');

  useRefreshOnFocus(() => dispatch(fetchServices({})));

  useEffect(() => {
    dispatch(fetchServices({}));
  }, [dispatch]);

  const handleUpdatePrice = async (id: string) => {
    if (!editPrice) return;
    await dispatch(updateService({
      id,
      data: {
        price: parseFloat(editPrice),
        discountedPrice: editDiscountedPrice ? parseFloat(editDiscountedPrice) : undefined,
      },
    }));
    setEditingId(null);
  };

  const servicesList = route?.params?.serviceId
    ? services.filter((s: any) => s._id === route.params.serviceId)
    : services;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.infoText}>
          Set competitive prices for your services. Discounted prices show with a strikethrough.
        </Text>

        {servicesList.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No services yet. Add services first to set pricing.
            </Text>
          </Card>
        ) : (
          servicesList.map((service: any) => (
            <Card key={service._id} style={styles.priceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                {service.category && (
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                )}
              </View>

              {editingId === service._id ? (
                <View>
                  <Input label="Base Price (₹)" value={editPrice}
                    onChangeText={setEditPrice} keyboardType="numeric" />
                  <Input label="Discounted Price (₹)" value={editDiscountedPrice}
                    onChangeText={setEditDiscountedPrice} keyboardType="numeric"
                    placeholder="Optional" />
                  <View style={styles.editActions}>
                    <Button title="Cancel" onPress={() => setEditingId(null)}
                      variant="outline" size="small" />
                    <Button title="Save" onPress={() => handleUpdatePrice(service._id)}
                      variant="primary" size="small" disabled={!editPrice} />
                  </View>
                </View>
              ) : (
                <View style={styles.priceDisplay}>
                  <View>
                    <Text style={styles.currentPrice}>
                      ₹{service.price?.toLocaleString() || 'N/A'}
                    </Text>
                    {service.discountedPrice && (
                      <Text style={styles.discountedPrice}>
                        ₹{service.discountedPrice.toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(service._id);
                      setEditPrice(service.price?.toString() || '');
                      setEditDiscountedPrice(service.discountedPrice?.toString() || '');
                    }}
                  >
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 32 },
  infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  priceCard: {},
  serviceInfo: { marginBottom: 8 },
  serviceName: { fontSize: 16, fontWeight: '600', color: colors.text },
  serviceCategory: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  priceDisplay: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border,
  },
  currentPrice: { fontSize: 20, fontWeight: '700', color: colors.primary },
  discountedPrice: {
    fontSize: 14, color: colors.error, textDecorationLine: 'line-through', marginTop: 2,
  },
  editLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', padding: 20 },
});

export default PricingManagementScreen;
