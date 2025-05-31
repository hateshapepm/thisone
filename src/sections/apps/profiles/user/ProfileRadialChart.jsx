import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import ReactApexChart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'config';

// chart options
const redialBarChartOptions = {
  chart: {
    background: 'transparent'
  },
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 0,
        size: '75%'
      },
      track: {
        margin: 0
      },
      dataLabels: {
        name: {
          show: false
        },
        value: {
          offsetY: 5
        }
      }
    }
  },
  labels: ['Vimeo']
};

// ==============================|| TOP CARD - RADIAL BAR CHART ||============================== //

export default function ProfileRadialChart() {
  const theme = useTheme();
  const { mode } = useConfig();

  const [series] = useState([30]);
  const [options, setOptions] = useState(redialBarChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main],
      plotOptions: {
        radialBar: {
          track: {
            background: mode === ThemeMode.DARK ? theme.palette.grey[200] : theme.palette.grey[0]
          },
          dataLabels: {
            value: {
              fontSize: '1rem',
              fontWeight: 600,
              offsetY: 5,
              color: theme.palette.text.primary
            }
          }
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, theme]);

  return (
    <Box id="profile-radial-chart">
      <ReactApexChart options={options} series={series} type="radialBar" width={112} height={112} />
    </Box>
  );
}
