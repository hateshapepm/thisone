'use client';

// next
import { usePathname } from 'next/navigation';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import InvoiceCard from 'sections/apps/invoice/InvoiceCard';
import InvoiceUserList from 'sections/apps/invoice/InvoiceUserList';
import InvoiceNotificationList from 'sections/apps/invoice/InvoiceNotificationList';
import InvoiceChartCard from 'sections/apps/invoice/InvoiceChartCard';
import InvoicePieChart from 'sections/apps/invoice/InvoicePieChart';

import { APP_DEFAULT_PATH } from 'config';

// ==============================|| INVOICE - DASHBOARD ||============================== //

export default function Dashboard() {
  const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'invoice-summary' }];
  const pathname = usePathname();

  return (
    <>
      {pathname === '/apps/invoice/dashboard' && <Breadcrumbs custom heading="my-dashboard" links={breadcrumbLinks} />}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <InvoiceChartCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <InvoiceCard />
        </Grid>
        <Grid size={{ sm: 6, md: 4, xs: 12 }}>
          <InvoiceUserList />
        </Grid>
        <Grid size={{ sm: 6, md: 4, xs: 12 }}>
          <InvoicePieChart />
        </Grid>
        <Grid size={{ sm: 12, md: 4, xs: 12 }}>
          <InvoiceNotificationList />
        </Grid>
      </Grid>
    </>
  );
}
