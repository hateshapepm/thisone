import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';
import Avatar from 'components/@extended/Avatar';

// ==============================|| KANBAN BACKLOGS - STORY COMMENT ||============================== //

export default function StoryComment({ comment, profile }) {
  return (
    <MainCard
      content={false}
      sx={(theme) => ({ bgcolor: 'grey.50', p: 1.5, mt: 1.25, ...theme.applyStyles('dark', { bgcolor: 'grey.100' }) })}
    >
      <Grid container spacing={1.5}>
        <Grid size={12}>
          <Grid container wrap="nowrap" alignItems="center" spacing={1}>
            <Grid>
              <Avatar
                sx={{ width: 24, height: 24 }}
                size="sm"
                alt="User 1"
                src={profile && profile.avatar && `/assets/images/users/${profile.avatar}`}
              />
            </Grid>
            <Grid size="grow">
              <Grid container alignItems="center" spacing={1} justifyContent="space-between">
                <Grid>
                  <Typography variant="subtitle1">{profile.name}</Typography>
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Dot size={6} sx={{ mt: -0.25 }} color="secondary" />
                    <Typography variant="caption" color="secondary">
                      {profile.time}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2">{comment?.comment}</Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}

StoryComment.propTypes = { comment: PropTypes.any, profile: PropTypes.any };
