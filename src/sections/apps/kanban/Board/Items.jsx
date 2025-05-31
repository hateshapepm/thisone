import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Draggable } from '@hello-pangea/dnd';

// project imports
import EditStory from '../Backlogs/EditStory';
import AlertItemDelete from './AlertItemDelete';
import IconButton from 'components/@extended/IconButton';

import { deleteItem, handlerKanbanDialog, useGetBacklogs } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';

// assets
import ClusterOutlined from '@ant-design/icons/ClusterOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';

// item drag wrapper
const getDragWrapper = (isDragging, draggableStyle, theme, radius) => {
  return {
    userSelect: 'none',
    margin: '0 0 8px 0',
    padding: 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    background: alpha(theme.palette.background.paper, isDragging ? 0.8 : 1),
    borderRadius: radius,
    ...draggableStyle
  };
};

// ==============================|| KANBAN BOARD - ITEMS ||============================== //

export default function Items({ item, index }) {
  const { backlogs } = useGetBacklogs();

  const backProfile = item && item.image && `/assets/images/profile/${item.image}`;
  const itemStory = backlogs?.userStory.filter((story) => story?.itemIds?.filter((itemId) => itemId === item.id)[0])[0];

  const handlerDetails = (id) => {
    handlerKanbanDialog(id);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [open, setOpen] = useState(false);
  const handleModalClose = (status) => {
    setOpen(false);
    if (status) {
      deleteItem(item.id);
      openSnackbar({
        open: true,
        message: 'Task Deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',

        alert: {
          color: 'success'
        }
      });
    }
  };

  const [openStoryDrawer, setOpenStoryDrawer] = useState(false);
  const handleStoryDrawerOpen = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  const editStory = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={(theme) => ({ ...getDragWrapper(snapshot.isDragging, provided.draggableProps.style, theme, `4px`) })}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: itemStory ? -0.75 : 0 }}>
            <Typography
              onClick={() => handlerDetails(item.id)}
              variant="subtitle1"
              sx={{
                display: 'inline-block',
                width: 'calc(100% - 34px)',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                verticalAlign: 'middle',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {item.title}
            </Typography>

            <IconButton size="small" color="secondary" onClick={handleClick} aria-controls="menu-comment" aria-haspopup="true">
              <MoreOutlined />
            </IconButton>
            <Menu
              id="menu-comment"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              variant="selectedMenu"
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
                onClick={() => {
                  handleClose();
                  handlerDetails(item.id);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  setOpen(true);
                }}
              >
                Delete
              </MenuItem>
            </Menu>
            <AlertItemDelete title={item.title} open={open} handleClose={handleModalClose} />
          </Stack>
          {itemStory && (
            <>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'flex-start' }}>
                <Tooltip title={itemStory.title}>
                  <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'flex-start', color: 'primary.dark' }}>
                    <ClusterOutlined style={{ fontSize: '0.75rem' }} />
                    <Link variant="caption" color="primary.dark" underline="hover" onClick={editStory} sx={{ cursor: 'pointer', pt: 0.5 }}>
                      User Story #{itemStory.id}
                    </Link>
                  </Stack>
                </Tooltip>
              </Stack>
              <EditStory story={itemStory} open={openStoryDrawer} handleDrawerOpen={handleStoryDrawerOpen} />
            </>
          )}
          {backProfile && (
            <CardMedia component="img" image={backProfile} sx={{ width: '100%', borderRadius: 1, mt: 1.5 }} title="Slider5 image" />
          )}
        </Box>
      )}
    </Draggable>
  );
}

Items.propTypes = { item: PropTypes.any, index: PropTypes.number };
