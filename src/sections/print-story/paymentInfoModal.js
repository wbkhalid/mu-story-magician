import React from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Divider,
} from '@mui/material';
import { usePayment } from 'src/context/paymentContext';
import { useRouter } from 'next/navigation';
import { paths } from 'src/routes/paths';

const PaymentInfoModal = ({ printJobCost, open, handleClose }) => {
  const { setPaymentInfo } = usePayment();
  const router = useRouter();

  return (
    <Dialog open={open} fullWidth maxWidth={'sm'}>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Payment Detail
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="h6" gutterBottom>
            Cost Breakdown
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="subtitle1">Per item cost:</Typography>
            <Typography variant="body1" color="text.secondary">
              {printJobCost?.line_item_costs[0]?.unit_tier_cost}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="subtitle1">Number of items:</Typography>
            <Typography variant="body1" color="text.secondary">
              {printJobCost?.line_item_costs[0]?.quantity}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="subtitle1">Total item cost:</Typography>
            <Typography variant="body1" color="text.secondary">
              {printJobCost?.line_item_costs[0]?.total_cost_incl_tax}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Costs
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="subtitle1">Shipping cost:</Typography>
            <Typography variant="body1" color="text.secondary">
              {printJobCost?.shipping_cost?.total_cost_incl_tax}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="subtitle1">Fulfillment cost:</Typography>
            <Typography variant="body1" color="text.secondary">
              {printJobCost?.fulfillment_cost?.total_cost_incl_tax}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="h6">Total cost incl tax:</Typography>
            <Typography variant="body1" color="text.secondary" fontWeight="bold">
              {printJobCost?.total_cost_incl_tax}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="flex-end" mt={4} gap={1}>
          <Button
            variant="contained"
            onClick={() => {
              setPaymentInfo({
                amount: printJobCost?.total_cost_incl_tax,
                name: 'Print a hard cover Book',
                type: 'printBook',
                quantity: printJobCost?.line_item_costs[0]?.quantity,
              });
              router.push(paths.dashboard.payment);
            }}
            sx={{ textTransform: 'none' }}
          >
            Proceed to checkout
          </Button>
          <Button
            variant="outlined"
            disableRipple
            onClick={handleClose}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentInfoModal;
