// next
import NextLink from 'next/link';

// material-ui
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import MessageFilled from '@ant-design/icons/MessageFilled';
import ShoppingFilled from '@ant-design/icons/ShoppingFilled';
import FileTextFilled from '@ant-design/icons/FileTextFilled';

// ==============================|| DATA WIDGET - FEEDS ||============================== //

export default function FeedsCard() {
  return (
    <MainCard
      title="Feeds"
      content={false}
      secondary={
        <Link component={NextLink} href="#" color="primary">
          View all
        </Link>
      }
    >
      <CardContent>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="primary" type="filled" size="sm">
                    <MessageFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">You have 3 pending tasks.</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      just now
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="error" type="filled" size="sm">
                    <ShoppingFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">New order received</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      1 day ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="success" type="filled" size="sm">
                    <FileTextFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">You have 3 pending tasks.</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      3 week ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="primary" type="filled" size="sm">
                    <MessageFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">New order received</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      around month
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="warning" type="filled" size="sm">
                    <ShoppingFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">Order cancelled</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      2 month ago
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
