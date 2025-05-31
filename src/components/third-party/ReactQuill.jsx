'use client';
import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';

// third-party
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// project imports
import { ThemeDirection } from 'config';

// ==============================|| QUILL EDITOR ||============================== //

export default function ReactQuillDemo({ value, editorMinHeight = 135, onChange }) {
  return (
    <Box
      sx={(theme) => ({
        '& .quill': {
          bgcolor: 'secondary.lighter',
          ...theme.applyStyles('dark', { bgcolor: 'secondary.main' }),
          borderRadius: '4px',
          '& .ql-toolbar': {
            bgcolor: 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: 'secondary.light' }),
            borderColor: 'divider',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          },
          '& .ql-container': {
            bgcolor: 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
            borderColor: `${theme.palette.divider} !important`,
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            '& .ql-editor': { minHeight: editorMinHeight }
          },
          ...(theme.direction === ThemeDirection.RTL && {
            '& .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg': {
              right: '0%',
              left: 'inherit'
            }
          })
        }
      })}
    >
      <ReactQuill {...(value && { value })} {...(onChange && { onChange })} />
    </Box>
  );
}

ReactQuillDemo.propTypes = { value: PropTypes.string, editorMinHeight: PropTypes.number, onChange: PropTypes.func };
