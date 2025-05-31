// next
import NextLink from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import TwitterOutlined from '@ant-design/icons/TwitterOutlined';
import ShoppingOutlined from '@ant-design/icons/ShoppingOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==========================|| DATA WIDGET - LATEST MESSAGES ||========================== //

export default function LatestMessages() {
  return (
    <MainCard
      title="Latest Messages"
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
          spacing={3}
          alignItems="center"
          sx={{
            position: 'relative',
            '&>*': {
              position: 'relative',
              zIndex: '5'
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: 88,
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
                <Grid container spacing={2} alignItems="center">
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      2 hrs ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="info">
                      <TwitterOutlined />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">+ 1652 Followers</Typography>
                    <Typography color="secondary" variant="caption">
                      You’re getting more and more followers, keep it up!
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Grid container spacing={2} alignItems="center">
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      4 hrs ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="error">
                      <ShoppingOutlined />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">+ 5 New Products were added!</Typography>
                    <Typography color="secondary" variant="caption">
                      Congratulations!
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Grid container spacing={2} alignItems="center">
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      1 day ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="success">
                      <CheckOutlined />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">Database backup completed!</Typography>
                    <Typography color="secondary" variant="caption">
                      Download the{' '}
                      <Link component={NextLink} href="#" underline="hover">
                        latest backup
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
                <Grid container spacing={2} alignItems="center">
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      2 day ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="primary">
                      <UserOutlined />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">+2 Friend Requests</Typography>
                    <Typography color="secondary" variant="caption">
                      This is great, keep it up!
                    </Typography>
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
