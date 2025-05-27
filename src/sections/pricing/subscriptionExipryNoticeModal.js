import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const SubscriptionExpiryModal = ({ open, onClose }) => {
  const router = useRouter();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Subscription Expired</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Your subscription has expired. Please upgrade your plan to continue accessing our
          services.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          onClick={() => {
            router.push('/dashboard/pricing/');
          }}
          color="primary"
        >
          Upgrade Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionExpiryModal;
