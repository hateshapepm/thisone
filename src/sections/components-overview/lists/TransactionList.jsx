// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| LIST - TRANSACTION ||============================== //

export default function TransactionList() {
  return (
    <MainCard content={false}>
      <List
        component="nav"
        sx={{
          px: 0,
          py: 0,
          '& .MuiListItemButton-root': { py: 1, px: 2, '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' } }
        }}
      >
        <ListItem
          component={ListItemButton}
          divider
          secondaryAction={
            <Stack sx={{ alignItems: 'flex-end' }}>
              <Typography variant="subtitle1" noWrap>
                + $1,430
              </Typography>
              <Typography variant="h6" color="secondary" noWrap>
                78%
              </Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar type="combined" color="success">
              <GiftOutlined />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1">Payment from #002434</Typography>} secondary="Today, 2:00 AM" />
        </ListItem>
        <ListItem
          component={ListItemButton}
          divider
          secondaryAction={
            <Stack sx={{ alignItems: 'flex-end' }}>
              <Typography variant="subtitle1" noWrap>
                + $302
              </Typography>
              <Typography variant="h6" color="secondary" noWrap>
                8%
              </Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar type="combined">
              <MessageOutlined />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1">Payment from #984947</Typography>} secondary="5 August, 1:45 PM" />
        </ListItem>
        <ListItem
          component={ListItemButton}
          secondaryAction={
            <Stack sx={{ alignItems: 'flex-end' }}>
              <Typography variant="subtitle1" noWrap>
                + $682
              </Typography>
              <Typography variant="h6" color="secondary" noWrap>
                16%
              </Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar type="combined" color="error">
              <SettingOutlined />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1">Payment from #988784</Typography>} secondary="7 hours ago" />
        </ListItem>
      </List>
    </MainCard>
  );
}
