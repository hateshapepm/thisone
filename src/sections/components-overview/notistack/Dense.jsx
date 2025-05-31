'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

// third-party
import { enqueueSnackbar } from 'notistack';

// project imports
import MainCard from 'components/MainCard';
import { handlerDense } from 'api/snackbar';

// ==============================|| NOTISTACK - DENSE ||============================== //

export default function Dense() {
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    handlerDense(event.target.checked);
  };

  return (
    <MainCard title="Dense">
      <Checkbox checked={checked} onChange={handleChange} slotProps={{ input: { 'aria-label': 'controlled' } }} />
      Dense margins
      <Button variant="outlined" fullWidth sx={{ marginBlockStart: 2 }} onClick={() => enqueueSnackbar('Your notification here')}>
        Show snackbar
      </Button>
    </MainCard>
  );
}
