import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform
} from 'react-native';
import { 
  Sparkles, 
  CircleCheck, 
  X, 
  Zap, 
  Gamepad2, 
  Bot, 
  BookOpen 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const OfferPopup = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Price bounce loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleGetPremium = () => {
    onClose();
    navigation.navigate('Subscription');
  };

  const highlights = [
    { icon: BookOpen, text: "All courses access", color: "#6366F1" },
    { icon: Zap, text: "Unlimited MCQs", color: "#F59E0B" },
    { icon: Gamepad2, text: "Multiplayer battle", color: "#10B981" },
    { icon: Bot, text: "AI support", color: "#EF4444" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Top Label */}
            <View style={styles.offerBadge}>
              <Sparkles size={14} color="#FFF" fill="#FFF" />
              <Text style={styles.offerBadgeText}>LIMITED TIME OFFER</Text>
            </View>

            <Text style={styles.title}>Unlock All MCQs & Features</Text>
            
            {/* Price Section */}
            <View style={styles.priceContainer}>
              <View style={styles.oldPriceBox}>
                <Text style={styles.oldPrice}>₹199</Text>
                <View style={styles.strikethrough} />
              </View>
              
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <Text style={styles.newPrice}>₹49</Text>
              </Animated.View>
            </View>

            <Text style={styles.urgencyText}>Offer expires soon ⏳</Text>

            {/* Highlights */}
            <View style={styles.highlightsContainer}>
              {highlights.map((item, index) => (
                <View key={index} style={styles.highlightItem}>
                  <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                    <item.icon size={16} color={item.color} />
                  </View>
                  <Text style={styles.highlightText}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* CTA Buttons */}
            <TouchableOpacity onPress={handleGetPremium} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Get Premium @ ₹49</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>Maybe Later</Text>
            </TouchableOpacity>

            <Text style={styles.scarcityText}>Only today!</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFF',
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  offerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 5,
  },
  oldPriceBox: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  strikethrough: {
    position: 'absolute',
    width: '110%',
    height: 2,
    backgroundColor: '#EF4444',
    transform: [{ rotate: '-15deg' }],
  },
  newPrice: {
    fontSize: 48,
    fontWeight: '900',
    color: '#10B981',
  },
  urgencyText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '700',
    marginBottom: 25,
  },
  highlightsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 30,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
  primaryBtn: {
    width: width * 0.65,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    marginTop: 15,
    padding: 10,
  },
  secondaryBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  scarcityText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: 'bold',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

export default OfferPopup;
