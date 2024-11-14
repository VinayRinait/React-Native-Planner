import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {PieChart, LineChart, BarChart} from 'react-native-chart-kit';
import {COLORS, FONTS, FONT_SIZE, BORDER_RADIUS} from '@constants/globalStyles';
import {TaskModel} from '@models/task.model';

const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundGradientFrom: COLORS.bgGray,
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(104, 113, 238, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 0,
};

interface TaskAnalyticsDashboardProps {
  tasks: TaskModel[];
  loading: boolean;
}

type TabType = 'overview' | 'trends' | 'distribution';

export const TaskAnalyticsDashboard: React.FC<TaskAnalyticsDashboardProps> = ({
  tasks,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const processedData = useMemo(() => {
    if (!tasks?.length) return null;

    // Process status data for pie chart
    const statusCount = tasks.reduce((acc, task) => {
      const status = task.done
        ? 'Completed'
        : task.due_date! < Date.now()
        ? 'Overdue'
        : 'Pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = {
      labels: Object.keys(statusCount),
      data: Object.values(statusCount),
    };

    // Process type data for pie chart
    const typeCount = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = {
      labels: Object.keys(typeCount),
      data: Object.values(typeCount),
    };

    // Process time series data for line and bar charts
    const timeSeriesData = tasks.reduce((acc, task) => {
      const date = new Date(task.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {completed: 0, pending: 0};
      }
      if (task.done) {
        acc[date].completed++;
      } else {
        acc[date].pending++;
      }
      return acc;
    }, {} as Record<string, {completed: number; pending: number}>);

    const dates = Object.keys(timeSeriesData);
    const completedData = dates.map(date => timeSeriesData[date].completed);
    const pendingData = dates.map(date => timeSeriesData[date].pending);

    const lineChartData = {
      labels: dates,
      datasets: [
        {
          data: completedData,
        },
        {
          data: pendingData,
        },
      ],
      legend: ['Completed', 'Pending'],
    };

    const barChartData = {
      labels: dates,
      datasets: [
        {
          data: completedData,
        },
      ],
    };

    return {
      statusData,
      typeData,
      lineChartData,
      barChartData,
    };
  }, [tasks]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryViolent} />
      </View>
    );
  }

  if (!processedData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No task data available</Text>
      </View>
    );
  }

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['overview', 'trends', 'distribution'] as TabType[]).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}>
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView style={styles.chartContainer}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Task Status Distribution</Text>
              <PieChart
                data={processedData.statusData.labels.map((label, index) => ({
                  name: label,
                  population: processedData.statusData.data[index],
                  color: `rgba(104, 113, 238, ${0.7 + index * 0.1})`,
                  legendFontColor: COLORS.textTitleText,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
              />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Task Type Distribution</Text>
              <PieChart
                data={processedData.typeData.labels.map((label, index) => ({
                  name: label,
                  population: processedData.typeData.data[index],
                  color: `rgba(104, 113, 238, ${0.7 + index * 0.1})`,
                  legendFontColor: COLORS.textTitleText,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
              />
            </View>
          </ScrollView>
        );

      case 'trends':
        return (
          <ScrollView style={styles.chartContainer}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Task Completion Trends</Text>
              <LineChart
                data={processedData.lineChartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
          </ScrollView>
        );

      case 'distribution':
        return (
          <ScrollView style={styles.chartContainer}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Task Distribution</Text>
              <BarChart
                data={processedData.barChartData}
                width={screenWidth - 32}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chart}
                verticalLabelRotation={30}
              />
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textTitleText,
    fontFamily: FONTS.sansProBold,
    fontSize: FONT_SIZE.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.normal,
    backgroundColor: COLORS.white,
  },
  activeTab: {
    backgroundColor: COLORS.primaryViolent,
  },
  tabText: {
    color: COLORS.textTitleText,
    fontFamily: FONTS.sansProBold,
    fontSize: FONT_SIZE.small,
  },
  activeTabText: {
    color: COLORS.white,
  },
  chartContainer: {
    flex: 1,
    padding: 16,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.normal,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    color: COLORS.textTitleText,
    fontFamily: FONTS.sansProBold,
    fontSize: FONT_SIZE.medium,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: BORDER_RADIUS.normal,
  },
});

export default TaskAnalyticsDashboard;
