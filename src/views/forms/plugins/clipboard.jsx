'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// third-party
import copy from 'copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { openSnackbar } from 'api/snackbar';

// assets
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import ScissorOutlined from '@ant-design/icons/ScissorOutlined';

// ==============================|| PLUGIN - CLIPBOARD ||============================== //

export default function ClipboardPage() {
  const [text1, setText1] = useState('https://mantisdashboard.io/');
  const [text2, setText2] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  );
  const [text3] = useState(
    'Lorem ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis porris, paradis. Paisis, filhis, espiritis santis. Mé faiz elementum girarzis, nisi eros vermeio, in elementis mé pra quem é amistosis quis leo. Manduma pindureta quium dia nois paga.'
  );

  const handleCopy = (text, successMessage) => {
    copy(text);
    openSnackbar({
      open: true,
      message: successMessage,
      variant: 'alert',
      alert: { color: 'success' },
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      transition: 'SlideLeft'
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Copy from TextField">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Enter Website</InputLabel>
            <TextField
              fullWidth
              placeholder="Website"
              type="text"
              value={text1}
              onChange={(e) => {
                setText1(e.target.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy">
                        <IconButton
                          aria-label="Copy from another element"
                          color="secondary"
                          edge="end"
                          size="large"
                          onClick={() => handleCopy(text1, 'Text Copied')}
                        >
                          <CopyOutlined />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }
              }}
            />
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Copy from TextArea">
          <Stack sx={{ gap: 1, mb: 3 }}>
            <InputLabel>Enter Text to Copy</InputLabel>
            <TextField multiline rows={4} fullWidth placeholder="Copy text" onChange={(e) => setText2(e.target.value)} value={text2} />
          </Stack>
          <Button
            disabled={Boolean(!text2)}
            variant="contained"
            size="small"
            sx={{ mr: 1.5 }}
            onClick={() => handleCopy(text2, 'Text Copied')}
          >
            <CopyOutlined style={{ marginRight: 1 }} /> Copy
          </Button>
          <Button
            disabled={Boolean(!text2)}
            variant="contained"
            size="small"
            color="error"
            onClick={() => {
              setText2('');
              handleCopy(text2, 'Text Cut');
            }}
          >
            <ScissorOutlined style={{ marginRight: 1 }} /> Cut
          </Button>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard
          title="Copy from Container"
          secondary={
            <Tooltip title="Copy">
              <IconButton size="large" onClick={() => handleCopy(text3, 'Text Copied')}>
                <CopyOutlined />
              </IconButton>
            </Tooltip>
          }
        >
          <CardContent sx={{ p: 0, pb: 2.5 }}>{text3}</CardContent>
        </MainCard>
      </Grid>
    </Grid>
  );
}
