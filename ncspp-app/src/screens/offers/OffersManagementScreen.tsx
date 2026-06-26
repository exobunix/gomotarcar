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
import { fetchOffers, deleteOffer } from '../../redux/slices/offersSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const OffersManagementScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { offers, loading } = useSelector((state: RootState) => state.offers);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchOffers({}));
  }, [dispatch]);

  useRefreshOnFocus(loadData);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOffers({}));
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Offer', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteOffer(id)) },
    ]);
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Button
          title="+ Create New Offer"
          onPress={() => navigation.navigate('AddOffer')}
          variant="primary"
          size="large"
          style={styles.addBtn}
        />

        {offers.length === 0 ? (
          <EmptyState
            icon="🏷"
            title="No Offers Yet"
            message="Create promotional offers to attract more customers."
            actionLabel="Create Offer"
            onAction={() => navigation.navigate('AddOffer')}
          />
        ) : (
          offers.map((offer: any) => {
            const expired = offer.endDate && isExpired(offer.endDate);
            return (
              <Card key={offer._id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerIcon}>🏷</Text>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerDesc} numberOfLines={1}>
                      {offer.description || ''}
                    </Text>
                  </View>
                  <StatusBadge status={expired ? 'Inactive' : offer.isActive ? 'Active' : 'Inactive'} />
                </View>

                <View style={styles.discountRow}>
                  <Text style={styles.discountValue}>
                    {offer.discountType === 'percentage'
                      ? `${offer.discountValue}% OFF`
                      : `₹${offer.discountValue} OFF`}
                  </Text>
                  {offer.code && (
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{offer.code}</Text>
                    </View>
                  )}
                </View>

                {offer.minAmount && (
                  <Text style={styles.minAmount}>
                    Min. order: ₹{offer.minAmount.toLocaleString()}
                  </Text>
                )}

                {offer.endDate && (
                  <Text style={styles.expiryDate}>
                    {expired ? 'Expired' : 'Valid until'}:{' '}
                    {new Date(offer.endDate).toLocaleDateString('en-IN')}
                  </Text>
                )}

                <View style={styles.offerActions}>
                  <TouchableOpacity onPress={() => handleDelete(offer._id, offer.title)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                  <Text style={styles.usageCount}>
                    Used: {offer.timesUsed || 0} times
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 32 },
  addBtn: { marginBottom: 4 },
  offerCard: {},
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  offerIcon: { fontSize: 28 },
  offerInfo: { flex: 1 },
  offerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  offerDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  discountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  discountValue: { fontSize: 18, fontWeight: '700', color: '#E65100' },
  codeBadge: {
    backgroundColor: '#FFF3E0', paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 6, borderWidth: 1, borderColor: '#FFE0B2',
  },
  codeText: { fontSize: 12, fontWeight: '700', color: '#E65100', letterSpacing: 1 },
  minAmount: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  expiryDate: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  offerActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  deleteLink: { fontSize: 13, color: colors.error, fontWeight: '600' },
  usageCount: { fontSize: 12, color: colors.textSecondary },
});

export default OffersManagementScreen;
