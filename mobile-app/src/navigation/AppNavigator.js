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
import AlarmScreen from '../screens/AlarmScreen';
import AddAlarmScreen from '../screens/AddAlarmScreen';
import ExamReminderScreen from '../screens/ExamReminderScreen';
import StudyTimerScreen from '../screens/StudyTimerScreen';
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
import DiagnosticsHubScreen from '../screens/DiagnosticsHubScreen';
import DiagnosticCategoryScreen from '../screens/DiagnosticCategoryScreen';
import DiagnosticDetailScreen from '../screens/DiagnosticDetailScreen';


const Stack = createNativeStackNavigator();

// Static Protected Screen Wrappers
const ProtectedMCQScreen = (props) => (
  <AuthGuard><MCQScreen {...props} /></AuthGuard>
);
const ProtectedQuizBattleHomeScreen = (props) => (
  <AuthGuard><QuizBattleHomeScreen {...props} /></AuthGuard>
);
const ProtectedCreateBattleScreen = (props) => (
  <AuthGuard><CreateBattleScreen {...props} /></AuthGuard>
);
const ProtectedJoinBattleScreen = (props) => (
  <AuthGuard><JoinBattleScreen {...props} /></AuthGuard>
);
const ProtectedBattleLobbyScreen = (props) => (
  <AuthGuard><BattleLobbyScreen {...props} /></AuthGuard>
);
const ProtectedBattleQuestionScreen = (props) => (
  <AuthGuard><BattleQuestionScreen {...props} /></AuthGuard>
);
const ProtectedAskAIScreen = (props) => (
  <AuthGuard><AskAIScreen {...props} /></AuthGuard>
);
const ProtectedImageAnswerScreen = (props) => (
  <AuthGuard><ImageAnswerScreen {...props} /></AuthGuard>
);
const ProtectedDiagnosticsHubScreen = (props) => (
  <AuthGuard><DiagnosticsHubScreen {...props} /></AuthGuard>
);
const ProtectedDiagnosticCategoryScreen = (props) => (
  <AuthGuard><DiagnosticCategoryScreen {...props} /></AuthGuard>
);
const ProtectedDiagnosticDetailScreen = (props) => (
  <AuthGuard><DiagnosticDetailScreen {...props} /></AuthGuard>
);

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
          <Stack.Screen name="MCQ" component={ProtectedMCQScreen} />
          <Stack.Screen name="BattleHome" component={ProtectedQuizBattleHomeScreen} />
          <Stack.Screen name="CreateBattle" component={ProtectedCreateBattleScreen} />
          <Stack.Screen name="JoinBattle" component={ProtectedJoinBattleScreen} />
          <Stack.Screen name="Lobby" component={ProtectedBattleLobbyScreen} />
          <Stack.Screen name="LiveBattle" component={ProtectedBattleQuestionScreen} />
          <Stack.Screen name="AskAI" component={ProtectedAskAIScreen} />
          <Stack.Screen name="ImageAnswer" component={ProtectedImageAnswerScreen} />
          <Stack.Screen name="DiagnosticsHub" component={ProtectedDiagnosticsHubScreen} />
          <Stack.Screen name="DiagnosticCategory" component={ProtectedDiagnosticCategoryScreen} />
          <Stack.Screen name="DiagnosticDetail" component={ProtectedDiagnosticDetailScreen} />

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
          <Stack.Screen name="TimerSet" component={AlarmScreen} />
          <Stack.Screen name="AddAlarm" component={AddAlarmScreen} />
          <Stack.Screen name="ExamReminder" component={ExamReminderScreen} />
          <Stack.Screen name="StudyTimer" component={StudyTimerScreen} />
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

