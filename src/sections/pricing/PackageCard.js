import React from 'react';
import {
  Card,
  Typography,
  Divider,
  Button,
  Box,
  useTheme,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { usePayment } from 'src/context/paymentContext';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { paths } from 'src/routes/paths';
const options = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

const PackageCard = ({
  name,
  category,
  description,
  price,
  abilityToPurchase,
  isPopular,
  isCancel,
  isProfile = false,
  numOfStories,
  slug,
}) => {
  const theme = useTheme();
  const { state } = useLocalStorage('user');
  const router = useRouter();
  const user = state;
  const listItemColor = isPopular ? '#fff' : theme.palette.text.secondary;
  const removePerHandler = (text) => text.replace('per ', '');
  const { setPaymentInfo } = usePayment();

  const [numOfStoriesValue, setNumOfStoriesValue] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleGetStarted = () => {
    const newPrice = slug == 'silver' ? price * numOfStoriesValue : price;
    setPaymentInfo({
      type: 'subscription',
      numOfStories: slug == 'silver' ? numOfStoriesValue : numOfStories,
      slug: slug,
      amount: newPrice,
      name: name,
    });
    router.push(paths.dashboard.payment);
  };

  const handleChangeNumOfStories = (event) => {
    setNumOfStoriesValue(event.target.value);
  };

  return (
    <Card
      sx={{
        bgcolor: isPopular ? theme.palette.grey[1000] : alpha(theme.palette.grey[500], 0.04),
        boxShadow: 'none',
        py: '1.5rem',
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <Box>
        <Box height="7rem">
          <Typography
            variant="h4"
            mb={2}
            textAlign="center"
            color={isPopular ? '#fff' : theme.palette.text.primary}
          >
            {name}
          </Typography>
          {isPopular && (
            <Box
              width="fit-content"
              sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}
            >
              <Typography
                sx={{
                  width: 'fit-content',
                  color: theme.palette.grey[1000],
                  bgcolor: '#fff',
                  borderRadius: '2rem',
                  p: '.5rem 1rem',
                  fontWeight: 'bold',
                }}
              >
                Popular
              </Typography>
            </Box>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '5rem' }}
        >
          <Typography
            variant="h4"
            mb={2}
            textAlign="center"
            color={isPopular ? '#EBE9E9' : theme.palette.primary.primary}
          >
            {slug === 'free'
              ? 'Free'
              : slug === 'silver'
                ? `$ ${price * numOfStoriesValue}`
                : `$ ${price}`}
            {slug !== 'free' && (
              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                /{removePerHandler(category)}
              </span>
            )}
          </Typography>

          {slug == user?.subscriptionPlan?.slug && (
            <Chip
              label="Current Plan"
              variant="outlined"
              color="warning"
              sx={{ borderRadius: 10 }}
            />
          )}
          {isCancel && (
            <Button disableRipple sx={{ color: isPopular ? '#fff' : theme.palette.text.primary }}>
              Cancel anytime
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mb: 2 }}>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {description?.map((feature, index) => (
              <li
                key={index}
                style={{ color: listItemColor, listStyle: 'none', marginBottom: '1rem' }}
              >
                {feature}
              </li>
            ))}
          </ul>
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          Ability to purchase:
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {abilityToPurchase?.map((feature, index) => (
              <li
                key={index}
                style={{ color: listItemColor, listStyle: 'none', marginBottom: '1rem' }}
              >
                - {feature}
              </li>
            ))}
          </ul>
        </Typography>
        {slug == 'silver' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Number of stories</Typography>

            <TextField
              value={numOfStoriesValue}
              onChange={handleChangeNumOfStories}
              select
              style={{ borderRadius: '40px' }}
              placeholder="Select a value"
              sx={{
                maxWidth: { md: 500, xs: '100%' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#23A6F0',
                    borderRadius: '40px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#23A6F0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#23A6F0',
                  },
                },
                '& .MuiSelect-icon': {
                  color: '#23A6F0',
                },
                '&.Mui-focused .MuiSelect-icon': {
                  color: '#23A6F0',
                },
                '& .MuiSelect-select': {
                  color: '#23A6F0',
                },
              }}
              fullWidth
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ color: '#23A6F0' }}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
      </Box>
      {slug != 'free' && (
        <Button
          variant={isPopular ? 'contained' : 'outlined'}
          fullWidth
          disableRipple
          sx={{
            textTransform: 'none',
            borderRadius: 10,
            py: 2,
            maxWidth: { md: 150, xs: '100%' },
            alignSelf: 'center',
            mt: '2rem',
            bgcolor: isPopular ? '#fff' : 'transparent',
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: isPopular ? alpha('#fff', 0.8) : alpha(theme.palette.text.secondary),
            },
          }}
          onClick={handleGetStarted}
          disabled={loading}
        >
          {isProfile ? 'Change Plan' : 'Get Started'}
        </Button>
      )}
      {error && <Typography color="error">{error}</Typography>}
    </Card>
  );
};

export default PackageCard;
