'use client';

// next
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';

// material-ui
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthForgotPassword from 'sections/auth/auth-forms/AuthForgotPassword';

// ================================|| FORGOT PASSWORD ||================================ //

export default function ForgotPassword() {
  const { data: session } = useSession();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Forgot Password</Typography>
            <NextLink href={session ? '/pages/login' : '/login'}>
              <Link variant="body1" color="primary">
                Back to Login
              </Link>
            </NextLink>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthForgotPassword />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
