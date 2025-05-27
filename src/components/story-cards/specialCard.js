import React from 'react';
import { Box, Card, CardActions, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledMessage = styled(Typography)(({ theme }) => ({
  backgroundColor: '#6200ea',
  color: 'white',
  padding: theme.spacing(1),
  marginTop: theme.spacing(2),
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  bottom: 0,
}));

const SpecialCard = () => {
  return (
    <Card sx={{ width: '100%', height: '100%', borderRadius: '0px', position: 'relative' }}>
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '120px', height: '120px', mb: "3rem" }}>
          <img
            src="/assets/images/contact/star.png"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="stars"
          />
        </Box>
      </CardContent>
      <CardActions sx={{ px: 0 }}>
        <StyledMessage variant="body1">
          Your story is being prepared!
          <br />
          We will email you once ready.
        </StyledMessage>
      </CardActions>
    </Card>
  );
};

export default SpecialCard;
