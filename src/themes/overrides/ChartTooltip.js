// ==============================|| OVERRIDES - CHART TOOLTIP ||============================== //

export default function ChartTooltip(theme) {
  return {
    MuiChartsTooltip: {
      styleOverrides: {
        container: {
          overflow: 'hidden'
        },
        table: {
          '& caption': {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.default
          }
        }
      }
    }
  };
}
