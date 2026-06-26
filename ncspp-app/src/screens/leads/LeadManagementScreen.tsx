import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchLeads, updateLeadStatus } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const statusFilters = ['All', 'New', 'Contacted', 'Interested', 'Converted', 'Lost'];

const LeadManagementScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error } = useSelector((state: RootState) => state.lead);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(() => {
    dispatch(fetchLeads({}));
  }, [dispatch]);

  useRefreshOnFocus(loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchLeads({}));
    setRefreshing(false);
  };

  const filteredLeads = leads.filter((lead: any) => {
    if (activeFilter !== 'All' && lead.status !== activeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.includes(searchQuery)) ||
        (lead.email && lead.email.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getLeadIcon = (status: string) => {
    const icons: Record<string, string> = {
      New: '🆕', Contacted: '📞', Interested: '⭐',
      Converted: '✅', Lost: '❌',
    };
    return icons[status] || '📋';
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
              {filter !== 'All' && (
                <Text style={styles.filterCount}>
                  {' '}
                  ({leads.filter((l: any) => l.status === filter).length})
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No Leads Found"
            message={searchQuery ? 'Try a different search' : 'No leads yet. New leads will appear here.'}
          />
        ) : (
          filteredLeads.map((lead: any) => (
            <TouchableOpacity
              key={lead._id}
              onPress={() => navigation.navigate('LeadDetail', { leadId: lead._id })}
            >
              <Card style={styles.leadCard}>
                <View style={styles.leadHeader}>
                  <View style={styles.leadInfo}>
                    <Text style={styles.leadIcon}>
                      {getLeadIcon(lead.status)}
                    </Text>
                    <View>
                      <Text style={styles.leadName}>
                        {lead.name || 'Unknown'}
                      </Text>
                      <Text style={styles.leadPhone}>{lead.phone}</Text>
                    </View>
                  </View>
                  <StatusBadge status={lead.status} />
                </View>
                {lead.service && (
                  <Text style={styles.leadService}>
                    Interested in: {lead.service}
                  </Text>
                )}
                <View style={styles.leadFooter}>
                  <Text style={styles.leadDate}>
                    {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                  <Text style={styles.leadArrow}>→</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  filterRow: {
    maxHeight: 44,
    marginVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  filterCount: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  leadCard: {
    marginBottom: 0,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leadIcon: {
    fontSize: 28,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  leadPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  leadService: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 38,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 38,
  },
  leadDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  leadArrow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default LeadManagementScreen;
