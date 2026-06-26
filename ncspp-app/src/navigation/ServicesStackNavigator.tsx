import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ServicesManagementScreen from '../screens/services/ServicesManagementScreen';
import AddServiceScreen from '../screens/services/AddServiceScreen';
import PricingManagementScreen from '../screens/services/PricingManagementScreen';
import OffersManagementScreen from '../screens/offers/OffersManagementScreen';
import AddOfferScreen from '../screens/offers/AddOfferScreen';
import { colors } from '../theme/colors';

export type ServicesStackParamList = {
  Services: undefined;
  AddService: undefined;
  Pricing: { serviceId?: string } | undefined;
  Offers: undefined;
  AddOffer: undefined;
};

const Stack = createNativeStackNavigator<ServicesStackParamList>();

const ServicesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Services" component={ServicesManagementScreen}
        options={{ title: 'Services' }} />
      <Stack.Screen name="AddService" component={AddServiceScreen}
        options={{ title: 'Add Service' }} />
      <Stack.Screen name="Pricing" component={PricingManagementScreen}
        options={{ title: 'Pricing' }} />
      <Stack.Screen name="Offers" component={OffersManagementScreen}
        options={{ title: 'Offers' }} />
      <Stack.Screen name="AddOffer" component={AddOfferScreen}
        options={{ title: 'New Offer' }} />
    </Stack.Navigator>
  );
};

export default ServicesStackNavigator;
