import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SigninScreen() {
    return (
        <View style={styles.container}>
            <Text>Sign In / Sign Up Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
