import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';
import AuthGuard from '../components/AuthGuard';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SubjectScreen from '../screens/SubjectScreen';
import TopicScreen from '../screens/TopicScreen';
import MCQScreen from '../screens/MCQScreen';
import QuizBattleHomeScreen from '../screens/QuizBattleHomeScreen';
import CreateBattleScreen from '../screens/CreateBattleScreen';
import JoinBattleScreen from '../screens/JoinBattleScreen';
import BattleLobbyScreen from '../screens/BattleLobbyScreen';
import BattleQuestionScreen from '../screens/BattleQuestionScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import PaymentFormScreen from '../screens/PaymentFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ImageAnswerScreen from '../screens/ImageAnswerScreen';
import HelpDeskScreen from '../screens/HelpDeskScreen';
import SupportChatScreen from '../screens/SupportChatScreen';
import AskAIScreen from '../screens/AskAIScreen';
import AddExamScreen from '../screens/AddExamScreen';
import ExamResultsScreen from '../screens/ExamResultsScreen';
import SavedQuestionsScreen from '../screens/SavedQuestionsScreen';
import TimerSetScreen from '../screens/TimerSetScreen';
import ResultScreen from '../screens/ResultScreen';
import ReviewScreen from '../screens/ReviewScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import NotificationSettings from '../screens/NotificationSettings';
import WebsiteOptionScreen from '../screens/WebsiteOptionScreen';
import WebViewScreen from '../screens/WebViewScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminPayments from '../screens/admin/AdminPayments';
import AdminSupport from '../screens/admin/AdminSupport';
import SetPasswordScreen from '../screens/SetPasswordScreen';
import AppGuidelinesScreen from '../screens/AppGuidelinesScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, profile, loading, isAdmin, isRecovering } = useAuthStore();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : isRecovering ? (
        <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Subject" component={SubjectScreen} />
          <Stack.Screen name="Topic" component={TopicScreen} />
          
          {/* Protected Routes */}
          <Stack.Screen name="MCQ">
            {props => <AuthGuard><MCQScreen {...props} /></AuthGuard>}
          </Stack.Screen>
          
          <Stack.Screen name="BattleHome">
            {props => <AuthGuard><QuizBattleHomeScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          <Stack.Screen name="CreateBattle">
            {props => <AuthGuard><CreateBattleScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          <Stack.Screen name="JoinBattle">
            {props => <AuthGuard><JoinBattleScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          <Stack.Screen name="Lobby">
            {props => <AuthGuard><BattleLobbyScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          <Stack.Screen name="LiveBattle">
            {props => <AuthGuard><BattleQuestionScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          <Stack.Screen name="AskAI">
            {props => <AuthGuard><AskAIScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          <Stack.Screen name="ImageAnswer">
            {props => <AuthGuard><ImageAnswerScreen {...props} /></AuthGuard>}
          </Stack.Screen>

          {/* Regular Routes */}
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="PaymentForm" component={PaymentFormScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="HelpDesk" component={HelpDeskScreen} />
          <Stack.Screen name="SupportChat" component={SupportChatScreen} />
          <Stack.Screen name="AddExam" component={AddExamScreen} />
          <Stack.Screen name="ExamResults" component={ExamResultsScreen} />
          <Stack.Screen name="SavedQuestions" component={SavedQuestionsScreen} />
          <Stack.Screen name="TimerSet" component={TimerSetScreen} />
          <Stack.Screen name="WebsiteOption" component={WebsiteOptionScreen} />
          <Stack.Screen name="WebView" component={WebViewScreen} />
          <Stack.Screen name="AppGuidelines" component={AppGuidelinesScreen} />

          {/* Admin Routes */}
          {isAdmin() && (
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
              <Stack.Screen name="AdminUsers" component={AdminUsers} />
              <Stack.Screen name="AdminPayments" component={AdminPayments} />
              <Stack.Screen name="AdminSupport" component={AdminSupport} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

