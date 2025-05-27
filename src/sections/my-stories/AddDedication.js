import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { paths } from 'src/routes/paths';

const AddDedication = ({ addOns }) => {
  const router = useRouter();
  return (
    <Card sx={{ backgroundColor: '#F9F9F9' }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h3">{addOns && addOns[0]?.name}</Typography>
        <Typography
          variant="subTitle"
          color="textSecondary"
          sx={{ fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.{' '}
        </Typography>

        <Box width="100%" borderRadius={10}>
          <Image
            alt="upgrade"
            src="/assets/images/contact/upgrade-img.png"
            layout="responsive"
            width={700}
            height={475}
            priority
          />
        </Box>
      </CardContent>
      <CardActions sx={{ padding: 3 }}>
        <Button
          sx={{
            textTransform: 'none',
            borderRadius: 10,
            py: 2,
            maxWidth: { xs: '100%', md: 120 },
            color: '#9800ff',
            borderColor: '#9800ff',
            '&:hover': {
              borderColor: '#9800ff',
              backgroundColor: 'rgba(82, 54, 255, 0.1)',
            },
          }}
          variant="outlined"
          fullWidth
          onClick={() => router.push(paths.dashboard.addOns)}
        >
          Upgrade
        </Button>
      </CardActions>
    </Card>
  );
};

export default AddDedication;
