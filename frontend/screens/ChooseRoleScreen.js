// screens/ChooseRoleScreen.js (KEY PARTS UPDATED)

// ... (Your imports for RoleCard and HeaderComponent)
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import RoleCard from '../components/RoleCard';
import HeaderComponent from '../components/HeaderNoBack'; 
// 👇 IMPORT THE NEW BUTTON
import NextButton from '../components/NextButton'; 
// ... (Your MaterialCommunityIcons import and Component definitions)


const ChooseRoleScreen = () => {
  const [selectedRole, setSelectedRole] = useState('parent'); 

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };
  
  // New function to handle button press
  const handleNextPress = () => {
    console.log(`Navigating to next screen with role: ${selectedRole}`);
    // navigation.navigate('NextScreen', { selectedRole });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <HeaderComponent
        title="Odaberite način prijave"
        subtitle="Nastavite kao roditelj ili kao dijete."
      />

      <View style={styles.cardContainer}>
        {/* ... Role Cards (Roditelj and Dijete) ... */}
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
      
      {/* 👇 ADD THE NEXT BUTTON HERE */}
      <View style={styles.buttonWrapper}>
        <NextButton 
          onPress={handleNextPress}
          // The button is active because a role is always selected by default
          isDisabled={!selectedRole} 
        />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Crucial for layout
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
    marginTop: 100, // Keeps the cards lowered
    // Use 'flex: 1' on cardContainer or use a wrapper with absolute positioning 
    // if you want the button fixed at the bottom.
  },
  buttonWrapper: {
    // This pushes the button to the bottom using flex layout
    flex: 1, 
    justifyContent: 'flex-end', 
    width: '100%',
    alignItems: 'center',
    marginBottom: 280, // Space from the bottom edge
  }
});

// ... (Export)
export default ChooseRoleScreen;