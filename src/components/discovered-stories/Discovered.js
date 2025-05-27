'use client';
import { Box, Button, CircularProgress, Container, Grid, Tooltip, Typography } from '@mui/material';
import { useQuery } from 'react-query';
import { getPublicStories, getSingleStory } from 'src/apis/create-story';
import { useSettingsContext } from 'src/components/settings';
import Book from 'src/sections/book/Book';
import { createShareStorylink } from 'src/apis/shared-story';
import { useState } from 'react';

export default function Discovered({ id }) {
  // const { id } = params;
  const settings = useSettingsContext();
  const [isCopied, setIsCopied] = useState(false);

  let accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  const { data: publicStoriesData, isLoading: publicStoriesDataLoading } = useQuery(
    ['getPublicStories', accessToken],
    () => getPublicStories(accessToken)
  );
  const story = publicStoriesData?.find((story) => story?._id == id);

  const { data: getSingleStoryData, isLoading: getSingleStoryDataLoading } = useQuery(
    ['getSingleStory', id],
    () => getSingleStory(id)
  );

  const getShareLink = async () => {
    try {
      const response = await createShareStorylink({ storyId: id }, accessToken);
      await navigator.clipboard.writeText(response.shareableLink);
      setIsCopied(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (publicStoriesDataLoading || getSingleStoryDataLoading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!story) {
    return (
      <Box sx={{ pt: { md: 10 } }}>
        <Typography variant="h2" textAlign="center">
          Story not found
        </Typography>
      </Box>
    );
  }

  return (
  <Container maxWidth={false} sx={{ maxWidth:'1350px' }}>
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
        <Typography variant="h2"> {getSingleStoryData?.story?.title} </Typography>
        {getSingleStoryData?.story?.writer && (
          <Typography
            variant="body"
            color="textSecondary"
            sx={{ textAlign: 'center', fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}
          >
            Created by {getSingleStoryData?.story?.writer}
          </Typography>
        )}

        <Grid container spacing={2} justifyContent="center" mb={2}>
          <Grid item md={2} xs={12}>
            <Tooltip title={isCopied && 'Link copied.'}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ textTransform: 'none', borderRadius: 10, py: 2 }}
                onClick={() => getShareLink()}
                disableRipple
              >
                Share
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ p: { xs: 0, md: 8 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Book singleBookData={getSingleStoryData?.story} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
