import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { fetchServices, deleteService } from '../../redux/slices/servicesSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const ServicesManagementScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { services, loading } = useSelector((state: RootState) => state.services);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchServices({}));
  }, [dispatch]);

  useRefreshOnFocus(loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchServices({}));
    setRefreshing(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Service', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteService(id)) },
    ]);
  };

  const getServiceIcon = (category?: string) => {
    const icons: Record<string, string> = {
      cleaning: '🧹', repair: '🔧', painting: '🎨',
      plumbing: '🔧', electrical: '⚡', pest: '🐛',
    };
    return icons[category?.toLowerCase() || ''] || '🛠';
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Button
          title="+ Add New Service"
          onPress={() => navigation.navigate('AddService')}
          variant="primary"
          size="large"
          style={styles.addBtn}
        />

        {services.length === 0 ? (
          <EmptyState
            icon="🛠"
            title="No Services Yet"
            message="Add your first service to start receiving leads."
            actionLabel="Add Service"
            onAction={() => navigation.navigate('AddService')}
          />
        ) : (
          services.map((service: any) => (
            <Card key={service._id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceIcon}>
                  {getServiceIcon(service.category)}
                </Text>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCategory}>
                    {service.category || 'General'}
                  </Text>
                </View>
                <StatusBadge status={service.isActive ? 'Active' : 'Inactive'} />
              </View>
              {service.description && (
                <Text style={styles.serviceDesc} numberOfLines={2}>
                  {service.description}
                </Text>
              )}
              <View style={styles.serviceFooter}>
                <Text style={styles.servicePrice}>
                  ₹{service.price?.toLocaleString() || 'N/A'}
                </Text>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Pricing', { serviceId: service._id })}
                  >
                    <Text style={styles.actionLink}>Pricing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(service._id, service.name)}
                  >
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  addBtn: { marginBottom: 4 },
  serviceCard: {},
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceIcon: { fontSize: 28 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600', color: colors.text },
  serviceCategory: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  serviceDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  serviceFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  servicePrice: { fontSize: 16, fontWeight: '700', color: colors.primary },
  serviceActions: { flexDirection: 'row', gap: 16 },
  actionLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  deleteLink: { fontSize: 13, color: colors.error, fontWeight: '600' },
});

export default ServicesManagementScreen;
