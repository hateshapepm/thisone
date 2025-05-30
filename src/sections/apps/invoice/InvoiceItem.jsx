import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { getIn } from 'formik';

// project imports
import InvoiceField from './InvoiceField';
import AlertProductDelete from './AlertProductDelete';

import { useGetInvoiceMaster } from 'api/invoice';
import { openSnackbar } from 'api/snackbar';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

// ==============================|| INVOICE - ITEMS ||============================== //

export default function InvoiceItem({
  id,
  name,
  description,
  qty,
  price,
  onDeleteItem,
  onEditItem,
  index,
  Blur,
  errors,
  touched,
  country
}) {
  const { invoiceMaster } = useGetInvoiceMaster();

  const [open, setOpen] = useState(false);
  const handleModalClose = (status) => {
    setOpen(false);
    if (status) {
      onDeleteItem(index);
      openSnackbar({
        open: true,
        message: 'Product deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',

        alert: {
          color: 'success'
        }
      });
    }
  };

  const Name = `invoice_detail[${index}].name`;
  const touchedName = getIn(touched, Name);
  const errorName = getIn(errors, Name);

  const textFieldItem = [
    {
      placeholder: 'Item name',
      label: 'Item Name',
      name: `invoice_detail.${index}.name`,
      type: 'text',
      id: id + '_name',
      value: name,
      errors: errorName,
      touched: touchedName
    },
    {
      placeholder: 'Description',
      label: 'Description',
      name: `invoice_detail.${index}.description`,
      type: 'text',
      id: id + '_description',
      value: description
    },
    { placeholder: '', label: 'Qty', type: 'number', name: `invoice_detail.${index}.qty`, id: id + '_qty', value: qty },
    { placeholder: '', label: 'price', type: 'number', name: `invoice_detail.${index}.price`, id: id + '_price', value: price }
  ];

  return (
    <>
      {textFieldItem.map((item) => {
        return (
          <InvoiceField
            onEditItem={(event) => onEditItem(event)}
            onBlur={(event) => Blur(event)}
            cellData={{
              placeholder: item.placeholder,
              name: item.name,
              type: item.type,
              id: item.id,
              value: item.value,
              errors: item.errors,
              touched: item.touched
            }}
            key={item.label}
          />
        );
      })}
      <TableCell>
        <Stack sx={{ gap: 2, alignItems: 'flex-end', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
          <Box sx={{ pl: 2 }}>
            {invoiceMaster === undefined ? (
              <Skeleton width={520} height={16} />
            ) : (
              <Typography>
                {country
                  ? `${country.prefix ?? ''} ${(price * qty).toFixed(2)}`
                  : `${invoiceMaster.country?.prefix ?? ''} ${(price * qty).toFixed(2)}`}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
      <TableCell align="center">
        <Tooltip title="Remove Item">
          <Button color="error" onClick={() => setOpen(true)}>
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </TableCell>
      <AlertProductDelete title={name} open={open} handleClose={handleModalClose} />
    </>
  );
}

InvoiceItem.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  qty: PropTypes.number,
  price: PropTypes.number,
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  index: PropTypes.number,
  Blur: PropTypes.func,
  errors: PropTypes.object,
  touched: PropTypes.object,
  country: PropTypes.any
};
