'use client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import { Button, Grid, Pagination, Typography } from '@mui/material';
import CustomStoryCard from 'src/components/story-cards/customStroyCard';
import SpecialCard from 'src/components/story-cards/specialCard';
import { useRouter } from 'next/navigation';
import { useState, memo, useContext, useEffect } from 'react';
import { useQuery } from 'react-query';
import { getAllStories } from 'src/apis/create-story';
import { BookContext } from 'src/context/BookContext';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { getSingleUserData } from 'src/apis/getSingeUserData';
import InfoModal from '../edit-story/InfoModal';
import { paths } from 'src/routes/paths';
import { verifySubscription } from 'src/apis/verifySubscription';
import SubscriptionExpiryModal from '../pricing/subscriptionExipryNoticeModal';
import ErrorModal from './ErrorModal';

const MemoizedStoryCard = memo(CustomStoryCard);

export default function MyStories() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { processingErrorModal, setProcessingErrorModal, storyCreatingErrorMessage } =
    useContext(BookContext);
  const showCard = JSON.parse(sessionStorage.getItem('loadingCard'));
  const { state } = useLocalStorage('user');
  const user = state;

  const [currentPage, setCurrentPage] = useState(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [openExpiryNoticeModal, setOpenExpiryNoticeModal] = useState(false);

  let accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }

  const shouldVerifySubscription = () => {
    if (user?.subscriptionExpiryDate) {
      const expiryDate = new Date(user.subscriptionExpiryDate);
      const now = new Date();

      return now >= expiryDate;
    }
    return false;
  };

  const { data, error, isLoading } = useQuery(
    'verifySubscription',
    () => verifySubscription(accessToken),
    {
      enabled: !!accessToken && shouldVerifySubscription(),
    }
  );

  const { data: allStoriesData, refetch } = useQuery(['getAllStories', accessToken], () =>
    getAllStories(accessToken)
  );
  const itemsPerPage = 8;

  const filteredData = allStoriesData?.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (showCard && filteredData?.length && filteredData[0]?.isSpecial !== true) {
    filteredData?.unshift({ isSpecial: true });
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    refetch();
  }, [showCard]);

  const getUpdatedUser = async () => {
    const response = await getSingleUserData(user?._id);
    localStorage.setItem('user', JSON.stringify(response));
    return;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        await getUpdatedUser(user._id);
      }
    };
    if (data?.success && data?.message == 'Subscription expired') {
      setOpenExpiryNoticeModal(true);
      fetchData();
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        await getUpdatedUser(user._id);
      }
    };

    fetchData();
  }, [user]);

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
        <Typography variant="h2"> My Stories </Typography>
        <Typography
          variant="body"
          color="textSecondary"
          sx={{ textAlign: 'center', fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}
        >
          Welcome to your storybook world!
          <br /> Start a new adventure or revisit your favorite tales.
        </Typography>
        <Button
          sx={{ textTransform: 'none', borderRadius: 10, mb: 2 }}
          disableRipple
          size="large"
          variant="contained"
          onClick={() => {
            user?.numOfStories <= 0
              ? setShowUpgradeModal(true)
              : router.push('/dashboard/my-stories/new');
          }}
        >
          Create a Story
        </Button>
      </Box>
      <Box sx={{ p: { xs: 0, md: 4 } }}>
        {filteredData?.length < 1 && !showCard ? (
          <Typography variant="h2" textAlign={'center'}>
            {' '}
            No Stories Found{' '}
          </Typography>
        ) : (
          <Grid container spacing={1.5}>
            {currentItems?.map((story, index) => (
              <Grid item xs={12} md={3} key={story?._id || index}>
                {story.isSpecial ? (
                  <SpecialCard />
                ) : (
                  <MemoizedStoryCard story={story} cursor="pointer" />
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {filteredData?.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            variant="outlined"
            color="primary"
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            size="large"
          />
        </Box>
      )}
      <InfoModal
        open={showUpgradeModal}
        handleClose={() => setShowUpgradeModal(false)}
        handleAction={() => router.push(paths.dashboard.pricing)}
        title="Upgrade your plan "
        description="Please upgrade your plan to create new story."
      />

      <ErrorModal
        open={processingErrorModal}
        setProcessingErrorModal={setProcessingErrorModal}
        message={storyCreatingErrorMessage}
      />
      <SubscriptionExpiryModal
        open={openExpiryNoticeModal}
        onClose={() => setOpenExpiryNoticeModal(false)}
      />
    </Container>
  );
}
