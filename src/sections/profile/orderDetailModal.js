import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { statusConfig } from './view';
import moment from 'moment';

export const OrderDetailModal = ({ open, handleClose, selectedOrder }) => {
  const { color, label } = statusConfig[selectedOrder?.status] || {
    color: 'default',
    label: selectedOrder?.status,
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          backgroundImage: 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          py: 2,
          letterSpacing: 1,
        }}
      >
        Order Details
      </DialogTitle>
      <DialogContent dividers sx={{ padding: 4, backgroundColor: '#f5f5f5' }}>
        {selectedOrder && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">Order Name: {selectedOrder?.name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <span style={{ marginRight: 5 }}>Status:</span>
                <Chip
                  color={color}
                  label={label}
                  variant="outlined"
                  sx={{ mr: 1, borderRadius: 10 }}
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <span style={{ marginRight: 5 }}>Order Date:</span>{' '}
                {moment(selectedOrder?.updatedAt).format('LL')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <span style={{ marginRight: 5 }}>Delivery Date:</span> {selectedOrder?.deliveryDate}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <span style={{ marginRight: 5 }}>Item Type:</span> {selectedOrder?.itemType}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                {' '}
                <span style={{ marginRight: 5 }}>Quantity:</span> {selectedOrder?.quantity}
              </Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          size="lg"
          sx={{
            textTransform: 'none',
            borderRadius: 10,
            background: 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
          }}
          onClick={handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
