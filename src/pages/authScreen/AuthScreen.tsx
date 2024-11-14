import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {setUserInfo} from '@store/reducers/userSlice';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import useGoogleSignIn from '../../hooks/useGoogleSignIn';
import styles from './welcomeScreen.styles';
import Input from '@components/Input/Input';
import {appLogo} from '@constants/icons';
import Button from '@components/Button/Button';
import auth from '@react-native-firebase/auth';
import {COLORS} from '@constants/globalStyles';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [error, setError] = useState<string | false>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);

  const {
    signInWithGoogle,
    loading: googleSignInLoading,
    error: googleSignInError,
    userInfo,
  } = useGoogleSignIn();

  const dispatch = useDispatch();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string) => {
    return name.length >= 2;
  };

  const validateFields = (): boolean => {
    let isValid = true;

    if (!validateEmail(email)) {
      setEmailError('Invalid email address');
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    }

    if (isSignUp) {
      if (!validateName(firstName)) {
        setFirstNameError('First name must be at least 2 characters');
        isValid = false;
      }

      if (!validateName(lastName)) {
        setLastNameError('Last name must be at least 2 characters');
        isValid = false;
      }

      if (!validatePhone(phoneNumber)) {
        setPhoneNumberError('Please enter a valid phone number');
        isValid = false;
      }
    }

    return isValid;
  };

  useEffect(() => {
    if (userInfo) {
      dispatch(setUserInfo(userInfo.user));
    }
  }, [userInfo]);

  useEffect(() => {
    setError(googleSignInError);
  }, [googleSignInError]);

  const handleSignIn = async () => {
    try {
      if (!validateFields()) return;

      setLoading(true);
      const response = await auth().signInWithEmailAndPassword(email, password);

      const userData = {
        id: response.user.uid,
        email: String(response.user.email),
      };
      dispatch(setUserInfo(userData));
    } catch (e: any) {
      console.error('Login failed:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      if (!validateFields()) return;
      setLoading(true);
      const response = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      const userData = {
        id: response.user.uid,
        email: response.user.email as string,
        firstName,
        lastName,
        phoneNumber,
      };
      dispatch(setUserInfo(userData));
    } catch (e: any) {
      console.error('Registration failed:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image style={styles.logo} source={appLogo} />
        <Text style={styles.title}>Welcome</Text>

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        {isSignUp && (
          <>
            <Input
              label="First Name"
              value={firstName}
              onChangeText={text => {
                setFirstName(text);
                setFirstNameError(null);
              }}
            />
            {firstNameError && (
              <Text style={styles.errorText}>{firstNameError}</Text>
            )}

            <Input
              label="Last Name"
              value={lastName}
              onChangeText={text => {
                setLastName(text);
                setLastNameError(null);
              }}
            />
            {lastNameError && (
              <Text style={styles.errorText}>{lastNameError}</Text>
            )}

            <Input
              label="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={text => {
                setPhoneNumber(text);
                setPhoneNumberError(null);
              }}
            />
            {phoneNumberError && (
              <Text style={styles.errorText}>{phoneNumberError}</Text>
            )}
          </>
        )}

        <Input
          label="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setEmailError(null);
          }}
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <Input
          label="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={text => {
            setPassword(text);
            setPasswordError(null);
          }}
        />
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.authStatus}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : 'Create an Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonsContainer}>
          <Button
            onPress={isSignUp ? handleSignUp : handleSignIn}
            containerStyle={styles.logBtn}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primaryViolent} />
            ) : (
              <Text style={styles.logBtnText}>
                {isSignUp ? 'Sign Up' : 'Log In'}
              </Text>
            )}
          </Button>

          <Text style={styles.socialTitle}>Or Sign in Using</Text>
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={() => signInWithGoogle()}
            disabled={googleSignInLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default AuthScreen;
