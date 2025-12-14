import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import RoleCard from '../components/RoleCard';
import HeaderComponent from '../components/HeaderNoBack';
import NextButton from '../components/NextButton';

const ChooseRoleScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState('parent');

  const handleNextPress = () => {
    navigation.navigate('LoginScreen', { role: selectedRole });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <HeaderComponent
        title="Odaberite način prijave"
        subtitle="Nastavite kao roditelj ili kao dijete."
      />

      {/* CARDS */}
      <View style={styles.cardContainer}>
        <RoleCard
          title="Roditelj"
          iconName="account-group"
          isSelected={selectedRole === 'parent'}
          onPress={() => setSelectedRole('parent')}
        />

        <View style={{ width: 20 }} />

        <RoleCard
          title="Dijete"
          iconName="baby-face-outline"
          isSelected={selectedRole === 'child'}
          onPress={() => setSelectedRole('child')}
        />
      </View>

      {/* 🔥 SPACER */}
      <View style={{ flex: 1 }} />

      {/* BUTTON */}
      <View style={styles.buttonWrapper}>
        <NextButton
          title="Dalje"
          onPress={handleNextPress}
          isDisabled={!selectedRole}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 60, // smaller, safe
  },

  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 80, // safe bottom spacing
  },
});

export default ChooseRoleScreen;
