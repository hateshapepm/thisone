import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// next
import NextLink from 'next/link';

// material-ui
import { alpha } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import ProfileTab from './ProfileTab';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

import useUser from 'hooks/useUser';
import { facebookColor, linkedInColor, twitterColor } from 'config';

// assets
import FacebookFilled from '@ant-design/icons/FacebookFilled';
import LinkedinFilled from '@ant-design/icons/LinkedinFilled';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import TwitterSquareFilled from '@ant-design/icons/TwitterSquareFilled';
import CameraOutlined from '@ant-design/icons/CameraOutlined';

// ==============================|| USER PROFILE - TAB CONTENT ||============================== //

export default function ProfileTabs({ focusInput }) {
  const user = useUser();
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(user ? user.thumb : '');

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              variant="light"
              color="secondary"
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <MoreOutlined />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem
                component={NextLink}
                href="/apps/profiles/user/personal"
                onClick={() => {
                  handleClose();
                  setTimeout(() => {
                    focusInput();
                  });
                }}
              >
                Edit
              </MenuItem>
              <MenuItem onClick={handleClose} disabled>
                Delete
              </MenuItem>
            </Menu>
          </Stack>
          <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
            <FormLabel
              htmlFor="change-avtar"
              sx={{
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                '&:hover .MuiBox-root': { opacity: 1 },
                cursor: 'pointer'
              }}
            >
              {user && <Avatar alt={user.name} src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />}
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bgcolor: alpha(theme.palette.secondary.dark, 0.75),
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'secondary.lighter'
                })}
              >
                <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                  <CameraOutlined style={{ fontSize: '2rem' }} />
                  <Typography>Upload</Typography>
                </Stack>
              </Box>
            </FormLabel>
            <TextField
              type="file"
              id="change-avtar"
              placeholder="Outlined"
              variant="outlined"
              sx={{ display: 'none' }}
              onChange={(e) => setSelectedImage(e.target.files?.[0])}
            />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">Stebin Ben</Typography>
              <Typography color="secondary">Full Stack Developer</Typography>
            </Stack>
            <Stack direction="row" sx={{ gap: 3, '& svg': { fontSize: '1.15rem', cursor: 'pointer' } }}>
              <TwitterSquareFilled style={{ color: twitterColor }} />
              <FacebookFilled style={{ color: facebookColor }} />
              <LinkedinFilled style={{ color: linkedInColor }} />
            </Stack>
          </Stack>
        </Grid>
        <Grid sx={{ display: { sm: 'block', md: 'none' } }} size={{ sm: 3 }} />
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-around' }}>
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">86</Typography>
              <Typography color="secondary">Post</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">40</Typography>
              <Typography color="secondary">Project</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">4.5K</Typography>
              <Typography color="secondary">Members</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid size={12}>
          <ProfileTab />
        </Grid>
      </Grid>
    </MainCard>
  );
}

ProfileTabs.propTypes = { focusInput: PropTypes.func };
