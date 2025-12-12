import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import RoleCard from '../components/RoleCard';
import HeaderComponent from '../components/HeaderNoBack'; 
import NextButton from '../components/NextButton'; 

const ChooseRoleScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState('parent'); 

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };
  
  const handleNextPress = () => {
    // ✅ Navigate to LoginScreen when button is pressed
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <HeaderComponent
        title="Odaberite način prijave"
        subtitle="Nastavite kao roditelj ili kao dijete."
      />

      <View style={styles.cardContainer}>
        <RoleCard
          title="Roditelj"
          iconName="account-group" 
          isSelected={selectedRole === 'parent'}
          onPress={() => handleRoleSelect('parent')}
        />
        
        <View style={{ width: 20 }} /> 

        <RoleCard
          title="Dijete"
          iconName="baby-face-outline" 
          isSelected={selectedRole === 'child'}
          onPress={() => handleRoleSelect('child')}
        />
      </View>
      
      <View style={styles.buttonWrapper}>
        <NextButton 
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
    padding: 20,
    paddingTop: 60,
  },
  cardContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
  },
  buttonWrapper: {
    flex: 1, 
    justifyContent: 'flex-end', 
    width: '100%',
    alignItems: 'center',
    marginBottom: 280,
  }
});

export default ChooseRoleScreen;
