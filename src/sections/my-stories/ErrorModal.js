import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useRouter } from 'next/navigation';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 12,
  p: { xs: 2, md: 4 },
  borderRadius: '1rem',
  width: {
    xs: '90%',
    md: 'auto',
  },
};

export default function ErrorModal({ open, setProcessingErrorModal, message }) {
  const handleClose = () => {
    setProcessingErrorModal(false);
  };
  const router = useRouter();
  return (
    <Modal
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography variant="h5">{message}</Typography>
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
          onClick={() => {
            router.push('/dashboard/my-stories/new/');
            handleClose();
          }}
        >
          Try Again
        </Button>
      </Box>
    </Modal>
  );
}
