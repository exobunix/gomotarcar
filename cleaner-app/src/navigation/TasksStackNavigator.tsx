import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../types/navigation';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import ChecklistScreen from '../screens/tasks/ChecklistScreen';
import CleaningCompletionScreen from '../screens/tasks/CleaningCompletionScreen';
import CustomerDetailScreen from '../screens/customer/CustomerDetailScreen';
import CustomerVehicleDetailScreen from '../screens/customer/CustomerVehicleDetailScreen';

const Stack = createNativeStackNavigator<TasksStackParamList>();

const TasksStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TaskList" component={TaskListScreen} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    <Stack.Screen name="Checklist" component={ChecklistScreen} />
    <Stack.Screen name="CleaningCompletion" component={CleaningCompletionScreen} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    <Stack.Screen name="CustomerVehicleDetail" component={CustomerVehicleDetailScreen} />
  </Stack.Navigator>
);

export default TasksStackNavigator;
