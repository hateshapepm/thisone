import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import UserAvatar from './UserAvatar';
import ChatMessageAction from './ChatMessageAction';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetUserChat } from 'api/chat';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';

// ==============================|| CHAT MESSAGE HISTORY ||============================== //

export default function ChatHistory({ user }) {
  const bottomRef = useRef(null);
  const { chat, chatLoading } = useGetUserChat(user.name);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat]);

  if (chatLoading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 410px)' }}>
        <CircularWithPath />
      </Stack>
    );
  }

  return (
    <SimpleBar sx={{ overflowX: 'hidden', height: 'calc(100vh - 410px)', minHeight: 420, '& .simplebar-content': { height: '100%' } }}>
      <Box sx={{ px: 3, py: 0.75, height: '100%' }}>
        <Grid container spacing={2.5}>
          {chat.map((history, index) => (
            <Grid key={index} size={12} sx={{ width: 1 }}>
              {history.from !== user.name ? (
                <Stack direction="row" sx={{ width: 1, gap: 1.25, justifyContent: 'flex-end' }}>
                  <Stack>
                    <Stack direction="row" sx={{ width: 1, gap: 0.25, justifyContent: 'flex-end' }}>
                      <ChatMessageAction index={index} />
                      <IconButton size="small" color="secondary">
                        <EditOutlined />
                      </IconButton>
                      <MainCard content={false} border={false} sx={{ ml: 0.75, p: 1, bgcolor: 'primary.main' }}>
                        <Typography variant="h6" sx={{ overflowWrap: 'anywhere', color: 'common.white' }}>
                          {history.text}
                        </Typography>
                      </MainCard>
                    </Stack>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'right' }}>
                      {history.time}
                    </Typography>
                  </Stack>
                  <UserAvatar user={{ online_status: 'available', avatar: 'avatar-1.png', name: 'User 1' }} />
                </Stack>
              ) : (
                <Stack direction="row" sx={{ width: 1, gap: 1.25 }}>
                  <UserAvatar user={{ online_status: user.online_status, avatar: user.avatar, name: user.name }} />
                  <Stack sx={{ gap: 0.25 }}>
                    <MainCard
                      content={false}
                      border={false}
                      sx={(theme) => ({ p: 1, ...theme.applyStyles('dark', { bgcolor: 'background.default' }) })}
                    >
                      <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                        {history.text}
                      </Typography>
                    </MainCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      {history.time}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Grid>
          ))}
          <Grid ref={bottomRef} />
        </Grid>
      </Box>
    </SimpleBar>
  );
}

ChatHistory.propTypes = { user: PropTypes.any };
