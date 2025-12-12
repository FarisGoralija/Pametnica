import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HeaderComponent = ({ title, subtitle }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // Positioning the header at the top
    width: '100%', 
    alignItems: 'center',
    marginBottom: 50, // Space between header and role cards
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#84D8B9', // Light green color from the image
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333', // Dark text color
    textAlign: 'center',
  },
});

export default HeaderComponent;