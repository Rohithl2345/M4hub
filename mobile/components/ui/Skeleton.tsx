import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
    width: DimensionValue;
    height: DimensionValue;
    borderRadius?: number;
    style?: ViewStyle;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width],
    });

    return (
        <View
            style={[
                styles.container,
                { width, height, borderRadius },
                style,
            ]}
        >
            <AnimatedLinearGradient
                colors={['#e1e4e8', '#f2f4f6', '#e1e4e8']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                    styles.gradient,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e1e4e8',
        overflow: 'hidden',
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
});
