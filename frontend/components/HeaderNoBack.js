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
    paddingTop: 45,
  },
 title: {
  fontSize: 28,
  color: '#2787CC',
  textAlign: 'center',
  marginBottom: 8,
  fontFamily: 'SFCompactRounded-Bold', // <-- add this
},
subtitle: {
  fontSize: 18,
  color: '#AFAFAF',
  textAlign: 'center',
  fontFamily: 'SFCompactRounded-Semibold', // <-- add this
},

});

export default HeaderComponent;