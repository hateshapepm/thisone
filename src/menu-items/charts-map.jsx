// assets
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';

// type

// icons
const icons = { PieChartOutlined, EnvironmentOutlined };

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const chartsMap = {
  id: 'group-charts-map',
  title: 'charts-map',
  icon: icons.PieChartOutlined,
  type: 'group',
  children: [
    {
      id: 'react-chart',
      title: 'charts',
      type: 'collapse',
      icon: icons.PieChartOutlined,
      children: [
        {
          id: 'apexchart',
          title: 'apexchart',
          type: 'item',
          url: '/charts/apexchart'
        },
        {
          id: 'org-chart',
          title: 'org-chart',
          type: 'item',
          url: '/charts/org-chart'
        }
      ]
    },
    {
      id: 'map',
      title: 'map',
      type: 'item',
      url: '/map',
      icon: icons.EnvironmentOutlined
    }
  ]
};

export default chartsMap;
