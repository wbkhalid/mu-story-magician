import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Typography } from '@mui/material';

import PropTypes from 'prop-types';

export default function SelectTextField({
  label,
  name,
  formik,
  options,
  placeholder = 'Select a value',
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography>{label}</Typography>
      <TextField
        id="outlined-select-currency"
        select
        style={{ borderRadius: '40px' }}
        name={name}
        placeholder={placeholder}
        value={formik.values[name]}
        onChange={formik.handleChange}
        error={formik.touched[name] && Boolean(formik.errors[name])}
        helperText={formik.touched[name] && formik.errors[name]}
        sx={{
          maxWidth: { md: 500, xs: '100%' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#23A6F0',
              borderRadius: '40px',
            },
            '&:hover fieldset': {
              borderColor: '#23A6F0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#23A6F0',
            },
          },
          '& .MuiSelect-icon': {
            color: '#23A6F0',
          },
          '&.Mui-focused .MuiSelect-icon': {
            color: '#23A6F0',
          },
          '& .MuiSelect-select': {
            color: '#23A6F0',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ color: '#23A6F0' }}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

SelectTextField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  formik: PropTypes.object,
  options: PropTypes.array,
};
