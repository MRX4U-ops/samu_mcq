import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ActivityIndicator, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, RotateCw, Globe, ArrowLeft, ArrowRight, Share2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const WebViewScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);

  const handleRefresh = () => {
    webViewRef.current?.reload();
    setError(false);
  };

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      navigation.goBack();
    }
  };

  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const getDomainName = (urlString) => {
    try {
      const domain = new URL(urlString).hostname;
      return domain.replace('www.', '');
    } catch (e) {
      return 'Web Portal';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Mini Header / Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.toolbarButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.urlContainer}>
          <Globe size={14} color="#64748B" />
          <Text style={styles.urlText} numberOfLines={1}>{getDomainName(url)}</Text>
        </View>

        <TouchableOpacity onPress={handleRefresh} style={styles.toolbarButton}>
          <RotateCw size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.webContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          startInLoadingState={true}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setError(true)}
          onNavigationStateChange={onNavigationStateChange}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Connecting to {getDomainName(url)}...</Text>
            </View>
          )}
        />

        {error && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}>
              <Globe size={40} color="#EF4444" />
            </View>
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorSub}>Please check your internet connection and try again.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryText}>Retry Loading</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Browser-like Bottom Controls */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          disabled={!canGoBack} 
          onPress={() => webViewRef.current?.goBack()}
          style={[styles.navButton, !canGoBack && styles.disabledButton]}
        >
          <ArrowLeft size={22} color={canGoBack ? "#1E293B" : "#CBD5E1"} />
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={!canGoForward} 
          onPress={() => webViewRef.current?.goForward()}
          style={[styles.navButton, !canGoForward && styles.disabledButton]}
        >
          <ArrowRight size={22} color={canGoForward ? "#1E293B" : "#CBD5E1"} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
          <Text style={styles.exitText}>Exit View</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toolbarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  urlText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  webContainer: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFF',
  },
  navButton: {
    padding: 10,
  },
  disabledButton: {
    opacity: 0.3,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  exitText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
  }
});

export default WebViewScreen;
