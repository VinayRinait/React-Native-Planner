import {useState, useEffect} from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

type AuthSuccess = {
  // @ts-ignore
  user: auth.UserCredential | null;
};

const useGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [userInfo, setUserInfo] = useState<AuthSuccess | false>(false);

  useEffect(() => {
    console.log('Configuring Google Signin');
    GoogleSignin.configure({
      webClientId:
        '227639546256-hfgohavt6bjosof89gulpquhlu152d27.apps.googleusercontent.com',
      offlineAccess: true,
    });
    console.log('Google sign-in configured');
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Google sign-in initiated');
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      console.log('Play services available');

      const userInfo = await GoogleSignin.signIn();
      console.log('User info from Google sign-in:', userInfo);

      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );
      console.log('Google credential created', googleCredential);

      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      console.log('Firebase sign-in successful:', userCredential);

      setUserInfo({
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
        },
      });
      console.log('User info set:', userCredential.user);
    } catch (error: any) {
      console.log('Sign-in error code handled:', error.code);
      console.error('Sign-in error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Google Sign-In Cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Google Sign-In In Progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services Not Available');
      } else {
        setError(`Sign-in error: ${error.message}`);
      }
    } finally {
      console.log('Sign-in process complete, loading state:', loading);
      setLoading(false);
    }
  };
  return {signInWithGoogle, loading, error, userInfo};
};

export default useGoogleSignIn;
