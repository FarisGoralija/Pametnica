import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import CustomInput from '../components/CustomInput';
import NextButton from '../components/NextButton';
import Logo from '../components/Logo'; 

const LoginScreen = ({ navigation, route }) => {
  const role = route?.params?.role || 'parent'; // Get role from navigation, default 'parent'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email.length > 0 && password.length > 0) {
      console.log(`Logging in with Email: ${email}`);
    } else {
      console.log("Please enter both email and password.");
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password link pressed.");
  };

  const handleRegister = () => {
    console.log("Register link pressed.");
  };

  const isButtonDisabled = email.length === 0 || password.length === 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          
          <Logo />

          {/* Role-based subtitle */}
          <Text style={styles.roleSubtitle}>
            {role === 'parent' ? 'Račun za roditelje' : 'Račun za djecu'}
          </Text>

          <View style={styles.contentContainer}>
            <CustomInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              iconName="email-outline" 
              keyboardType="email-address"
            />

            <CustomInput
              placeholder="Šifra"
              value={password}
              onChangeText={setPassword}
              iconName="lock-outline" 
              secureTextEntry={true}
            />
            
            <TouchableOpacity 
              onPress={handleForgotPassword} 
              style={styles.forgotPasswordButton}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>
                Zaboravljena šifra?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <NextButton 
              title="Prijavi se"
              onPress={handleLogin}
              isDisabled={isButtonDisabled} 
            />
            
            {/* Show registration only for parent role */}
            {role === 'parent' && (
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Nemas račun? </Text>
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                  <Text style={styles.registerLink}>Registruj se odmah!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 20,
    paddingTop: 180,
  },
  roleSubtitle: {
    fontSize: 18,
    fontFamily:  'SFCompactRounded-Semibold',
    color: '#7D7D7D',
    marginTop:-30,
    marginBottom: 70,
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 0, 
  },
  forgotPasswordButton: {
    width: 300,
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontFamily: 'sf-rounded-regular',
    color: '#3797EF',
  },
  buttonWrapper: {
    flex: 1, 
    justifyContent: 'flex-end', 
    width: '100%',
    alignItems: 'center',
    marginBottom: 70, 
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontFamily: 'sf-rounded-regular',
    fontSize: 16,
    color: '#7D7D7D', 
  },
  registerLink: {
    fontFamily: 'sf-rounded-regular',
    fontSize: 16,
    color: '#3797EF',
  }
});

export default LoginScreen;
