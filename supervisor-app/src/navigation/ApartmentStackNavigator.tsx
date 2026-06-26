import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApartmentStackParamList } from '../types/navigation';
import ApartmentListScreen from '../screens/apartments/ApartmentListScreen';
import ApartmentDetailScreen from '../screens/apartments/ApartmentDetailScreen';
import AddApartmentScreen from '../screens/apartments/AddApartmentScreen';
import QRAssignmentScreen from '../screens/qr/QRAssignmentScreen';
import QRReassignmentScreen from '../screens/qr/QRReassignmentScreen';

const Stack = createNativeStackNavigator<ApartmentStackParamList>();

const ApartmentStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ApartmentList" component={ApartmentListScreen} />
    <Stack.Screen name="ApartmentDetail" component={ApartmentDetailScreen} />
    <Stack.Screen name="AddApartment" component={AddApartmentScreen} />
    <Stack.Screen name="QRAssignment" component={QRAssignmentScreen} />
    <Stack.Screen name="QRReassignment" component={QRReassignmentScreen} />
  </Stack.Navigator>
);

export default ApartmentStackNavigator;
