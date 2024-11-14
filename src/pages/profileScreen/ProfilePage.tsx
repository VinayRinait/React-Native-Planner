import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import {Toolbar} from '@components/toolbar';
import styles from './mapPage.styles';

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <Toolbar>
        <Text style={styles.title}>Profile</Text>
      </Toolbar>
    </View>
  );
};

export default ProfilePage;
