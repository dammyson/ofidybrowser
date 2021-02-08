import React from 'react'
import { StyleSheet, Text, Dimensions, View, } from 'react-native'
import PropTypes from 'prop-types';
import {
    BarIndicator,
} from 'react-native-indicators';

const width = Dimensions.get('window').width


const ActivityIndicator = ({ name, message, color }) => {
    return (
        <View style={styles.backgroundImage}>
            <View style={styles.welcome}>
                <Text style={{ fontSize: 13, color: color }}>{message}</Text>
                <BarIndicator count={4} color={color} />
                <Text style={{ fontSize: 11, flex: 1, color: color }}>Please wait...</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        position: "absolute",
    },
    welcome: {
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ActivityIndicator