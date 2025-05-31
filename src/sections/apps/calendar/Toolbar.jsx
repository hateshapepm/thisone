import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { format } from 'date-fns';

// project imports
import IconButton from 'components/@extended/IconButton';

// assets
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import LayoutOutlined from '@ant-design/icons/LayoutOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import OrderedListOutlined from '@ant-design/icons/OrderedListOutlined';
import PicCenterOutlined from '@ant-design/icons/PicCenterOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

// constant
const viewOptions = [
  {
    label: 'Month',
    value: 'dayGridMonth',
    icon: AppstoreOutlined
  },
  {
    label: 'Week',
    value: 'timeGridWeek',
    icon: LayoutOutlined
  },
  {
    label: 'Day',
    value: 'timeGridDay',
    icon: PicCenterOutlined
  },
  {
    label: 'Agenda',
    value: 'listWeek',
    icon: OrderedListOutlined
  }
];

// ==============================|| CALENDAR - TOOLBAR ||============================== //

export default function Toolbar({ date, view, onClickNext, onClickPrev, onClickToday, onChangeView }) {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [viewFilter, setViewFilter] = useState(viewOptions);

  useEffect(() => {
    if (downSM) {
      const filter = viewOptions.filter((item) => item.value !== 'dayGridMonth' && item.value !== 'timeGridWeek');
      setViewFilter(filter);
    } else {
      setViewFilter(viewOptions);
    }
  }, [downSM]);

  return (
    <Stack direction="row" sx={{ gap: downSM ? 1 : 3, alignItems: 'center', justifyContent: 'space-between', pb: 3 }}>
      <Button variant="outlined" onClick={onClickToday} size={downSM ? 'small' : 'medium'}>
        Today
      </Button>
      <Stack direction="row" sx={{ gap: downSM ? 0.5 : 3, alignItems: 'center' }}>
        <IconButton onClick={onClickPrev} size={downSM ? 'small' : 'large'}>
          <LeftOutlined />
        </IconButton>
        <Typography variant={downSM ? 'h5' : 'h3'} color="text.primary">
          {format(date, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={onClickNext} size={downSM ? 'small' : 'large'}>
          <RightOutlined />
        </IconButton>
      </Stack>
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        {viewFilter.map((viewOption) => {
          const Icon = viewOption.icon;
          return (
            <Tooltip title={viewOption.label} key={viewOption.value}>
              <Button
                disableElevation
                size={downSM ? 'small' : 'medium'}
                variant={viewOption.value === view ? 'contained' : 'outlined'}
                onClick={() => onChangeView(viewOption.value)}
              >
                <Icon style={{ fontSize: '1.3rem' }} />
              </Button>
            </Tooltip>
          );
        })}
      </ButtonGroup>
    </Stack>
  );
}

Toolbar.propTypes = {
  date: PropTypes.oneOfType([PropTypes.any, PropTypes.number]),
  view: PropTypes.string,
  onClickNext: PropTypes.func,
  onClickPrev: PropTypes.func,
  onClickToday: PropTypes.func,
  onChangeView: PropTypes.func
};
