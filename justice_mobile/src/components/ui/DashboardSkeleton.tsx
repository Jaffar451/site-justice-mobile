import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ width: w, height: h, style }: any) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[{ opacity, backgroundColor: '#CBD5E1', borderRadius: 12 }, { width: w, height: h }, style]} />;
};

export default function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* KPI Squelettes */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <SkeletonItem width="48%" height={80} />
        <SkeletonItem width="48%" height={80} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
        <SkeletonItem width="48%" height={80} />
        <SkeletonItem width="48%" height={80} />
      </View>

      {/* Titre Section */}
      <SkeletonItem width={200} height={20} style={{ marginBottom: 20 }} />

      {/* Liste Menu Squelettes */}
      <SkeletonItem width="100%" height={70} style={{ marginBottom: 12 }} />
      <SkeletonItem width="100%" height={70} style={{ marginBottom: 12 }} />
      <SkeletonItem width="100%" height={70} style={{ marginBottom: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 16 } });