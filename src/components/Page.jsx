import PropTypes from 'prop-types';

// next
import Head from 'next/head';

// material-ui
import Box from '@mui/material/Box';

export default function Page({ children, title = '', meta, ref, ...other }) {
  return (
    <>
      <Head>
        <title>{`${title} | Mantis React Admin`}</title>
        {meta}
      </Head>

      <Box ref={ref} {...other}>
        {children}
      </Box>
    </>
  );
}

Page.propTypes = { children: PropTypes.node, title: PropTypes.string, meta: PropTypes.node, ref: PropTypes.any, other: PropTypes.any };
