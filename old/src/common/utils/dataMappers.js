import PropTypes from 'prop-types';

export function mapDeeperAlerts(apiData) {
  return (apiData || []).map(item => ({
    ...item,
    // Add/transform fields as needed for the table
  }));
}

mapDeeperAlerts.propTypes = {
  apiData: PropTypes.arrayOf(PropTypes.object)
};

export function mapSLSAlerts(apiData) {
  return (apiData || []).map(item => ({
    ...item,
    // Add/transform fields as needed for the table
  }));
}

mapSLSAlerts.propTypes = {
  apiData: PropTypes.arrayOf(PropTypes.object)
}; 