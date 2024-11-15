import {StyleSheet} from 'react-native';
import {BORDER_RADIUS, COLORS, FONT_SIZE, FONTS} from '@constants/globalStyles';

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.50)',
    marginBottom: 5,
  },
  input: {
    color: COLORS.textTitleText,
    paddingTop: 16,
    paddingBottom: 15,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: BORDER_RADIUS.normal,
    borderColor: COLORS.bgLightGray,
    borderWidth: 1,
    height: 48,
    fontFamily: FONTS.sansProRegular,
    fontSize: FONT_SIZE.normal,
  },
  textStyle: {
    fontFamily: FONTS.sansProRegular,
    fontWeight: '400',
    fontSize: 16,
  },
});

export default styles;
