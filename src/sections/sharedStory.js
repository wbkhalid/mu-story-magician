'use client';
import { useQuery } from 'react-query';
import { getSharedStory } from 'src/apis/shared-story';
import Book from './book/Book';
import { Box, Grid, Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';

const SharedStoryPage = ({ storyId }) => {
  const settings = useSettingsContext();
  const { data: sharedStoryData } = useQuery(['getSharedStory', storyId], () =>
    getSharedStory(storyId)
  );

  return (
  <Container maxWidth={false} sx={{ maxWidth:'1350px' }}>
      <Box sx={{ p: { xs: 0, md: 8 } }}>
        <Grid container spacing={4}>
          <Grid item md={12}>
            <Box>
              <Book singleBookData={sharedStoryData?.story} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SharedStoryPage;
