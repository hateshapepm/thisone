// material-ui
import Grid from '@mui/material/Grid';

// project imports
import LoginForms from 'sections/forms/validation/LoginForms';
import InstantFeedback from 'sections/forms/validation/InstantFeedback';
import RadioGroupForms from 'sections/forms/validation/RadioGroupForms';
import CheckboxForms from 'sections/forms/validation/CheckboxForms';
import SelectForms from 'sections/forms/validation/SelectForms';
import AutoCompleteForm from 'sections/forms/validation/AutoCompleteForm';

// ==============================|| FORMS VALIDATION - FORMIK ||============================== //

export default function FormsValidation() {
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <LoginForms />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <InstantFeedback />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RadioGroupForms />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CheckboxForms />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SelectForms />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AutoCompleteForm />
      </Grid>
    </Grid>
  );
}
