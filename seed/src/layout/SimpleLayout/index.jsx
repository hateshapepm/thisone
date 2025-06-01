'use client';
import PropTypes from 'prop-types';

import { lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';

// project imports
import Loader from 'components/Loader';
import { SimpleLayoutType } from 'config';

const Header = lazy(() => import('./Header'));
const FooterBlock = lazy(() => import('./FooterBlock'));

// ==============================|| LAYOUT - SIMPLE / LANDING ||============================== //

export default function SimpleLayout({ children }) {
  const pathname = usePathname();
  const layout = pathname === 'landing' || pathname === '/' ? SimpleLayoutType.LANDING : SimpleLayoutType.SIMPLE;

  return (
    <Suspense fallback={<Loader />}>
      <Header />
      {children}
      <FooterBlock isFull={layout === SimpleLayoutType.LANDING} />
    </Suspense>
  );
}

SimpleLayout.propTypes = { children: PropTypes.node };
