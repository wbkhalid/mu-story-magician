'use client';
import { Box, CircularProgress } from '@mui/material';
import { useQuery } from 'react-query';
import { getPricingData } from 'src/apis/pricing';
import Pricing from 'src/sections/pricing/view';

export default function Page() {
  const { data: packages, isLoading } = useQuery('packages', getPricingData);

  const sortedPackages = packages ? packages?.sort((a, b) => a?.price - b?.price) : [];

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  return <Pricing packages={sortedPackages} />;
}
