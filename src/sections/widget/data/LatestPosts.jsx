// next
import NextLink from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

// project imports
import MainCard from 'components/MainCard';

// assets
const Dashboard1 = '/assets/images/widget/dashborad-1.jpg';
const Dashboard2 = '/assets/images/widget/dashborad-3.jpg';

const mediaSX = {
  width: 90,
  height: 80,
  borderRadius: 1
};

// ===========================|| DATA WIDGET - LATEST POSTS ||=========================== //

export default function LatestPosts() {
  return (
    <MainCard
      title="Latest Posts"
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
            <Grid container alignItems="center" spacing={2}>
              <Grid>
                <CardMedia component="img" image={Dashboard1} title="image" sx={mediaSX} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">Up unpacked friendly</Typography>
                    <Typography variant="caption" color="secondary">
                      Video | 14 minutes ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid>
                <CardMedia component="iframe" src="https://www.youtube.com/embed/668nUCeBHyY" title="image" sx={mediaSX} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">Up unpacked friendly</Typography>
                    <Typography variant="caption" color="secondary">
                      Video | 14 minutes ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid>
                <CardMedia component="img" image={Dashboard2} title="image" sx={mediaSX} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">Up unpacked friendly</Typography>
                    <Typography variant="caption" color="secondary">
                      Video | 14 minutes ago
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
