import notifee, {
  EventType,
  AndroidImportance,
  AndroidVisibility,
  TimestampTrigger,
  TriggerType,
  Notification,
  AuthorizationStatus,
  AndroidStyle,
} from '@notifee/react-native';
import {Platform, AppState} from 'react-native';

// Register background handler at the top level of your app
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('Background event received:', type, detail);
  return Promise.resolve();
});

export interface NotificationOptions {
  title: string;
  body: string;
  taskId?: string; // Added to track notifications for a specific task
}
const NOTIFICATION_INTERVALS = [20, 10, 5, 0];

class NotificationService {
  private defaultChannelId = 'high_priority_channel';
  private notificationMap: Map<string, string[]> = new Map();

  constructor() {
    this.initialize();
  }

  async initialize() {
    await this.setupChannels();
    await this.requestPermissions();

    notifee.onForegroundEvent(({type, detail}) => {
      this.handleForegroundEvent(type, detail);
    });
  }

  async setupChannels() {
    if (Platform.OS === 'android') {
      // Create a channel with high importance
      await notifee.createChannel({
        id: this.defaultChannelId,
        name: 'High Priority Channel',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        // Add these for better background delivery
        badge: true,
        bypassDnd: true,
      });
    }
  }

  async requestPermissions() {
    try {
      const settings = await notifee.requestPermission({
        alert: true,
        badge: true,
        sound: true,
        criticalAlert: true,
        provisional: true,
      });

      if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        console.log('User denied permissions');
      }

      if (Platform.OS === 'android') {
        // Check specific Android settings
        const androidSettings = await notifee.getNotificationSettings();
        console.log('Android notification settings:', androidSettings);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  async scheduleNotification(
    options: NotificationOptions,
    date: Date,
  ): Promise<string> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      alarmManager: true, // Use AlarmManager for more precise background notifications
    };

    const notification: Notification = {
      id: `notification-${Date.now()}`, // Unique ID for each notification
      title: options.title,
      body: options.body,
      android: {
        channelId: this.defaultChannelId,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        pressAction: {
          id: 'default',
        },
        autoCancel: true,
        lightUpScreen: true,
        showTimestamp: true,
        smallIcon: 'ic_launcher',
        style: {
          type: AndroidStyle.BIGTEXT,
          text: options.body,
        },
      },
      ios: {
        sound: 'default',
        critical: true,
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
        interruptionLevel: 'timeSensitive',
        threadId: 'task-notifications',
      },
    };

    try {
      const notificationId = await notifee.createTriggerNotification(
        notification,
        trigger,
      );
      console.log('Scheduled notification with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleTaskNotifications(
    options: NotificationOptions,
    dueDate: Date,
    taskId: string,
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const minutes of NOTIFICATION_INTERVALS) {
      const notificationTime = new Date(
        dueDate.getTime() - minutes * 60 * 1000,
      );

      // Skip if notification time is in the past
      if (notificationTime.getTime() <= Date.now()) {
        continue;
      }

      const notificationText =
        minutes === 0
          ? `Task "${options.title}" is due now!`
          : `Task "${options.title}" is due in ${minutes} minutes`;

      const notificationOptions: NotificationOptions = {
        title: minutes === 0 ? 'Task Due!' : 'Upcoming Task',
        body: notificationText,
        taskId,
      };

      try {
        const notificationId = await this.scheduleNotification(
          notificationOptions,
          notificationTime,
        );
        notificationIds.push(notificationId);
      } catch (error) {
        console.error(
          `Error scheduling ${minutes} minute notification:`,
          error,
        );
      }
    }

    // Store the notification IDs for this task
    this.notificationMap.set(taskId, notificationIds);
    return notificationIds;
  }

  async cancelTaskNotifications(taskId: string) {
    const notificationIds = this.notificationMap.get(taskId);
    if (notificationIds) {
      await Promise.all(
        notificationIds.map(id => this.cancelTaskNotifications(id)),
      );
      this.notificationMap.delete(taskId);
    }
  }

  async displayNotification(options: NotificationOptions): Promise<string> {
    try {
      const notification: Notification = {
        id: `notification-${Date.now()}`,
        title: options.title,
        body: options.body,
        android: {
          channelId: this.defaultChannelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          pressAction: {
            id: 'default',
          },
          autoCancel: true,
          lightUpScreen: true,
          showTimestamp: true,
          smallIcon: 'ic_launcher',
          style: {
            type: AndroidStyle.BIGTEXT,
            text: options.body,
          },
        },
        ios: {
          sound: 'default',
          critical: true,
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
          interruptionLevel: 'timeSensitive',
          threadId: 'task-notifications',
        },
      };

      return await notifee.displayNotification(notification);
    } catch (error) {
      console.error('Error displaying notification:', error);
      throw error;
    }
  }

  handleForegroundEvent(type: EventType, detail: any) {
    switch (type) {
      case EventType.PRESS:
        console.log('User pressed notification', detail.notification);
        break;
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        break;
      case EventType.DELIVERED:
        console.log('Notification delivered', detail.notification);
        break;
    }
  }

  async cancelNotification(notificationId: string) {
    await notifee.cancelNotification(notificationId);
  }

  async cancelAllNotifications() {
    await notifee.cancelAllNotifications();
  }
}

export default new NotificationService();
