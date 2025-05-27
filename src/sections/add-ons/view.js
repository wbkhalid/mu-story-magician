'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardActions, CardContent, CardMedia, Grid } from '@mui/material';
import { getAddOnsData } from 'src/apis/addOns';
import { useQuery } from 'react-query';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { loadStripe } from '@stripe/stripe-js';
import { usePayment } from 'src/context/paymentContext';

// export const addOnData = [
//   {
//     imgSrc: '/assets/images/contact/standard-ai-photos.png',

//     text3: 'High Quality Hardcover Book',
//   },
//   {
//     imgSrc: '/assets/images/contact/personalized-photos.png',
//     text1: 'Personalised stories - You be the Hero!',
//     text2: 'Dedication page',
//     text3: '',
//   },
// ];

export default function AddOns() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { setPaymentInfo } = usePayment();
  const { data: addOns } = useQuery('addOns', getAddOnsData);

  const { state } = useLocalStorage('user');
  const user = state;
  return (
    <Container maxWidth={false} sx={{ maxWidth: '1350px' }}>
      <Box
        sx={{
          mt: 5,
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h2"> Add-ons </Typography>
        <Typography
          variant="body"
          color="textSecondary"
          sx={{ textAlign: 'center', fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}
        >
          Lorem ipsum dolor sit amet consectetur adipiscing elit <br /> interdum ullamcorper sed
          pharetra sene.
        </Typography>
      </Box>
      <Box sx={{ p: { xs: 0, md: 8 } }}>
        <Grid container spacing={4}>
          {addOns &&
            addOns.map((data) => (
              <Grid item md={6} xs={12} style={{ display: 'flex' }} key={data.text2}>
                <Box
                  backgroundColor="#F9F9F9"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    width: '100%',
                  }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      width: '100%',
                      borderRadius: 0,
                    }}
                  >
                    <CardMedia component="img" alt={data?.name} height="350" image={data.image} />
                    <CardContent>
                      <Typography gutterBottom variant="h4" component="div">
                        {data?.description[0]}
                      </Typography>
                      <Typography gutterBottom variant="h4" component="div">
                        {data?.description[1]}
                      </Typography>
                    </CardContent>
                    {!user?.addOns?.some((addOn) => addOn?.name === data.name) && (
                      <CardActions sx={{ px: 3 }}>
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            borderRadius: 10,
                            py: 1.5,
                            maxWidth: { xs: '100%', md: 120 },
                          }}
                          onClick={() => {
                            setPaymentInfo({
                              name: data.name,
                              amount: data.price,
                              quantity: 1,
                              type: 'addsOn',
                            });
                            router.push(paths.dashboard.payment);
                          }}
                        >
                          Upgrade
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Box>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Container>
  );
}
