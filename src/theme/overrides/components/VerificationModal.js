import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const VerificationModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm">
      <DialogTitle>Verify Your Email</DialogTitle>
      <DialogContent>
        <DialogContentText>
          A verification email has been sent to your email address. Please check your inbox and
          follow the instructions to verify your email.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="outlined"
          fullWidth
          sx={{ textTransform: 'none', borderRadius: 10, py: 2, maxWidth: { md: 150, xs: '100%' } }}
          onClick={onClose}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationModal;
