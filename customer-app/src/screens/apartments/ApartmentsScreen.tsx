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
import {
  fetchApartments,
  deleteApartment,
  setDefaultApartment,
} from '../../redux/slices/apartmentSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface ApartmentsScreenProps {
  navigation: any;
}

const ApartmentsScreen: React.FC<ApartmentsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { apartments, loading } = useSelector(
    (state: RootState) => state.apartments
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const loadApartments = useCallback(() => {
    if (user?._id) {
      dispatch(fetchApartments(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    loadApartments();
  }, [loadApartments]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadApartments);
    return unsubscribe;
  }, [navigation, loadApartments]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Apartment',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(deleteApartment(id)),
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    dispatch(setDefaultApartment(id));
  };

  const renderApartment = ({ item }: { item: any }) => (
    <Card variant="elevated" padding={16} style={styles.apartmentCard}>
      <View style={styles.apartmentHeader}>
        <View style={styles.apartmentIconContainer}>
          <Text style={styles.apartmentEmoji}>🏠</Text>
        </View>
        <View style={styles.apartmentInfo}>
          <Text style={styles.apartmentName}>
            {item.name || `${item.buildingName} - ${item.unitNumber}`}
          </Text>
          <Text style={styles.apartmentAddress} numberOfLines={2}>
            {item.fullAddress || `${item.buildingName}, ${item.city}`}
          </Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.apartmentDetails}>
        <View style={styles.detailChip}>
          <Text style={styles.detailText}>{item.unitNumber}</Text>
        </View>
        <View style={styles.detailChip}>
          <Text style={styles.detailText}>{item.city}</Text>
        </View>
        <View style={styles.detailChip}>
          <Text style={styles.detailText}>{item.pincode}</Text>
        </View>
      </View>

      <View style={styles.apartmentActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleSetDefault(item._id)}
          >
            <Text style={styles.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddApartment', { apartment: item })}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() =>
            handleDelete(item._id, item.name || item.buildingName)
          }
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
        <Text style={styles.headerTitle}>My Apartments</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddApartment', {})}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={apartments}
        renderItem={renderApartment}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadApartments}
            tintColor={colors.primaryBlue}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🏠"
            title="No Apartments Added"
            description="Add your apartment address for doorstep car cleaning services"
          />
        }
      />

      {apartments.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddApartment', {})}
          >
            <Text style={styles.fabText}>+ Add Apartment</Text>
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
  apartmentCard: {
    marginBottom: 12,
  },
  apartmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  apartmentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  apartmentEmoji: {
    fontSize: 22,
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  apartmentAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  defaultBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'Inter-SemiBold',
  },
  apartmentDetails: {
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
  apartmentActions: {
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

export default ApartmentsScreen;
