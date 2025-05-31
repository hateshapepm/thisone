// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// sx styles
const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| LIST - NOTIFICATION ||============================== //

export default function NotificationList() {
  return (
    <MainCard content={false}>
      <List
        component="nav"
        sx={{
          p: 0,
          '& .MuiListItemButton-root': {
            py: 0.5,
            px: 2,
            '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
            '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
          }
        }}
      >
        <ListItem
          component={ListItemButton}
          divider
          secondaryAction={
            <Typography variant="caption" noWrap>
              3:00 AM
            </Typography>
          }
        >
          <ListItemAvatar>
            <Avatar alt="Avatar" src="/assets/images/users/avatar-1.png" />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                It&apos;s{' '}
                <Typography component="span" variant="subtitle1">
                  Cristina danny&apos;s
                </Typography>{' '}
                birthday today.
              </Typography>
            }
            secondary="2 min ago"
          />
        </ListItem>
        <ListItem
          component={ListItemButton}
          divider
          selected
          secondaryAction={
            <Typography variant="caption" noWrap>
              6:00 AM
            </Typography>
          }
        >
          <ListItemAvatar>
            <Avatar alt="Avatar" src="/assets/images/users/avatar-2.png" />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                <Typography component="span" variant="subtitle1">
                  Aida Burg
                </Typography>{' '}
                commented your post.
              </Typography>
            }
            secondary="5 August"
          />
        </ListItem>
        <ListItem
          component={ListItemButton}
          divider
          secondaryAction={
            <Typography variant="caption" noWrap>
              2:45 PM
            </Typography>
          }
        >
          <ListItemAvatar>
            <Avatar alt="Avatar" src="/assets/images/users/avatar-3.png" />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                Your Profile is Complete &nbsp;
                <Typography component="span" variant="subtitle1">
                  60%
                </Typography>{' '}
              </Typography>
            }
            secondary="7 hours ago"
          />
        </ListItem>
        <ListItem
          component={ListItemButton}
          divider
          selected
          secondaryAction={
            <Typography variant="caption" noWrap>
              9:10 PM
            </Typography>
          }
        >
          <ListItemAvatar>
            <Avatar alt="Avatar" src="/assets/images/users/avatar-4.png" />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                <Typography component="span" variant="subtitle1">
                  Cristina Danny
                </Typography>{' '}
                invited to join{' '}
                <Typography component="span" variant="subtitle1">
                  Meeting.
                </Typography>
              </Typography>
            }
            secondary="Daily scrum meeting time"
          />
        </ListItem>
      </List>
    </MainCard>
  );
}
