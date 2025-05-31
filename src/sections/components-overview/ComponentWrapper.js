'use client';

// material-ui
import { styled } from '@mui/material/styles';

// ==============================|| COMPONENTS - CONTENT WRAPPER ||============================== //

const ComponentWrapper = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2)
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5)
  }
}));

export default ComponentWrapper;
