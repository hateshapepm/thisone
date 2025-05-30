import PropTypes from 'prop-types';
// material-ui
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// project imports
import Avatar from 'components/@extended/Avatar';

// assets
import CheckOutlined from '@ant-design/icons/CheckOutlined';

// ==============================|| CALENDAR - COLOR PALETTE ||============================== //

export default function ColorPalette({ color, value }) {
  return (
    <Tooltip title={color}>
      <FormControlLabel
        value={value}
        label=""
        control={
          <Radio
            disableRipple
            icon={
              <Avatar variant="rounded" type="combined" size="xs" sx={{ bgcolor: color, borderColor: 'divider' }}>
                <Box sx={{ display: 'none' }} />
              </Avatar>
            }
            checkedIcon={
              <Avatar variant="rounded" type="combined" size="xs" sx={{ bgcolor: color, color: '#000', borderColor: 'divider' }}>
                <CheckOutlined />
              </Avatar>
            }
            sx={{
              '&:hover': {
                bgcolor: 'transparent'
              }
            }}
          />
        }
      />
    </Tooltip>
  );
}

ColorPalette.propTypes = { color: PropTypes.string, value: PropTypes.string };
