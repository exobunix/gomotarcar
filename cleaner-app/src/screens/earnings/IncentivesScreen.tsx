import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const IncentivesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Incentive Tracker</Text>
            <Text style={styles.mainSubTitle}>Track your incentives and rewards</Text>
          </View>
          <TouchableOpacity style={styles.monthSelector}>
            <Icon name="calendar-month-outline" size={16} color="#FFF" />
            <Text style={styles.monthSelectorTxt}>May 2025</Text>
            <Icon name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Trophy Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeaderContent}>
            <View style={styles.tcLeft}>
              <Text style={styles.tcTitle}>Total Incentive Earned</Text>
              <Text style={styles.tcAmount}>₹3,250.00</Text>
              <View style={styles.tcTrendRow}>
                <Icon name="arrow-up" size={12} color="#16A34A" />
                <Text style={styles.tcTrendTxt}>25% vs Apr 2025</Text>
              </View>
            </View>
            <View style={styles.tcRightImage}>
              {/* Pseudo Trophy Mock */}
              <View style={styles.mockTrophy}>
                <Icon name="trophy" size={56} color="#FBBF24" />
                <View style={[styles.confetti, {top: 0, left: -10, backgroundColor: '#3B82F6'}]} />
                <View style={[styles.confetti, {top: 10, right: -5, backgroundColor: '#10B981'}]} />
                <View style={[styles.confetti, {bottom: 10, left: -5, backgroundColor: '#A855F7'}]} />
                <View style={[styles.confetti, {bottom: 0, right: -15, backgroundColor: '#EF4444'}]} />
              </View>
            </View>
          </View>

          <View style={styles.tcFooterGrid}>
            <View style={styles.tcFooterCol}>
              <View style={styles.ftIconRow}>
                <View style={[styles.ftIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="wallet-outline" size={16} color="#16A34A" /></View>
                <View style={{marginLeft: 8}}>
                  <Text style={styles.ftLbl}>Paid This Month</Text>
                  <Text style={styles.ftVal}>₹2,000.00</Text>
                  <Text style={styles.ftSub}>Paid on 05 May 2025</Text>
                </View>
              </View>
            </View>
            <View style={styles.tcFooterCol}>
              <View style={styles.ftIconRow}>
                <View style={[styles.ftIconBg, {backgroundColor: '#FAF5FF'}]}><Icon name="clock-outline" size={16} color="#9333EA" /></View>
                <View style={{marginLeft: 8}}>
                  <Text style={styles.ftLbl}>Pending Payout</Text>
                  <Text style={styles.ftVal}>₹1,250.00</Text>
                  <Text style={styles.ftSub}>Next payout: 20 May 2025</Text>
                </View>
              </View>
            </View>
            <View style={styles.tcFooterCol}>
              <View style={styles.ftIconRow}>
                <View style={[styles.ftIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="gift-outline" size={16} color="#2563EB" /></View>
                <View style={{marginLeft: 8}}>
                  <Text style={styles.ftLbl}>Rewards Unlocked</Text>
                  <Text style={styles.ftVal}>2</Text>
                  <TouchableOpacity><Text style={styles.ftSubBlue}>View details ›</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Incentive Goal */}
        <View style={styles.sectionBlock}>
          <View style={styles.goalHeaderRow}>
            <Text style={styles.sectionTitle}>Monthly Incentive Goal</Text>
            <Text style={styles.goalResetTxt}>Resets on 01 Jun 2025</Text>
          </View>
          
          <View style={styles.goalAmntRow}>
            <Text style={styles.goalAmntActive}>₹3,250.00 <Text style={styles.goalAmntTotal}>/ ₹5,000.00</Text></Text>
            <Text style={styles.goalPercentTxt}>65%</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {width: '65%', backgroundColor: '#16A34A'}]} />
          </View>

          <View style={styles.goalFooterRow}>
            <View style={styles.gfLeft}>
              <Icon name="trophy-outline" size={12} color="#16A34A" />
              <Text style={styles.gfLeftTxt}>₹1,750.00 <Text style={styles.gfLeftSub}>to go</Text></Text>
            </View>
            <View style={styles.gfRight}>
              <Icon name="calendar-outline" size={12} color="#64748B" />
              <Text style={styles.gfRightTxt}>12 days left</Text>
            </View>
          </View>
        </View>

        {/* Incentive Tiers */}
        <View style={styles.sectionBlock}>
          <View style={styles.tierHeaderRow}>
            <Text style={styles.sectionTitle}>Incentive Tiers</Text>
            <Icon name="information-outline" size={16} color="#64748B" />
          </View>

          {/* Bronze Tier */}
          <View style={styles.tierItem}>
            <View style={[styles.tierIconBg, {backgroundColor: '#DCFCE7'}]}><Icon name="shield-star" size={24} color="#16A34A" /></View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierTitle}>Bronze</Text>
              <Text style={styles.tierSub}>Complete 15 Tasks</Text>
            </View>
            <View style={styles.tierProgressCol}>
              <Text style={[styles.tierProgressVal, {color: '#16A34A'}]}>15 / 15</Text>
              <Text style={[styles.tierProgressLbl, {color: '#16A34A'}]}>Completed</Text>
            </View>
            <View style={[styles.tierBadge, {backgroundColor: '#F0FDF4'}]}>
              <View style={{alignItems: 'center'}}>
                <Text style={[styles.tierBadgeAmnt, {color: '#16A34A'}]}>₹500</Text>
                <Text style={[styles.tierBadgeLbl, {color: '#16A34A'}]}>Earned</Text>
              </View>
              <Icon name="check-circle" size={16} color="#16A34A" style={{marginLeft: 8}} />
            </View>
          </View>

          <View style={styles.itemDivider} />

          {/* Silver Tier */}
          <View style={styles.tierItem}>
            <View style={[styles.tierIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="shield-star" size={24} color="#2563EB" /></View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierTitle}>Silver</Text>
              <Text style={styles.tierSub}>Complete 30 Tasks</Text>
            </View>
            <View style={styles.tierProgressCol}>
              <Text style={[styles.tierProgressVal, {color: '#2563EB'}]}>28 / 30</Text>
              <View style={styles.smProgressBarBg}>
                <View style={[styles.smProgressBarFill, {width: '93%', backgroundColor: '#2563EB'}]} />
              </View>
              <Text style={styles.tierProgressLbl}>2 tasks to go</Text>
            </View>
            <View style={[styles.tierBadge, {backgroundColor: '#EFF6FF', justifyContent: 'center'}]}>
              <View style={{alignItems: 'center'}}>
                <Text style={[styles.tierBadgeAmnt, {color: '#2563EB'}]}>₹1,000</Text>
                <Text style={[styles.tierBadgeLbl, {color: '#2563EB'}]}>In Progress</Text>
              </View>
            </View>
          </View>

          <View style={styles.itemDivider} />

          {/* Gold Tier */}
          <View style={styles.tierItem}>
            <View style={[styles.tierIconBg, {backgroundColor: '#F3E8FF'}]}><Icon name="shield-star" size={24} color="#9333EA" /></View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierTitle}>Gold</Text>
              <Text style={styles.tierSub}>Complete 50 Tasks</Text>
            </View>
            <View style={styles.tierProgressCol}>
              <Text style={[styles.tierProgressVal, {color: '#9333EA'}]}>28 / 50</Text>
              <View style={styles.smProgressBarBg}>
                <View style={[styles.smProgressBarFill, {width: '56%', backgroundColor: '#9333EA'}]} />
              </View>
              <Text style={styles.tierProgressLbl}>22 tasks to go</Text>
            </View>
            <View style={[styles.tierBadge, {backgroundColor: '#FAF5FF', justifyContent: 'center'}]}>
              <View style={{alignItems: 'center'}}>
                <Text style={[styles.tierBadgeAmnt, {color: '#9333EA'}]}>₹2,000</Text>
                <Text style={[styles.tierBadgeLbl, {color: '#9333EA'}]}>Locked</Text>
              </View>
              <Icon name="lock-outline" size={14} color="#9333EA" style={{position: 'absolute', right: 8}} />
            </View>
          </View>

        </View>

        {/* Incentive Breakdown */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Incentive Breakdown</Text>
            <Text style={styles.viewDetailsTxt}>View Details</Text>
          </View>

          <View style={styles.bdRow}>
            <View style={[styles.bdIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="check-circle-outline" size={18} color="#16A34A" /></View>
            <View style={styles.bdInfo}>
              <Text style={styles.bdTitle}>Performance Bonus</Text>
              <Text style={styles.bdSub}>Based on task completion & quality</Text>
            </View>
            <View style={styles.bdAmntCol}>
              <Text style={styles.bdAmnt}>₹2,250.00</Text>
              <Text style={[styles.bdPercent, {color: '#16A34A'}]}>69%</Text>
            </View>
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.bdRow}>
            <View style={[styles.bdIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="star-outline" size={18} color="#2563EB" /></View>
            <View style={styles.bdInfo}>
              <Text style={styles.bdTitle}>Weekend Bonus</Text>
              <Text style={styles.bdSub}>Extra for weekend services</Text>
            </View>
            <View style={styles.bdAmntCol}>
              <Text style={styles.bdAmnt}>₹600.00</Text>
              <Text style={[styles.bdPercent, {color: '#2563EB'}]}>18%</Text>
            </View>
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.bdRow}>
            <View style={[styles.bdIconBg, {backgroundColor: '#FFF7ED'}]}><Icon name="gift-outline" size={18} color="#EA580C" /></View>
            <View style={styles.bdInfo}>
              <Text style={styles.bdTitle}>Special Campaign</Text>
              <Text style={styles.bdSub}>May Clean & Win Campaign</Text>
            </View>
            <View style={styles.bdAmntCol}>
              <Text style={styles.bdAmnt}>₹400.00</Text>
              <Text style={[styles.bdPercent, {color: '#EA580C'}]}>13%</Text>
            </View>
          </View>
        </View>

        {/* Recent Incentives */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Incentives</Text>
            <Text style={styles.viewDetailsTxt}>View All</Text>
          </View>

          <View style={styles.riRow}>
            <View style={[styles.bdIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="gift-outline" size={18} color="#16A34A" /></View>
            <View style={styles.riInfo}>
              <Text style={styles.riTitle}>Weekend Bonus</Text>
              <Text style={styles.riSub}>Earned on 11 May 2025</Text>
            </View>
            <View style={styles.riAmntCol}>
              <Text style={styles.riAmnt}>₹300.00</Text>
              <View style={styles.riBadge}><Text style={styles.riBadgeTxt}>Paid</Text></View>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.riRow}>
            <View style={[styles.bdIconBg, {backgroundColor: '#FAF5FF'}]}><Icon name="gift-outline" size={18} color="#9333EA" /></View>
            <View style={styles.riInfo}>
              <Text style={styles.riTitle}>May Clean & Win Campaign</Text>
              <Text style={styles.riSub}>Earned on 01 May 2025</Text>
            </View>
            <View style={styles.riAmntCol}>
              <Text style={styles.riAmnt}>₹400.00</Text>
              <View style={styles.riBadge}><Text style={styles.riBadgeTxt}>Paid</Text></View>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Incentives are calculated based on task completion, quality, and customer ratings.</Text>
            <Text style={styles.infoSub}>Payouts are processed every 1st and 20th of the month.</Text>
          </View>
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
  monthSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  monthSelectorTxt: { fontSize: 13, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginHorizontal: 6 },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  tcHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tcLeft: { flex: 1 },
  tcTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  tcAmount: { fontSize: 28, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 6 },
  tcTrendRow: { flexDirection: 'row', alignItems: 'center' },
  tcTrendTxt: { fontSize: 11, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginLeft: 4 },
  
  tcRightImage: { width: 90, height: 80, alignItems: 'center', justifyContent: 'center' },
  mockTrophy: { position: 'relative', width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute', width: 6, height: 6, borderRadius: 2, transform: [{rotate: '45deg'}] },

  tcFooterGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  tcFooterCol: { flex: 1 },
  ftIconRow: { flexDirection: 'row', alignItems: 'flex-start' },
  ftIconBg: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  ftLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  ftVal: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginTop: 2, marginBottom: 2 },
  ftSub: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium' },
  ftSubBlue: { fontSize: 9, color: '#2563EB', fontFamily: 'Inter-SemiBold', fontWeight: '600' },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  goalResetTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  goalAmntRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  goalAmntActive: { fontSize: 16, fontWeight: '800', color: '#16A34A', fontFamily: 'Inter-Bold' },
  goalAmntTotal: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  goalPercentTxt: { fontSize: 14, fontWeight: '800', color: '#16A34A', fontFamily: 'Inter-Bold' },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  goalFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gfLeft: { flexDirection: 'row', alignItems: 'center' },
  gfLeftTxt: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginLeft: 4 },
  gfLeftSub: { color: '#64748B', fontWeight: '500' },
  gfRight: { flexDirection: 'row', alignItems: 'center' },
  gfRightTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },

  tierHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tierItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  tierIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tierInfo: { width: 110 },
  tierTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  tierSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  tierProgressCol: { flex: 1, alignItems: 'center' },
  tierProgressVal: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter-Bold' },
  smProgressBarBg: { width: '80%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginVertical: 4 },
  smProgressBarFill: { height: '100%', borderRadius: 2 },
  tierProgressLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, minWidth: 70, position: 'relative' },
  tierBadgeAmnt: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter-Bold' },
  tierBadgeLbl: { fontSize: 9, fontWeight: '600', fontFamily: 'Inter-SemiBold' },

  itemDivider: { height: 1, backgroundColor: '#F1F5F9' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewDetailsTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  bdRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  bdIconBg: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bdInfo: { flex: 1 },
  bdTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  bdSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  bdAmntCol: { alignItems: 'flex-end' },
  bdAmnt: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  bdPercent: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter-Bold', marginTop: 2 },

  riRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  riInfo: { flex: 1, marginLeft: 12 },
  riTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  riSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  riAmntCol: { alignItems: 'flex-end' },
  riAmnt: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  riBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  riBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 20 },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 11, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold', lineHeight: 16 },
  infoSub: { fontSize: 10, color: '#2563EB', fontFamily: 'Inter-Medium', marginTop: 4 },
});

export default IncentivesScreen;
