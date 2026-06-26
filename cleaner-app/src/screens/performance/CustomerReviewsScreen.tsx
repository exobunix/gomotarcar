import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const CustomerReviewsScreen: React.FC<Props> = ({ navigation }) => {

  const reviews = [
    { id: 1, name: 'Rohit Sharma', verified: true, rating: 5, text: 'Very professional team. The cleaning was done perfectly. Highly recommended!', loc: 'Sector 62, Noida', date: '12 May 2025', tag: 'Housekeeping', tagColor: '#2563EB', tagBg: '#EFF6FF', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100' },
    { id: 2, name: 'Priya Mehta', verified: true, rating: 4, text: 'Good service and on-time. Staff was polite and cooperative.', loc: 'Sector 18, Noida', date: '10 May 2025', tag: 'Floor Cleaning', tagColor: '#2563EB', tagBg: '#EFF6FF', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100' },
    { id: 3, name: 'Amit Verma', verified: true, rating: 3, text: 'Cleaning was okay but some corners were missed.', loc: 'Sector 15, Noida', date: '08 May 2025', tag: 'Deep Cleaning', tagColor: '#EA580C', tagBg: '#FFF7ED', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100' },
    { id: 4, name: 'Sneha Kapoor', verified: true, rating: 5, text: 'Excellent work! Very satisfied with the attention to detail.', loc: 'Sector 137, Noida', date: '06 May 2025', tag: 'Housekeeping', tagColor: '#2563EB', tagBg: '#EFF6FF', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100' },
    { id: 5, name: 'Vikas Singh', verified: true, rating: 2, text: 'Service was delayed and staff was in a hurry.', loc: 'Sector 75, Noida', date: '04 May 2025', tag: 'Window Cleaning', tagColor: '#DC2626', tagBg: '#FEF2F2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100' },
  ];

  const renderStars = (rating: number) => {
    return (
      <View style={{flexDirection: 'row'}}>
        {[1,2,3,4,5].map(i => (
          <Icon key={i} name="star" size={12} color={i <= rating ? '#EAB308' : '#CBD5E1'} style={{marginRight: 2}} />
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Customer Reviews</Text>
            <Text style={styles.mainSubTitle}>See what our customers are saying</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-outline" size={16} color="#FFF" />
            <Text style={styles.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Sub-header Dropdowns */}
        <View style={styles.dropdownsRow}>
          <TouchableOpacity style={styles.drpBtn}>
            <Icon name="calendar-month-outline" size={16} color="#FFF" style={{marginRight: 6}} />
            <Text style={styles.drpBtnTxt}>May 2025</Text>
            <Icon name="chevron-down" size={16} color="#FFF" style={{marginLeft: 4}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.drpBtn}>
            <Icon name="map-marker-outline" size={16} color="#FFF" style={{marginRight: 6}} />
            <Text style={styles.drpBtnTxt}>All Locations</Text>
            <Icon name="chevron-down" size={16} color="#FFF" style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 4-Block Top Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Average Rating</Text>
            <View style={styles.statValRow}>
              <Text style={[styles.statVal, {color: '#2563EB'}]}>4.6</Text>
              <Icon name="star" size={16} color="#EAB308" style={{marginLeft: 4}} />
            </View>
            <View style={styles.statPillGreen}><Text style={styles.statPillGreenTxt}>Excellent</Text></View>
            <Text style={[styles.statTrend, {color: '#16A34A'}]}>↑ 0.4 <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Total Reviews</Text>
            <Text style={[styles.statVal, {marginTop: 6}]}>126</Text>
            <Text style={styles.statPillSub}>This Month</Text>
            <Text style={[styles.statTrend, {color: '#16A34A', marginTop: 10}]}>↑ 18 <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Positive Reviews</Text>
            <Text style={[styles.statVal, {marginTop: 6, color: '#16A34A'}]}>112</Text>
            <Text style={styles.statPillSub}>89%</Text>
            <Text style={[styles.statTrend, {color: '#16A34A', marginTop: 10}]}>↑ 5% <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Areas Improved</Text>
            <Text style={[styles.statVal, {marginTop: 6, color: '#EA580C'}]}>3</Text>
            <Text style={styles.statPillSub}>Needs Attention</Text>
            <Text style={[styles.statTrend, {color: '#DC2626', marginTop: 10}]}>↑ 1 <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
          </View>
        </View>

        {/* Rating Breakdown Card */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rating Breakdown</Text>
            <TouchableOpacity><Text style={styles.viewDetailsTxt}>View Details ›</Text></TouchableOpacity>
          </View>
          
          <View style={styles.breakdownContent}>
            <View style={styles.bdLeft}>
              {[ {s: 5, pct: '60%', w: '80%'}, {s: 4, pct: '25%', w: '50%'}, {s: 3, pct: '10%', w: '25%'}, {s: 2, pct: '3%', w: '10%'}, {s: 1, pct: '2%', w: '5%'} ].map(item => (
                <View key={item.s} style={styles.bdRow}>
                  <Text style={styles.bdStarTxt}>{item.s}</Text>
                  <Icon name="star" size={10} color="#EAB308" style={{marginRight: 8}} />
                  <View style={styles.bdBarBg}>
                    <View style={[styles.bdBarFill, {width: item.w}]} />
                  </View>
                  <Text style={styles.bdPctTxt}>{item.pct}</Text>
                </View>
              ))}
            </View>

            <View style={styles.bdRight}>
              <View style={styles.bdRightIconBg}><Icon name="star-outline" size={24} color="#2563EB" /></View>
              <Text style={styles.bdRightTitle}>Great job!</Text>
              <Text style={styles.bdRightSub}>Most customers are happy with our service.</Text>
            </View>
          </View>
        </View>

        {/* Recent Reviews List */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity><Text style={styles.viewDetailsTxt}>See All</Text></TouchableOpacity>
          </View>
          
          {reviews.map((rev, index) => (
            <View key={rev.id} style={[styles.reviewItem, index !== reviews.length - 1 && styles.reviewBorder]}>
              <View style={styles.revTopRow}>
                <Image source={{uri: rev.avatar}} style={styles.revAvatar} />
                <View style={styles.revTitleCol}>
                  <View style={styles.revNameRow}>
                    <Text style={styles.revName}>{rev.name}</Text>
                    {rev.verified && <View style={styles.verifiedBadge}><Text style={styles.verifiedBadgeTxt}>Verified</Text></View>}
                  </View>
                  {renderStars(rev.rating)}
                </View>
                <View style={styles.revRightCol}>
                  <Text style={[styles.revScoreTxt, {color: rev.rating >= 4 ? '#16A34A' : rev.rating === 3 ? '#EA580C' : '#DC2626'}]}>{rev.rating.toFixed(1)}</Text>
                  <TouchableOpacity><Icon name="dots-vertical" size={20} color="#94A3B8" /></TouchableOpacity>
                </View>
              </View>

              <Text style={styles.revText}>{rev.text}</Text>

              <View style={styles.revFooterRow}>
                <View style={styles.revFooterLeft}>
                  <View style={styles.revMetaItem}>
                    <Icon name="map-marker-outline" size={12} color="#64748B" />
                    <Text style={styles.revMetaTxt}>{rev.loc}</Text>
                  </View>
                  <View style={styles.revMetaDivider} />
                  <View style={styles.revMetaItem}>
                    <Icon name="calendar-outline" size={12} color="#64748B" />
                    <Text style={styles.revMetaTxt}>{rev.date}</Text>
                  </View>
                </View>
                <View style={[styles.revTag, {backgroundColor: rev.tagBg}]}><Text style={[styles.revTagTxt, {color: rev.tagColor}]}>{rev.tag}</Text></View>
              </View>
            </View>
          ))}
        </View>

        {/* Floating Banner */}
        <View style={styles.feedbackBanner}>
          <View style={styles.fbbIconBg}><Icon name="message-processing-outline" size={20} color="#FFF" /></View>
          <View style={styles.fbbInfo}>
            <Text style={styles.fbbTitle}>We value your feedback!</Text>
            <Text style={styles.fbbSub}>Keep sharing your experience to help us improve.</Text>
          </View>
          <TouchableOpacity style={styles.fbbBtn}>
            <Text style={styles.fbbBtnTxt}>Submit Feedback</Text>
          </TouchableOpacity>
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
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  filterBtnTxt: { fontSize: 12, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginLeft: 4 },

  dropdownsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 60 },
  drpBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 12 },
  drpBtnTxt: { fontSize: 11, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold' },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCol: { width: '23.5%', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center', minHeight: 24 },
  statValRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statVal: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  statPillGreen: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statPillGreenTxt: { fontSize: 8, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  statPillSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  statTrend: { fontSize: 8, fontWeight: '700', fontFamily: 'Inter-Bold', marginTop: 6, textAlign: 'center' },
  statTrendSub: { color: '#94A3B8', fontWeight: '500' },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  viewDetailsTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  breakdownContent: { flexDirection: 'row', alignItems: 'center' },
  bdLeft: { flex: 1, paddingRight: 16 },
  bdRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bdStarTxt: { fontSize: 10, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', width: 10 },
  bdBarBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: 8 },
  bdBarFill: { height: 6, backgroundColor: '#2563EB', borderRadius: 3 },
  bdPctTxt: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', width: 24, textAlign: 'right' },
  
  bdRight: { width: 120, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  bdRightIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  bdRightTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4, textAlign: 'center' },
  bdRightSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center', lineHeight: 14 },

  reviewItem: { paddingVertical: 16 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  revTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  revAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  revTitleCol: { flex: 1, justifyContent: 'center' },
  revNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  revName: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginRight: 8 },
  verifiedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  verifiedBadgeTxt: { fontSize: 8, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  revRightCol: { flexDirection: 'row', alignItems: 'flex-start', width: 50, justifyContent: 'space-between' },
  revScoreTxt: { fontSize: 14, fontWeight: '800', fontFamily: 'Inter-Bold' },

  revText: { fontSize: 12, color: '#475569', fontFamily: 'Inter-Medium', lineHeight: 18, marginBottom: 12 },
  
  revFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revFooterLeft: { flexDirection: 'row', alignItems: 'center' },
  revMetaItem: { flexDirection: 'row', alignItems: 'center' },
  revMetaTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  revMetaDivider: { width: 1, height: 10, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  revTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  revTagTxt: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },

  feedbackBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', marginTop: 8 },
  fbbIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fbbInfo: { flex: 1 },
  fbbTitle: { fontSize: 12, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  fbbSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium', lineHeight: 14 },
  fbbBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  fbbBtnTxt: { fontSize: 10, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
});

export default CustomerReviewsScreen;
