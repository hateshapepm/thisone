'use client';

import React from 'react';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';

// third-party
import { enqueueSnackbar } from 'notistack';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| NOTISTACK - PREVENT DUPLICATE ||============================== //

export default function PreventDuplicate() {
  const [checked, setChecked] = React.useState(true);

  const handleChangeCheck = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <MainCard title="Prevent Duplicate">
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Checkbox checked={checked} onChange={handleChangeCheck} slotProps={{ input: { 'aria-label': 'controlled' } }} />
        Prevent duplicate
        <Button
          variant="outlined"
          fullWidth
          sx={{ marginBlockStart: 2 }}
          onClick={() =>
            enqueueSnackbar('You only see me once.', {
              preventDuplicate: checked ? true : false
            })
          }
        >
          Show snackbar
        </Button>
      </Stack>
    </MainCard>
  );
}
