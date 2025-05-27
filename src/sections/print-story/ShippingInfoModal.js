'use client';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { CustomFormField, CustomFormTextarea } from 'src/components/story-cards/customFormFields';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 12,
  p: 4,
  borderRadius: '1rem',
  width: '60%',
};
const ShippingInfoModal = ({ shippingModal }) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      message: '',
      from: '',
    },
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <Modal
      open={shippingModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography variant="h4" textAlign="center">
          Shipping information
        </Typography>

        <Box mb="1rem">
          <CustomFormField name="name" label="Name" formik={formik} isWidth={true} />
        </Box>
        <Box mb="1rem">
          <CustomFormTextarea name="address" label="Address" formik={formik} />
        </Box>

        <Button
          sx={{
            textTransform: 'none',
            borderRadius: 10,
            py: 2,
            maxWidth: { md: 150, xs: '100%' },
            mt: '2rem',
          }}
          variant="contained"
          disableRipple
          fullWidth
        >
         Next
        </Button>
      </Box>
    </Modal>
  );
};

export default ShippingInfoModal;
