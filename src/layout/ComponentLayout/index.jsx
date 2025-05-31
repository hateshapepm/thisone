'use client';
import PropTypes from 'prop-types';

import { lazy, Suspense } from 'react';

// material-ui
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

// project imports
import Loader from 'components/Loader';
import ComponentLayoutPage from './ComponentLayout';
import { useGetMenuMaster } from 'api/menu';

const Header = lazy(() => import('./Header'));

// ==============================|| COMPONENTS LAYOUT ||============================== //

export default function ComponentLayout({ children }) {
  const { menuMasterLoading } = useGetMenuMaster();
  if (menuMasterLoading) return <Loader />;

  return (
    <Suspense fallback={<Loader />}>
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
        <Header />
        <Toolbar sx={{ my: 2 }} />
        <ComponentLayoutPage>{children}</ComponentLayoutPage>
      </Container>
    </Suspense>
  );
}

ComponentLayout.propTypes = { children: PropTypes.node };
