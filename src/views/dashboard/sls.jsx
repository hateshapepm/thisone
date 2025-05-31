// material-ui
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';

// assets
import IncomeOverviewCard from 'sections/dashboard/analytics/IncomeOverviewCard';
import SaleReportCard from 'sections/dashboard/analytics/SaleReportCard';

// ==============================|| DASHBOARD - ANALYTICS ||============================== //

export default function DashboardAnalytics() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* row 1 */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
      </Grid>

    </Grid>
  );
}
