import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry = false,
  keyboardType = 'default',
}) => {
  return (
    <View style={styles.container}>
      {iconName && (
        <MaterialCommunityIcons 
          name={iconName} 
          size={24} 
          color={styles.placeholder.color} 
          style={styles.icon} 
        />
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor={styles.placeholder.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 44,
    backgroundColor: '#C0EAF0',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'SFCompactRounded-Bold',
    color: '#7D7D7D', 
  },
  placeholder: {
    // This style object is used only to define the colors for the icon and placeholderTextColor prop
    color: '#AFAFAF',
  },
});

export default CustomInput;