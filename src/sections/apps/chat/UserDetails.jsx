import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AvatarStatus from './AvatarStatus';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import FileSyncOutlined from '@ant-design/icons/FileSyncOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import PictureOutlined from '@ant-design/icons/PictureOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import VideoCameraOutlined from '@ant-design/icons/VideoCameraOutlined';

// ==============================|| USER PROFILE / DETAILS ||============================== //

export default function UserDetails({ user, onClose }) {
  const [checked, setChecked] = useState(true);

  if (Object.keys(user).length === 0) return <Typography>...Loading</Typography>;

  return (
    <MainCard sx={{ bgcolor: 'background.paper', borderRadius: '0 4px 4px 0', borderLeft: 'none', height: 1 }} content={false}>
      <Box sx={{ p: 3 }}>
        {onClose && (
          <IconButton size="small" sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose} color="error">
            <CloseOutlined />
          </IconButton>
        )}
        <Grid container spacing={1} justifyContent="center">
          <Grid size={12}>
            <Stack>
              <Avatar
                alt={user.name}
                src={user.avatar && `/assets/images/users/${user.avatar}`}
                size="xl"
                sx={{
                  m: '8px auto',
                  width: 88,
                  height: 88,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  p: 1,
                  bgcolor: 'transparent',
                  '& .MuiAvatar-img ': { height: '88px', width: '88px', borderRadius: '50%' }
                }}
              />
              <Typography variant="h5" align="center">
                {user.name}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                {user.role}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack
              direction="row"
              sx={{ gap: 1, alignItems: 'center', justifyContent: 'center', mt: 0.75, '& .MuiChip-root': { height: '24px' } }}
            >
              <AvatarStatus status={user.online_status} />
              <Chip
                label={user?.online_status?.replaceAll('_', ' ')}
                sx={(theme) => {
                  let statusBGColor;
                  let statusColor;
                  if (user.online_status === 'available') {
                    statusBGColor = theme.palette.success.lighter;
                    statusColor = theme.palette.success.main;
                  } else if (user.online_status === 'do_not_disturb') {
                    statusBGColor = theme.palette.grey.A100;
                    statusColor = theme.palette.grey.A200;
                  } else {
                    statusBGColor = theme.palette.warning.lighter;
                    statusColor = theme.palette.warning.main;
                  }
                  return {
                    bgcolor: statusBGColor,
                    textTransform: 'capitalize',
                    color: statusColor,
                    '& .MuiChip-label': { px: 1 }
                  };
                }}
              />
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" sx={{ gap: 2, justifyContent: 'center', mt: 3 }}>
          <IconButton size="medium" color="secondary" sx={{ boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.05)' }}>
            <PhoneOutlined />
          </IconButton>
          <IconButton size="medium" color="secondary" sx={{ boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.05)' }}>
            <MessageOutlined />
          </IconButton>
          <IconButton size="medium" color="secondary" sx={{ boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.05)' }}>
            <VideoCameraOutlined />
          </IconButton>
        </Stack>
      </Box>
      <Box>
        <SimpleBar sx={{ overflowX: 'hidden', height: { xs: 'auto', md: 'calc(100vh - 397px)' }, minHeight: { xs: 0, md: 420 } }}>
          <Stack sx={{ gap: 3 }}>
            <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'center', px: 3 }}>
              <Box sx={{ bgcolor: 'primary.lighter', p: 2, width: '50%', borderRadius: 2 }}>
                <Typography color="primary">All File</Typography>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mt: 0.5, color: 'primary.main' }}>
                  <FolderOpenOutlined style={{ fontSize: '1.15em' }} />
                  <Typography variant="h4">231</Typography>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: 'secondary.lighter', p: 2, width: '50%', borderRadius: 2 }}>
                <Typography>All Link</Typography>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mt: 0.5 }}>
                  <LinkOutlined style={{ fontSize: '1.15em' }} />
                  <Typography variant="h4">231</Typography>
                </Stack>
              </Box>
            </Stack>
            <Box sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setChecked(!checked)}
                  >
                    <Typography variant="h5">Information</Typography>
                    <IconButton size="small" color="secondary">
                      <DownOutlined />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Collapse in={checked}>
                    <Stack sx={{ gap: 2, mt: 1, mb: 3 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography>Address</Typography>
                        <Typography color="text.secondary">{user.location}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography>Email</Typography>
                        <Typography color="text.secondary">{user.personal_email}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography>Phone</Typography>
                        <Typography color="text.secondary">{user.personal_phone}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography>Last visited</Typography>
                        <Typography color="text.secondary">{user.lastMessage}</Typography>
                      </Stack>
                    </Stack>
                  </Collapse>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5">Notification</Typography>
                    <Switch defaultChecked />
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5">File type</Typography>
                    <IconButton size="medium" color="secondary">
                      <MoreOutlined />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 2, mt: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ color: 'success.dark', bgcolor: 'success.light', borderRadius: 1 }}>
                          <FileDoneOutlined />
                        </Avatar>
                        <Stack>
                          <Typography>Document</Typography>
                          <Typography color="text.secondary">123 files, 193MB</Typography>
                        </Stack>
                      </Stack>
                      <IconButton size="small" color="secondary">
                        <RightOutlined />
                      </IconButton>
                    </Stack>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ color: 'warning.main', bgcolor: 'warning.lighter', borderRadius: 1 }}>
                          <PictureOutlined />
                        </Avatar>
                        <Stack>
                          <Typography>Photos</Typography>
                          <Typography color="text.secondary">53 files, 321MB</Typography>
                        </Stack>
                      </Stack>
                      <IconButton size="small" color="secondary">
                        <RightOutlined />
                      </IconButton>
                    </Stack>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter', borderRadius: 1 }}>
                          <FileSyncOutlined />
                        </Avatar>
                        <Stack>
                          <Typography>Other</Typography>
                          <Typography color="text.secondary">49 files, 193MB</Typography>
                        </Stack>
                      </Stack>
                      <IconButton size="small" color="secondary">
                        <RightOutlined />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </SimpleBar>
      </Box>
    </MainCard>
  );
}

UserDetails.propTypes = { user: PropTypes.any, onClose: PropTypes.func };
