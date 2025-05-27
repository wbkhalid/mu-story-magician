'use client';

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

export const CustomFormField = ({
  formik,
  name,
  label,
  disabled = false,
  placeholder,
  maxWidth = 500,
  onChange,
  type = 'text',
  isPassword = false,
}) => {
  const password = useBoolean();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography>{label}</Typography>
      <TextField
        fullWidth
        name={name}
        type={password.value ? 'text' : type}
        value={formik.values[name]}
        onChange={onChange || formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={placeholder}
        error={formik.touched[name] && Boolean(formik.errors[name])}
        helperText={formik.touched[name] && formik.errors[name]}
        disabled={disabled}
        sx={{
          maxWidth: { xs: '100%', md: maxWidth },
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
        }}
        InputProps={{
          endAdornment: isPassword && (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

CustomFormField.propTypes = {
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    touched: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

export const CustomFormTextarea = ({ formik, name, label, placeholder }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Typography>{label}</Typography>
    <TextField
      multiline
      rows={4}
      fullWidth
      name={name}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder={placeholder}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      sx={{
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
      }}
    />
  </Box>
);

CustomFormTextarea.propTypes = {
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    touched: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};
