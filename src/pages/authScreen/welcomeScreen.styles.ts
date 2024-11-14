import {StyleSheet} from 'react-native';
import {COLORS, FONT_SIZE, FONTS} from '@constants/globalStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryViolent,
    paddingHorizontal: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xxLarge,
    fontFamily: FONTS.sansProBold,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 20, // Add consistent bottom margin
  },
  logo: {
    width: 140,
    height: 70,
    marginTop: 32,
    marginBottom: 20, // Add consistent bottom margin
    alignSelf: 'center',
  },
  inputContainer: {
    gap: 16, // Add consistent spacing between inputs
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: 24, // Add consistent top margin
    paddingBottom: 15,
  },
  errorMessage: {
    color: COLORS.errorTextColor,
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.sansProBold,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 16,
  },
  logBtn: {
    height: 56,
    width: '100%',
  },
  logBtnText: {
    fontFamily: FONTS.sansProBold,
    fontWeight: '600',
    color: COLORS.textTitleText,
    fontSize: FONT_SIZE.large,
  },
  authStatus: {
    marginTop: 15,
    marginBottom: 24,
    color: 'rgba(255, 255, 255, 0.50)',
    fontSize: FONT_SIZE.medium,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  socialTitle: {
    fontFamily: FONTS.sansProBold,
    fontWeight: '600',
    color: COLORS.bgGray,
    fontSize: FONT_SIZE.normal,
    marginBottom: 8,
  },
  errorText: {
    marginTop: 4,
    fontFamily: FONTS.sansProRegular,
    color: COLORS.errorTextColor,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
