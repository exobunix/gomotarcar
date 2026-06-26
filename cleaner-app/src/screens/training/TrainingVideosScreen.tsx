import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchCategories, fetchVideos } from '../../redux/slices/trainingSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const TrainingVideosScreen: React.FC<Props> = ({ navigation }) => {
  const [activeChip, setActiveChip] = useState('All');

  const dispatch = useDispatch<AppDispatch>();
  const { categories, videos, loading } = useSelector((s: RootState) => s.training);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchVideos());
  }, [dispatch]);

  const chips = [
    { id: 'All', icon: 'play-circle-outline', color: '#2563EB' },
    ...categories.map(c => ({ id: c.name, icon: c.icon || 'play-circle-outline', color: c.color || '#2563EB' }))
  ];

  const dummyVideos = [
    { id: 1, title: 'Workplace Safety Essentials', desc: 'Understand the basic safety guidelines to maintain a safe work environment.', duration: '08:45', status: 'Completed', compDate: '12 May 2025', progress: null, thumb: 'https://images.unsplash.com/photo-1584820927498-cafe4c247481?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 2, title: 'Cleaning Chemicals – Safe Handling', desc: 'Learn about different cleaning chemicals and how to handle them safely.', duration: '11:20', status: 'In Progress', compDate: null, progress: 60, thumb: 'https://images.unsplash.com/photo-1585839075775-680f4f9f476f?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 3, title: 'Machine Operation Basics', desc: 'Step-by-step guide to operate cleaning machines efficiently.', duration: '09:30', status: 'Not Started', compDate: null, progress: null, thumb: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400&h=250' },
  ];

  const displayVideos = videos.length > 0 ? videos : dummyVideos;

  const filteredVideos = displayVideos.filter(v => {
    if (activeChip === 'All') return true;
    return v.category === activeChip || (v as any).status === activeChip;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Training Videos</Text>
            <Text style={styles.mainSubTitle}>Learn, grow and stay updated</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={{ padding: 4, marginRight: 16 }}>
              <Icon name="magnify" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="filter-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.pcHeader}>
            <Text style={styles.pcTitle}>My Training Progress</Text>
            <TouchableOpacity><Text style={styles.pcViewAll}>View All Progress ›</Text></TouchableOpacity>
          </View>
          
          <View style={styles.pcStatsRow}>
            {/* Fake Donut */}
            <View style={styles.donutBox}>
              <View style={styles.donutOuter}>
                <View style={styles.donutInner}>
                  <Text style={styles.donutVal}>65%</Text>
                  <Text style={styles.donutLbl}>Completed</Text>
                </View>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="bookmark-check-outline" size={20} color="#2563EB" /></View>
              <Text style={styles.statVal}>13</Text>
              <Text style={styles.statLbl}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, {backgroundColor: '#FFF7ED'}]}><Icon name="play-circle-outline" size={20} color="#EA580C" /></View>
              <Text style={styles.statVal}>6</Text>
              <Text style={styles.statLbl}>In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="text-box-outline" size={20} color="#16A34A" /></View>
              <Text style={styles.statVal}>22</Text>
              <Text style={styles.statLbl}>Not Started</Text>
            </View>
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {chips.map(chip => {
            const isActive = activeChip === chip.id;
            return (
              <TouchableOpacity key={chip.id} style={[styles.chipBox, isActive && styles.chipActive]} onPress={() => setActiveChip(chip.id)}>
                <Icon name={chip.icon} size={20} color={isActive ? '#2563EB' : chip.color} />
                <Text style={[styles.chipTxt, isActive && styles.chipTxtActive]}>{chip.id}</Text>
                {isActive && <View style={styles.chipActiveLine} />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>All Training Videos ({filteredVideos.length})</Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Text style={styles.sortBtnTxt}>Sort by: Recently Added</Text>
            <Icon name="chevron-down" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Video List */}
        <View style={styles.videoList}>
          {filteredVideos.map((vid: any) => (
            <TouchableOpacity key={vid._id || vid.id} style={styles.videoCard} onPress={() => navigation.navigate('TrainingDetail', { moduleId: vid._id || vid.id })}>
              {/* Thumbnail */}
              <View style={styles.thumbWrapper}>
                <Image source={{uri: vid.thumbnail || vid.thumb}} style={styles.thumbImg} />
                <View style={styles.overlayPlay}><Icon name="play" size={28} color="#FFF" /></View>
                <View style={styles.durationBadge}><Text style={styles.durationTxt}>{vid.duration}</Text></View>
              </View>
              
              {/* Info */}
              <View style={styles.vidInfo}>
                <View style={styles.vidTitleRow}>
                  <Text style={styles.vidTitle} numberOfLines={2}>{vid.title}</Text>
                  <TouchableOpacity><Icon name="dots-vertical" size={20} color="#64748B" /></TouchableOpacity>
                </View>
                <Text style={styles.vidDesc} numberOfLines={2}>{vid.description || vid.desc}</Text>
                
                {/* Status Footer */}
                <View style={styles.vidFooter}>
                  {vid.status === 'Completed' || vid.completed ? (
                    <>
                      <View style={[styles.statusBadge, {borderColor: '#BBF7D0', backgroundColor: '#F0FDF4'}]}>
                        <Icon name="check-circle-outline" size={12} color="#16A34A" style={{marginRight: 4}} />
                        <Text style={[styles.statusBadgeTxt, {color: '#16A34A'}]}>Completed</Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Icon name="calendar-outline" size={12} color="#64748B" style={{marginRight: 4}} />
                        <Text style={styles.dateTxt}>Completed on {vid.compDate || new Date(vid.createdAt).toLocaleDateString()}</Text>
                      </View>
                    </>
                  ) : vid.status === 'In Progress' ? (
                    <>
                      <View style={[styles.statusBadge, {borderColor: '#BFDBFE', backgroundColor: '#EFF6FF'}]}>
                        <Icon name="clock-outline" size={12} color="#2563EB" style={{marginRight: 4}} />
                        <Text style={[styles.statusBadgeTxt, {color: '#2563EB'}]}>In Progress</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, {width: `${vid.progress || 0}%`}]} />
                        </View>
                        <Text style={styles.progressTxt}>{vid.progress || 0}%</Text>
                      </View>
                    </>
                  ) : (
                    <View style={[styles.statusBadge, {borderColor: '#FED7AA', backgroundColor: '#FFF7ED'}]}>
                      <Icon name="play-circle-outline" size={12} color="#EA580C" style={{marginRight: 4}} />
                      <Text style={[styles.statusBadgeTxt, {color: '#EA580C'}]}>Not Started</Text>
                    </View>
                  )}
                </View>

              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <Text style={styles.infoTxt}>New videos are added regularly. Keep learning to enhance your skills!</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingBottom: 40 },

  progressCard: { backgroundColor: '#FFF', borderRadius: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  pcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pcTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  pcViewAll: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  
  pcStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donutBox: { alignItems: 'center', justifyContent: 'center' },
  donutOuter: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#2563EB', alignItems: 'center', justifyContent: 'center', borderRightColor: '#E2E8F0' }, // Fake pie
  donutInner: { alignItems: 'center' },
  donutVal: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  donutLbl: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium' },

  statItem: { alignItems: 'center' },
  statIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statVal: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  statLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },

  chipsScroll: { paddingHorizontal: 16, paddingVertical: 16, marginTop: 4 },
  chipBox: { alignItems: 'center', marginHorizontal: 8, paddingBottom: 8, position: 'relative' },
  chipActive: { },
  chipTxt: { fontSize: 10, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold', marginTop: 8 },
  chipTxtActive: { color: '#2563EB', fontWeight: '700', fontFamily: 'Inter-Bold' },
  chipActiveLine: { position: 'absolute', bottom: 0, left: -4, right: -4, height: 3, backgroundColor: '#2563EB', borderRadius: 2 },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortBtnTxt: { fontSize: 11, fontWeight: '600', color: '#2563EB', fontFamily: 'Inter-SemiBold', marginRight: 4 },

  videoList: { paddingHorizontal: 16 },
  videoCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 12 },
  thumbWrapper: { position: 'relative', width: 120, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  thumbImg: { width: '100%', height: '100%' },
  overlayPlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  durationTxt: { fontSize: 9, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold' },

  vidInfo: { flex: 1, justifyContent: 'center' },
  vidTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vidTitle: { flex: 1, fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', lineHeight: 16, paddingRight: 4 },
  vidDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4, lineHeight: 14, marginBottom: 8 },
  
  vidFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  statusBadgeTxt: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },
  
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateTxt: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },

  progressContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  progressBarBg: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginRight: 8 },
  progressBarFill: { height: 4, backgroundColor: '#2563EB', borderRadius: 2 },
  progressTxt: { fontSize: 10, fontWeight: '700', color: '#475569', fontFamily: 'Inter-Bold' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 16, alignItems: 'center', marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTxt: { flex: 1, fontSize: 11, color: '#1E3A8A', fontFamily: 'Inter-Medium', lineHeight: 16 },
});

export default TrainingVideosScreen;
