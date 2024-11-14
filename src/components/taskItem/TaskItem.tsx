import React, {useEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import Checkbox from 'expo-checkbox';
import {useNavigation} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import {useDispatch} from 'react-redux';

import {DeleteIcon, EditIcon, LocationIcon} from '@constants/icons-svg';
import {COLORS} from '@constants/globalStyles';
import {TaskModel} from '@models/task.model';
import {Routes} from '@router/routes';
import {
  deleteTaskByIdAsync,
  editTaskAsync,
} from '@store/reducers/tasksReducer/thunks';
import {AppDispatch} from '@store/store';
import styles from './taskItem.styles';
import {taskPriorityColors} from '@constants/TasksPriorityColor';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@router/router.types';
import notificationService, {
  NotificationOptions,
} from '@services/notification.service';

export interface TaskItemProps extends TaskModel {
  id: string;
}
const formatDueDate = (timestamp: number): string => {
  const dueDate = new Date(timestamp);
  return dueDate.toLocaleString();
};

export const TaskItem: React.FC<TaskItemProps> = task => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const isCompleted = task.done;

  const handleTaskDoneStatus = async () => {
    const completed_at = task.done ? null : Number(new Date().getTime());

    dispatch(
      editTaskAsync({
        taskId: task.id,
        updatedTask: {...task, done: !task.done, completed_at},
      }),
    );

    showMessage({
      message: `Done status of "${task.title}" changed`,
      icon: 'auto',
      type: 'success',
    });
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Delete task',
      'Do you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            dispatch(deleteTaskByIdAsync(task.id));
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleEditTask = () => {
    navigation.navigate('Screens', {
      screen: Routes.TASK,
      params: {taskId: task.id},
    });
  };

  // In TaskItem.tsx
  useEffect(() => {
    const scheduleNotifications = async () => {
      if (!task.due_date || task.done) {
        return;
      }

      const dueDate = new Date(task.due_date);

      // Cancel any existing notifications for this task
      await notificationService.cancelTaskNotifications(task.id);

      // Only schedule notifications if the due date is in the future
      if (dueDate.getTime() > Date.now()) {
        const options: NotificationOptions = {
          title: task.title,
          body: 'Vinni', // Will be set in scheduleTaskNotifications
          taskId: task.id,
        };

        try {
          const notificationIds =
            await notificationService.scheduleTaskNotifications(
              options,
              dueDate,
              task.id,
            );
          console.log('Scheduled notifications with IDs:', notificationIds);
        } catch (error) {
          console.error('Error scheduling notifications:', error);
        }
      }
    };

    scheduleNotifications();

    return () => {
      notificationService.cancelTaskNotifications(task.id);
    };
  }, [task.due_date, task.title, task.done, task.id]);

  return (
    <View style={styles.container}>
      <View style={styles.leftControls}>
        <View
          style={[
            styles.marker,
            {backgroundColor: taskPriorityColors[task.type]},
          ]}></View>
        <View style={styles.checkBoxContainer}>
          <Checkbox
            color={task.done ? COLORS.primaryViolent : undefined}
            style={styles.checkbox}
            value={task.done}
            onValueChange={handleTaskDoneStatus}
          />
        </View>
      </View>
      <View style={styles.itemInfoContainer}>
        <Text
          style={[
            styles.itemTitle,
            {textDecorationLine: isCompleted ? 'line-through' : 'none'},
          ]}>
          {task.title}
        </Text>

        <Text style={styles.location}>
          <LocationIcon style={{marginRight: 8}} />
          {formatDueDate(task.due_date!)}
        </Text>

        {!isCompleted && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => handleDeleteTask()}>
              <DeleteIcon fill={COLORS.primaryViolent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => handleEditTask()}>
              <EditIcon fill={COLORS.primaryViolent} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
