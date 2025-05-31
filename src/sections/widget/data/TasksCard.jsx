// next
import NextLink from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import TwitterCircleFilled from '@ant-design/icons/TwitterCircleFilled';
import ClockCircleFilled from '@ant-design/icons/ClockCircleFilled';
import BugFilled from '@ant-design/icons/BugFilled';
import MobileFilled from '@ant-design/icons/MobileFilled';
import WarningFilled from '@ant-design/icons/WarningFilled';

// ==============================|| DATA WIDGET - TASKS CARD ||============================== //

export default function TasksCard() {
  return (
    <MainCard
      title="Tasks"
      content={false}
      secondary={
        <Link component={NextLink} href="#" color="primary">
          View all
        </Link>
      }
    >
      <CardContent>
        <Grid
          container
          spacing={2.75}
          alignItems="center"
          sx={{
            position: 'relative',
            '&>*': { position: 'relative', zIndex: '5' },
            '&:after': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: 16,
              width: '1px',
              height: '100%',
              bgcolor: 'divider',
              zIndex: '1'
            }
          }}
        >
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Avatar type="filled" color="success" size="sm" sx={{ top: 10 }}>
                  <TwitterCircleFilled />
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography variant="caption" color="secondary">
                      8:50
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">You’re getting more and more followers, keep it up!</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Avatar type="filled" color="primary" size="sm" sx={{ top: 10 }}>
                  <ClockCircleFilled />
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography variant="caption" color="secondary">
                      Sat, 5 Mar
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">Design mobile Application</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Avatar type="filled" color="error" size="sm" sx={{ top: 10 }}>
                  <BugFilled />
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography variant="caption" color="secondary">
                      Sun, 17 Feb
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">
                      <Link component={NextLink} href="#" underline="hover">
                        Jenny
                      </Link>{' '}
                      assign you a task{' '}
                      <Link component={NextLink} href="#" underline="hover">
                        Mockup Design
                      </Link>
                      .
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Avatar type="filled" color="warning" size="sm" sx={{ top: 10 }}>
                  <WarningFilled />
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography variant="caption" color="secondary">
                      Sat, 18 Mar
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">Design logo</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Avatar type="filled" color="success" size="sm" sx={{ top: 10 }}>
                  <MobileFilled />
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography variant="caption" color="secondary">
                      Sat, 22 Mar
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">Design mobile Application</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
