'use client';

import { useEffect, useState } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import { PopupTransition } from 'components/@extended/Transitions';

import ChatHeader from 'sections/apps/chat/ChatHeader';
import ChatDrawer from 'sections/apps/chat/ChatDrawer';
import ChatHistory from 'sections/apps/chat/ChatHistory';
import UserDetails from 'sections/apps/chat/UserDetails';
import ChatMessageSend from 'sections/apps/chat/ChatMessageSend';

import { useGetUsers } from 'api/chat';

const drawerWidth = 320;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.shorter
        }),
        marginLeft: 0
      }
    }
  ]
}));

// ==============================|| APPLICATION - CHAT ||============================== //

export default function Chat() {
  const { usersLoading, users } = useGetUsers();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [emailDetails, setEmailDetails] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    if (!usersLoading) {
      const newUser = users.filter((item) => item.id?.toString() === '2')[0];
      setUser(newUser);
    }
  }, [users, usersLoading]);

  const handleUserChange = () => {
    setEmailDetails((prev) => !prev);
  };

  const [openChatDrawer, setOpenChatDrawer] = useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!downLG);
  }, [downLG]);

  return (
    <Stack direction="row">
      <ChatDrawer
        openChatDrawer={openChatDrawer}
        handleDrawerOpen={handleDrawerOpen}
        setUser={setUser}
        selectedUser={usersLoading || Object.keys(user).length === 0 ? null : user.id}
      />
      <Main open={openChatDrawer} sx={{ minWidth: 0 }}>
        <Grid container>
          <Grid
            sx={(theme) => ({
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.shorter + 200
              })
            })}
            size={{ xs: 12, ...(emailDetails && { md: 8, xl: 9 }) }}
          >
            <MainCard
              content={false}
              sx={(theme) => ({
                bgcolor: 'grey.50',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.shorter + 200
                }),
                ...theme.applyStyles('dark', { bgcolor: 'dark.main' }),
                borderRadius: 1,
                ...(emailDetails &&
                  !openChatDrawer && {
                    borderRadius: '4px 0 0 4px'
                  }),
                ...(!emailDetails &&
                  openChatDrawer && {
                    borderRadius: '0 4px 4px 0'
                  }),
                ...(emailDetails &&
                  openChatDrawer && {
                    borderRadius: 0
                  }),
                [theme.breakpoints.down('md')]: {
                  borderRadius: 1
                }
              })}
            >
              <Grid container spacing={3}>
                <Grid sx={{ bgcolor: 'background.paper', p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }} size={12}>
                  <ChatHeader {...{ loading: usersLoading, user, openChatDrawer, emailDetails, handleDrawerOpen, handleUserChange }} />
                </Grid>
                <Grid size={12} sx={{ my: -0.75 }}>
                  <ChatHistory user={user} />
                </Grid>
                <Grid sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderTopColor: 'divider' }} size={12}>
                  <ChatMessageSend {...{ user }} />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid sx={{ overflow: 'hidden', display: emailDetails ? 'flex' : 'none' }} size={{ xs: 12, md: 4, xl: 3 }}>
            <Collapse orientation="horizontal" in={emailDetails && !downMD} sx={{ '.MuiCollapse-wrapper': { display: 'unset ' } }}>
              <UserDetails user={user} onClose={handleUserChange} />
            </Collapse>
          </Grid>

          <Dialog slots={{ transition: PopupTransition }} onClose={handleUserChange} open={downMD && emailDetails} scroll="body">
            <UserDetails user={user} onClose={handleUserChange} />
          </Dialog>
        </Grid>
      </Main>
    </Stack>
  );
}
