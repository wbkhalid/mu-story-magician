import { Typography } from '@mui/material';
import { Box, Container } from '@mui/system';
import Checkout from 'src/components/paymentFrom';

export default function Page() {
  return (
  <Container maxWidth={false} sx={{ maxWidth:'1350px' }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h2" mb="1.5rem">
          Checkout Details
        </Typography>
      </Box>
      <Checkout />
    </Container>
  );
}
