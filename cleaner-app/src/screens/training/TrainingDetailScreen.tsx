import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const TrainingDetailScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Training Detail</Text>
            <Text style={styles.mainSubTitle}>Learn and improve your skills</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={{ padding: 4, marginRight: 16 }}>
              <Icon name="bookmark-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="share-variant-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Card with Player & Details */}
        <View style={styles.mainCard}>
          
          {/* Hero Player */}
          <View style={styles.heroPlayerWrapper}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1584820927498-cafe4c247481?auto=format&fit=crop&q=80&w=600&h=300'}} style={styles.heroImg} />
            <View style={styles.overlayPlay}><View style={styles.playBtnWhite}><Icon name="play" size={32} color="#000" style={{marginLeft: 4}} /></View></View>
            <View style={styles.durationBadge}><Text style={styles.durationTxt}>08:45</Text></View>
          </View>

          {/* Title Block */}
          <View style={styles.titleBlock}>
            <View style={styles.statusBadgeGreen}>
              <Icon name="check-circle-outline" size={14} color="#16A34A" style={{marginRight: 6}} />
              <Text style={styles.statusBadgeGreenTxt}>Completed</Text>
            </View>
            <Text style={styles.courseTitle}>Workplace Safety Essentials</Text>
            <Text style={styles.courseDesc}>Understand the basic safety guidelines to maintain a safe work environment.</Text>
            <View style={styles.compDateRow}>
              <Icon name="calendar-outline" size={14} color="#64748B" style={{marginRight: 6}} />
              <Text style={styles.compDateTxt}>Completed on 12 May 2025</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Progress Box */}
          <View style={styles.progressBox}>
            <View style={styles.pbHeader}>
              <Text style={styles.pbTitle}>Your Progress</Text>
              <Text style={styles.pbVal}>100%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {width: '100%'}]} />
            </View>
            <View style={styles.pbFooter}>
              <View style={styles.pbFooterLeft}>
                <Icon name="check-circle-outline" size={14} color="#16A34A" style={{marginRight: 4}} />
                <Text style={styles.pbFooterTxt}>Completed</Text>
              </View>
              <Text style={styles.pbFooterDate}>Watched on 12 May 2025</Text>
            </View>
          </View>

        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsRow}>
          {['Overview', 'Contents', 'Quiz', 'Resources'].map((tab, idx) => {
            const isActive = activeTab === tab;
            let iconName = '';
            if (tab === 'Overview') iconName = 'format-list-bulleted';
            if (tab === 'Contents') iconName = 'format-list-checks';
            if (tab === 'Quiz') iconName = 'help-circle-outline';
            if (tab === 'Resources') iconName = 'file-document-outline';

            return (
              <TouchableOpacity key={tab} style={styles.tabBtn} onPress={() => setActiveTab(tab)}>
                <Icon name={iconName} size={24} color={isActive ? '#2563EB' : '#64748B'} style={{marginBottom: 4}} />
                <Text style={[styles.tabBtnTxt, isActive && styles.tabBtnTxtActive]}>{tab}</Text>
                {isActive && <View style={styles.tabActiveIndicator} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Tab Content - Overview */}
        {activeTab === 'Overview' && (
          <View style={styles.overviewContent}>
            
            <Text style={styles.sectionTitle}>About This Training</Text>
            <Text style={styles.sectionP}>This training explains the key safety practices and guidelines that every cleaning professional must follow to prevent accidents and maintain a safe workplace.</Text>

            {/* 4-Block Grid */}
            <View style={styles.fourBlockGrid}>
              <View style={styles.fbItem}>
                <View style={styles.fbIconBg}><Icon name="clock-outline" size={20} color="#2563EB" /></View>
                <Text style={styles.fbLbl}>Duration</Text>
                <Text style={styles.fbVal}>08:45 mins</Text>
              </View>
              <View style={styles.fbDivider} />
              <View style={styles.fbItem}>
                <View style={styles.fbIconBg}><Icon name="chart-bar" size={20} color="#64748B" /></View>
                <Text style={styles.fbLbl}>Level</Text>
                <Text style={styles.fbVal}>Beginner</Text>
              </View>
              <View style={styles.fbDivider} />
              <View style={styles.fbItem}>
                <View style={styles.fbIconBg}><Icon name="tag-outline" size={20} color="#2563EB" /></View>
                <Text style={styles.fbLbl}>Category</Text>
                <Text style={styles.fbVal}>Safety</Text>
              </View>
              <View style={styles.fbDivider} />
              <View style={styles.fbItem}>
                <View style={styles.fbIconBg}><Icon name="earth" size={20} color="#2563EB" /></View>
                <Text style={styles.fbLbl}>Language</Text>
                <Text style={styles.fbVal}>English</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, {marginTop: 24}]}>What You'll Learn</Text>
            <View style={styles.learnList}>
              {['Importance of workplace safety', 'Common hazards in cleaning operations', 'Personal protective equipment (PPE) usage', 'Safe handling of chemicals and tools', 'Emergency procedures and reporting'].map((item, i) => (
                <View key={i} style={styles.learnItem}>
                  <Icon name="check-circle-outline" size={18} color="#16A34A" style={{marginRight: 8, marginTop: 2}} />
                  <Text style={styles.learnTxt}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Success Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
              <View>
                <Text style={styles.infoTxtMain}>You have completed this training.</Text>
                <Text style={styles.infoTxtSub}>Great job! Keep learning to grow your skills.</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, {marginTop: 24, marginBottom: 12}]}>Recommend Next</Text>
            <TouchableOpacity style={styles.recCard}>
              <View style={styles.recThumbWrapper}>
                <Image source={{uri: 'https://images.unsplash.com/photo-1585839075775-680f4f9f476f?auto=format&fit=crop&q=80&w=200&h=120'}} style={styles.recImg} />
                <View style={styles.recOverlay}><Icon name="play-circle-outline" size={32} color="#FFF" /></View>
                <View style={styles.recDuration}><Text style={styles.recDurTxt}>10:30</Text></View>
              </View>
              <View style={styles.recInfo}>
                <Text style={styles.recTitle} numberOfLines={2}>Cleaning Chemicals – Safe Handling</Text>
                <Text style={styles.recDesc} numberOfLines={2}>Learn about different cleaning chemicals and how to handle them safely.</Text>
                <View style={styles.recFooter}>
                  <Text style={styles.recStatus}>In Progress</Text>
                  <View style={styles.recProgBarCont}>
                    <Text style={styles.recProgTxt}>60%</Text>
                    <View style={styles.recProgBg}><View style={[styles.recProgFill, {width: '60%'}]} /></View>
                  </View>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomActionArea}>
        <TouchableOpacity style={styles.watchBtn}>
          <Icon name="refresh" size={20} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.watchBtnTxt}>Watch Again</Text>
        </TouchableOpacity>
      </View>
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

  mainCard: { backgroundColor: '#FFF', borderRadius: 16, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, overflow: 'hidden' },
  
  heroPlayerWrapper: { position: 'relative', width: '100%', height: 180 },
  heroImg: { width: '100%', height: '100%' },
  overlayPlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  playBtnWhite: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  durationTxt: { fontSize: 10, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold' },

  titleBlock: { padding: 16 },
  statusBadgeGreen: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  statusBadgeGreenTxt: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  courseTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 6 },
  courseDesc: { fontSize: 12, color: '#475569', fontFamily: 'Inter-Regular', lineHeight: 18, marginBottom: 12 },
  compDateRow: { flexDirection: 'row', alignItems: 'center' },
  compDateTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  progressBox: { padding: 16 },
  pbHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pbTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  pbVal: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 10 },
  progressBarFill: { height: 6, backgroundColor: '#2563EB', borderRadius: 3 },
  pbFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pbFooterLeft: { flexDirection: 'row', alignItems: 'center' },
  pbFooterTxt: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium' },
  pbFooterDate: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular' },

  tabsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', marginTop: 16 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabBtnTxt: { fontSize: 11, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold', marginTop: 4 },
  tabBtnTxtActive: { color: '#2563EB', fontWeight: '800', fontFamily: 'Inter-Bold' },
  tabActiveIndicator: { position: 'absolute', bottom: -1, left: 16, right: 16, height: 3, backgroundColor: '#2563EB', borderRadius: 2 },

  overviewContent: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 8 },
  sectionP: { fontSize: 12, color: '#475569', fontFamily: 'Inter-Regular', lineHeight: 20, marginBottom: 20 },

  fourBlockGrid: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 16, marginBottom: 24 },
  fbItem: { flex: 1, alignItems: 'center' },
  fbIconBg: { marginBottom: 8 },
  fbLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginBottom: 4 },
  fbVal: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', textAlign: 'center' },
  fbDivider: { width: 1, backgroundColor: '#E2E8F0', height: '80%', alignSelf: 'center' },

  learnList: { marginBottom: 24 },
  learnItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  learnTxt: { flex: 1, fontSize: 12, color: '#0F172A', fontFamily: 'Inter-Medium', lineHeight: 18 },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE' },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTxtMain: { fontSize: 12, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  infoTxtSub: { fontSize: 11, color: '#1E3A8A', fontFamily: 'Inter-Regular' },

  recCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  recThumbWrapper: { position: 'relative', width: 100, height: 70, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  recImg: { width: '100%', height: '100%' },
  recOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  recDuration: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  recDurTxt: { fontSize: 9, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold' },
  
  recInfo: { flex: 1 },
  recTitle: { fontSize: 11, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  recDesc: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginBottom: 8 },
  recFooter: { flexDirection: 'row', alignItems: 'center' },
  recStatus: { fontSize: 9, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginRight: 8, backgroundColor: '#EFF6FF', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  recProgBarCont: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  recProgTxt: { fontSize: 9, fontWeight: '700', color: '#475569', marginRight: 4 },
  recProgBg: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
  recProgFill: { height: 4, backgroundColor: '#2563EB', borderRadius: 2 },

  bottomActionArea: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D5BD7', height: 48, borderRadius: 12 },
  watchBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
});

export default TrainingDetailScreen;
