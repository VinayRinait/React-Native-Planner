import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import storage from '@react-native-firebase/storage';
import {showMessage} from 'react-native-flash-message';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Toolbar} from '@components/toolbar';
import {ArrowRight, TaskImage} from '@constants/icons-svg';
import styles from './taskPage.styles';
import Button from '@components/Button/Button';
import {
  taskPriorityColors,
  TaskPriorityTypes,
} from '@constants/TasksPriorityColor';
import {COLORS} from '@constants/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
import {selectUserInfo} from '@store/reducers/userSlice';
import TaskService from '@services/task.service';
import {Routes} from '@router/routes';
import {AppDispatch} from '@store/store';
import {addTaskAsync, editTaskAsync} from '@store/reducers/tasksReducer/thunks';
import {TabParamList} from '@router/router.types';
import {TaskModel} from '@models/task.model';
import {ScrollView} from 'react-native-gesture-handler';

type TaskPageRouterType = {
  params: {
    taskId: string;
  };
};

export const TaskPage = () => {
  const [imageUri, setImageUri] = useState<string>('');
  const [selectedType, setSelectedType] = useState<TaskPriorityTypes | null>(
    null,
  );
  const [taskName, setTaskName] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const userInfo = useSelector(selectUserInfo);
  const route = useRoute<RouteProp<TaskPageRouterType>>();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<TabParamList>>();

  const taskId = route?.params?.taskId;

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        if (taskId) {
          const task = await TaskService.getTaskById(taskId);

          if (task) {
            setImageUri(task.image_url || '');
            setTaskName(task.title || '');
            setSelectedType(task.type || null);
            setDueDate(task.due_date ? new Date(task.due_date) : null);
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };

    fetchTaskData();
  }, [taskId]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Preserve existing time when changing date
      const newDateTime = dueDate || new Date();
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setDueDate(newDateTime);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Preserve existing date when changing time
      const newDateTime = dueDate || new Date();
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDueDate(newDateTime);
    }
  };

  const handleTypePress = (type: TaskPriorityTypes) => {
    setSelectedType(type === selectedType ? null : type);
  };

  const openImagePicker = async () => {
    showMessage({
      message: `This feature under construction`,
      icon: 'auto',
      type: 'warning',
    });
    // const cameraPermissionStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    // if (cameraPermissionStatus === RESULTS.DENIED) {
    //   const permissionRequestResult = await request(
    //     PERMISSIONS.IOS.PHOTO_LIBRARY,
    //   );
    //   if (permissionRequestResult !== RESULTS.GRANTED) {
    //     showMessage({
    //       message: 'Camera permission denied. Please Try again',
    //       icon: 'auto',
    //       type: 'danger',
    //     });
    //     console.log('Camera permission denied.');
    //     return;
    //   }
    // }
    // const options = {
    //   mediaType: 'photo',
    //   quality: 0.1,
    // };
    // const result = await launchImageLibrary(options as ImageLibraryOptions);
    // if (result.errorCode) {
    //   console.log('Image picker cancelled:', result.errorMessage);
    // } else {
    //   if (result && result.assets) {
    //     await uploadImage(
    //       result.assets[0].uri as string,
    //       result.assets[0].fileName as string,
    //     );
    //   }
    // }
  };

  const uploadImage = async (uri: string, imageName: string) => {
    const reference = storage().ref(`images/${imageName}`);
    setImageLoading(true);
    try {
      await reference.putFile(uri);
      console.log('Image uploaded successfully!');

      const downloadURL = await reference.getDownloadURL();
      console.log('Image URL:', downloadURL);

      setImageUri(downloadURL);
    } catch (error) {
      showMessage({
        message: 'Error loading image',
        icon: 'auto',
        type: 'danger',
      });
      console.error('Error uploading image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const onSubmitTask = async () => {
    if (!taskName || !selectedType) return;

    setTaskLoading(true);

    try {
      const updatedTask: TaskModel = {
        image_url: imageUri,
        done: false,
        created_at: Date.now(),
        due_date: dueDate ? dueDate.getTime() : null,
        title: taskName,
        type: selectedType,
        user_id: userInfo?.id as string,
        completed_at: null,
      };

      if (taskId) {
        await dispatch(editTaskAsync({taskId, updatedTask}));
        // Update notification for edited task

        showMessage({
          message: `Task "${updatedTask.title}" successfully updated`,
          icon: 'auto',
          type: 'success',
        });
      } else {
        await dispatch(addTaskAsync(updatedTask));
      }

      navigation.navigate(Routes.TASKS_LIST);
    } catch (e) {
      console.error('Error in onSubmitTask:', e);
      showMessage({
        message: 'Failed to create task reminder',
        type: 'danger',
      });
    } finally {
      setTaskLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <Toolbar>
          <View style={styles.headerContainer}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({pressed}) => [
                {
                  backgroundColor: pressed ? COLORS.yellow : 'transparent',
                },
                styles.arrowBack,
              ]}>
              {({pressed}) => (
                <ArrowRight stroke={pressed ? COLORS.darkBlue : COLORS.white} />
              )}
            </Pressable>
            <Text style={styles.headerTitle}>Add new task</Text>
          </View>
        </Toolbar>

        <View style={styles.taskContainer}>
          <KeyboardAvoidingView style={{flex: 1}}>
            <View>
              <View style={styles.imageContainer}>
                {/* @TODO add loader for image  */}
                {imageUri ? (
                  <Image source={{uri: imageUri}} height={150} />
                ) : (
                  <TaskImage width={'100%'} height={150} />
                )}
              </View>
              <View style={styles.addPhotoContainer}>
                <Button
                  containerStyle={styles.addPhotoBtn}
                  onPress={openImagePicker}>
                  {imageLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primaryViolent}
                    />
                  ) : (
                    <Text style={styles.addPhotoText}>+ Add photo</Text>
                  )}
                </Button>
              </View>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: 'space-around',
                paddingBottom: 30,
              }}>
              <View style={styles.taskNameContainer}>
                <Text style={styles.taskNameTitle}>Task name</Text>
                <TextInput
                  inputMode="text"
                  style={styles.taskNameInput}
                  value={taskName}
                  onChangeText={text => {
                    setTaskName(text);
                  }}
                />
              </View>
              <View style={styles.typeContainer}>
                <Text style={styles.typeTitle}>Type</Text>
                <View style={styles.taskTypes}>
                  {Object.keys(taskPriorityColors).map((type, index) => {
                    const eventType = type as TaskPriorityTypes;
                    return (
                      <TouchableOpacity
                        style={styles.taskTypesItem}
                        key={index}
                        onPress={() => handleTypePress(eventType)}>
                        <View
                          style={[
                            styles.taskTypesMark,
                            {backgroundColor: taskPriorityColors[eventType]},
                          ]}
                        />
                        <Checkbox
                          color={
                            selectedType === eventType
                              ? COLORS.primaryViolent
                              : undefined
                          }
                          style={styles.taskTypesCheckbox}
                          value={selectedType === eventType}
                          onValueChange={() => handleTypePress(eventType)}
                        />
                        <Text style={styles.taskTypeName}> {type}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <View style={styles.taskNameContainer}>
                <Text style={styles.taskNameTitle}>Due Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.taskNameInput}>
                  <Text
                    style={[
                      styles.taskNameTitle,
                      {
                        marginBottom: 0,
                        color: dueDate ? COLORS.darkBlue : COLORS.textContent,
                      },
                    ]}>
                    {dueDate ? dueDate.toLocaleDateString() : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.taskNameTitle, {marginTop: 15}]}>
                  Due Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.taskNameInput}>
                  <Text
                    style={[
                      styles.taskNameTitle,
                      {
                        marginBottom: 0,
                        color: dueDate ? COLORS.darkBlue : COLORS.textContent,
                      },
                    ]}>
                    {dueDate
                      ? dueDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Select Time'}
                  </Text>
                </TouchableOpacity>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    onChange={onDateChange}
                  />
                )}

                {/* Time Picker */}
                {showTimePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="time"
                    onChange={onTimeChange}
                  />
                )}
              </View>

              <Button
                disabled={imageLoading || taskLoading}
                containerStyle={styles.taskSubmitBtn}
                onPress={onSubmitTask}>
                {taskLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primaryViolent}
                  />
                ) : (
                  <Text style={styles.taskSubmitBtnText}>Save</Text>
                )}
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </ScrollView>
  );
};
