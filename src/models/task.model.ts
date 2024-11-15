import {LocationType} from '../types/taskTypes';
import {TaskPriorityTypes} from '@constants/TasksPriorityColor';

export interface TaskModel {
  created_at: number;
  completed_at: number | null;
  due_date: number | null;
  image_url: string;
  title: string;
  done: boolean;
  type: TaskPriorityTypes;
  user_id: string;
  id?: string;
}
