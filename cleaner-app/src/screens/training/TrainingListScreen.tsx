import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import EmptyState from '../../components/common/EmptyState';
import { fetchTrainingModules, fetchTrainingCategories } from '../../redux/slices/trainingSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props { navigation: any }

const categories = ['All', 'Safety', 'Technique', 'Customer Service', 'Equipment', 'Compliance'];

const TrainingListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { modules, loading } = useSelector((s: RootState) => s.training);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const load = useCallback(() => { dispatch(fetchTrainingModules()); dispatch(fetchTrainingCategories()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = modules.filter((m: any) => {
    const matchCat = activeCat === 'All' || (m.category || '').toLowerCase() === activeCat.toLowerCase();
    const matchSearch = !search.trim() || m.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const inProgressModule = modules.find((m: any) => !m.completed && m.progress && m.progress > 0);

  const renderModule = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.moduleCard}
      onPress={() => navigation.navigate('TrainingDetail', { moduleId: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={require('../../assets/images/car-placeholder.png')} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration || '10:00'}</Text>
        </View>
        <View style={styles.playButtonOverlay}>
          <Icon name="play-circle" size={40} color={colors.white} />
        </View>
      </View>
      <View style={styles.moduleInfo}>
        <Text style={styles.moduleCategory}>{item.category || 'General'}</Text>
        <Text style={styles.moduleTitle} numberOfLines={2}>{item.title}</Text>
        {item.completed ? (
          <View style={styles.completedBadge}>
            <Icon name="check-circle" size={14} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress || 0}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Hub</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bookmark-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tutorials..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="tune" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <View>
            {/* Category Chips */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.chipRow}
              style={{ marginBottom: 24, marginTop: 8 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, activeCat === cat && styles.chipActive]}
                  onPress={() => setActiveCat(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, activeCat === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Continue Learning */}
            {inProgressModule && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Continue Learning</Text>
                <TouchableOpacity 
                  style={styles.continueCard}
                  onPress={() => navigation.navigate('TrainingDetail', { moduleId: inProgressModule._id })}
                  activeOpacity={0.9}
                >
                  <View style={styles.continueImageContainer}>
                    <Image source={require('../../assets/images/car-placeholder.png')} style={styles.continueImage} />
                    <View style={styles.playButtonOverlaySmall}>
                      <Icon name="play" size={24} color={colors.white} />
                    </View>
                  </View>
                  <View style={styles.continueInfo}>
                    <Text style={styles.continueTitle} numberOfLines={2}>{inProgressModule.title}</Text>
                    <Text style={styles.continueCategory}>{inProgressModule.category}</Text>
                    <View style={styles.progressWrap}>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${inProgressModule.progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{inProgressModule.progress}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>Recommended For You</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="play-box-multiple-outline" title="No Training Found" description="Check back later for new modules" />
        }
        renderItem={renderModule}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  
  searchWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    marginVertical: 12, 
    backgroundColor: colors.white, 
    borderRadius: 16, 
    paddingLeft: 16, 
    paddingRight: 6,
    height: 56, 
    borderWidth: 1, 
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary, fontFamily: 'Inter-Regular', padding: 0 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: { paddingBottom: 40 },
  
  chipRow: { paddingHorizontal: 20, gap: 12 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: colors.white, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  chipActive: { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
  chipText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: colors.white, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 16, paddingHorizontal: 20 },

  continueCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  continueImageContainer: { position: 'relative', width: 100, height: 80, borderRadius: 12, overflow: 'hidden' },
  continueImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  playButtonOverlaySmall: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  continueTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 4 },
  continueCategory: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium', marginBottom: 8 },

  moduleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnailContainer: { position: 'relative', width: '100%', height: 160 },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { color: colors.white, fontSize: 12, fontFamily: 'Inter-Medium' },
  playButtonOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleInfo: { padding: 16 },
  moduleCategory: { fontSize: 12, color: colors.primaryBlue, fontFamily: 'Inter-SemiBold', marginBottom: 4, textTransform: 'uppercase' },
  moduleTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 12 },
  
  progressWrap: { flexDirection: 'row', alignItems: 'center' },
  progressBg: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primaryBlue, borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.textSecondary, marginLeft: 12, fontFamily: 'Inter-Medium', width: 30, textAlign: 'right' },
  
  completedBadge: { flexDirection: 'row', alignItems: 'center' },
  completedText: { fontSize: 13, color: colors.success, fontFamily: 'Inter-SemiBold' },
});

export default TrainingListScreen;
