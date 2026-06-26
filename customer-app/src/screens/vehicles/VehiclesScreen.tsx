import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { fetchVehicles, deleteVehicle } from '../../redux/slices/vehicleSlice';
import { VEHICLE_TYPE_LABELS, FUEL_TYPE_LABELS } from '../../utils/helpers';
import { AppDispatch, RootState } from '../../redux/store';

interface VehiclesScreenProps {
  navigation: any;
}

const VehiclesScreen: React.FC<VehiclesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, loading } = useSelector((state: RootState) => state.vehicles);
  const { user } = useSelector((state: RootState) => state.auth);

  const loadVehicles = useCallback(() => {
    if (user?._id) {
      dispatch(fetchVehicles(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadVehicles);
    return unsubscribe;
  }, [navigation, loadVehicles]);

  const handleDelete = (id: string, vehicleNumber: string) => {
    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove ${vehicleNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(deleteVehicle(id)),
        },
      ]
    );
  };

  const renderVehicle = ({ item }: { item: any }) => (
    <Card variant="elevated" padding={16} style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIconContainer}>
          <Text style={styles.vehicleEmoji}>
            {item.vehicleType === 'bike' ? '🏍️' : '🚗'}
          </Text>
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
          <Text style={styles.vehicleModel}>
            {item.make} {item.model} ({item.year})
          </Text>
        </View>
        {item.isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailChip}>
          <Text style={styles.detailText}>
            {VEHICLE_TYPE_LABELS[item.vehicleType] || item.vehicleType}
          </Text>
        </View>
        <View style={styles.detailChip}>
          <Text style={styles.detailText}>
            {FUEL_TYPE_LABELS[item.fuelType] || item.fuelType}
          </Text>
        </View>
        <View style={styles.detailChip}>
          <Text style={styles.detailText}>{item.color}</Text>
        </View>
      </View>

      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddVehicle', { vehicle: item })}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item._id, item.vehicleNumber)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddVehicle', {})}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadVehicles}
            tintColor={colors.primaryBlue}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🚗"
            title="No Vehicles Added"
            description="Add your first vehicle to get started with cleaning services"
          />
        }
      />

      {vehicles.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddVehicle', {})}
          >
            <Text style={styles.fabText}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '300',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  vehicleCard: {
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleEmoji: {
    fontSize: 22,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  vehicleModel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  primaryBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'Inter-SemiBold',
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  vehicleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.lightBlue,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  deleteBtn: {
    backgroundColor: colors.error + '10',
  },
  deleteText: {
    color: colors.error,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  fab: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
  },
});

export default VehiclesScreen;
