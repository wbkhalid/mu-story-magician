'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useSettingsContext } from 'src/components/settings';
import { Card, CardContent, CardMedia, Grid } from '@mui/material';
import PackageCard from './PackageCard';
import { useQuery } from 'react-query';
import { getAddOnsData } from 'src/apis/addOns';

export default function Pricing({ packages }) {
  const settings = useSettingsContext();

  const { data: addOns } = useQuery('addOns', getAddOnsData);
  return (
    <Container
      maxWidth={false}
      sx={{ maxWidth: '1350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="h2" mb={1}>
        Pricing
      </Typography>
      <Typography
        variant="body"
        color="textSecondary"
        sx={{ textAlign: 'center', fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}
      >
        Pricing page: Unlock a World of Magical Stories <br /> Affordable, High-Quality, and
        Tailored Just for You!
      </Typography>
      <Grid container spacing={2} mt="2rem">
        {packages?.map((pkg, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pkg?._id}>
            <PackageCard {...pkg} />
          </Grid>
        ))}

        <Grid item xs={12} mt="4rem">
          <Typography variant="h2" mb={3} textAlign="center">
            Add-ons
          </Typography>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="center">
        <Grid container width="80%" gap={2}>
          {addOns?.map((addOn, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={5.8}
              key={index}
              style={{ display: 'flex' }}
              backgroundColor="#F9F9F9"
              padding={2}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
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
                  <CardMedia component="img" alt="personalized" image={addOn.image} />
                  <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                      {addOn?.description[0]}
                    </Typography>
                    <Typography gutterBottom variant="h4" component="div">
                      {addOn?.description[1]}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
