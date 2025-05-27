'use client';
import { Box, Button, CircularProgress, Container, Grid, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import { getAllStories, getSingleStory } from 'src/apis/create-story';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import Book from 'src/sections/book/Book';
import { jsPDF } from 'jspdf';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { createShareStorylink } from 'src/apis/shared-story';
import { useState } from 'react';
import InfoModal from 'src/sections/edit-story/InfoModal';
import { QuicksandBold } from 'public/fonts/Quicksand-Bold-normal.js';
import { QuicksandNormal } from 'public/fonts/Quicksand-Regular-normal.js';
import axios from 'axios';

export default function Page({ id }) {
  const router = useRouter();
  const settings = useSettingsContext();
  const { state } = useLocalStorage('user');
  const [isCopied, setIsCopied] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [isPrintBook, setIsPrintBook] = useState(false);

  let accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }

  const { data: allStoriesData, isLoading: allStoriesDataLoading } = useQuery(
    ['getAllStories', accessToken],
    () => getAllStories(accessToken)
  );

  const story = allStoriesData?.find((story) => story?._id == id);

  const { data: getSingleStoryData, isLoading: getSingleStoryDataLoading } = useQuery(
    ['getSingleStory', id],
    () => getSingleStory(id)
  );

  async function fetchImageAsBase64(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/png;base64,${buffer}`;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  }
  const generatePDF = async () => {
    const doc = new jsPDF({
      unit: 'in',
      format: [8.5, 8.5],
    });

    doc.addFileToVFS('Quicksand-Bold.ttf', QuicksandBold);
    doc.addFont('Quicksand-Bold.ttf', 'Quicksand', 'bold');

    doc.addFileToVFS('Quicksand-Regular.ttf', QuicksandNormal);
    doc.addFont('Quicksand-Regular.ttf', 'Quicksand-normal', 'normal');

    const storyData = getSingleStoryData?.story;

    const coverImage = storyData?.coverphoto;
    const title = storyData?.title;
    const writer = storyData?.writer || '';

    doc.addImage(coverImage, 'PNG', 0, 0, 8.5, 8.5);

    doc.setFont('Quicksand', 'bold');
    doc.setFontSize(32);

    const shadowOffsets = [{ x: 0.02, y: 0.02 }];

    shadowOffsets.forEach((offset) => {
      doc.setTextColor(255, 255, 255);
      doc.text(title, 4 + offset.x, 2 + offset.y, { align: 'center', maxWidth: 7 });
    });

    doc.setTextColor(255, 90, 0);
    doc.text(title, 4, 2, { align: 'center', maxWidth: 7 });

    doc.setFontSize(24);

    shadowOffsets.forEach((offset) => {
      doc.setTextColor(255, 255, 255);
      doc.text(writer, 4 + offset.x, 7.5 + offset.y, { align: 'center', maxWidth: 7 });
    });

    doc.setTextColor(0, 0, 0);
    doc.text(writer, 4, 7.5, { align: 'center', maxWidth: 7 });

    doc.addPage();

    const dedicationPage = storyData?.dedicationPage;
    if (dedicationPage && (dedicationPage.from || dedicationPage.message || dedicationPage.title)) {
      doc.addPage();

      doc.setFillColor(245, 245, 220);
      doc.rect(0, 0, 8.5, 8.5, 'F');
      doc.setTextColor(68, 68, 68);

      if (dedicationPage.title) {
        doc.setFont('Quicksand', 'bold');
        doc.setFontSize(20);
        doc.text(dedicationPage.title, 4, 3, { align: 'center', maxWidth: 7 });
      }

      if (dedicationPage.message) {
        doc.setFont('Quicksand-normal', 'normal');
        doc.setFontSize(16);
        doc.text(dedicationPage.message, 4, 3.5, { align: 'center', maxWidth: 7 });
      }
      if (dedicationPage.from) {
        doc.setFont('Quicksand-normal', 'normal');
        doc.setFontSize(14);
        doc.text(dedicationPage.from, 4, 5, { align: 'center', maxWidth: 7 });
      }
    }

    doc.addPage();
    const pages = storyData?.pageContent
      ?.map((content) => {
        return [{ image: content?.image }, { page: content?.page }];
      })
      .flat(2);

    for (let i = 0; i < pages?.length; i++) {
      const page = pages[i];

      if (i > 0) {
        doc.addPage();
      }
      if (page?.page) {
        doc.setFillColor(245, 245, 220);
        doc.rect(0, 0, 8.5, 8.5, 'F');
        doc.setFontSize(16);
        doc.setFont('Quicksand-normal', 'normal');
        doc.setLineHeightFactor(2.5);
        doc.setTextColor(68, 68, 68);

        const text = doc.splitTextToSize(page?.page, 7);
        const textHeight = doc.getTextDimensions(text).h;
        const y = (8.5 - textHeight) / 2;

        doc.text(text, 1, y, { maxWidth: 7 });
      }

      if (page?.image) {
        const imageBase64 = (await fetchImageAsBase64(page?.image)) || page?.image;
        doc.addImage(imageBase64, 'PNG', 0, 0, 8.5, 8.5);
      }
    }

    doc.addPage();
    doc.setFillColor(245, 245, 220);
    doc.rect(0, 0, 8.5, 8.5, 'F');
    doc.setFont('Quicksand', 'bold');
    doc.setTextColor(68, 68, 68);
    doc.setFontSize(24);
    doc.text('-- The End --', 4.25, 4.25, { align: 'center' });

    doc.save(`${storyData?.title}.pdf`);
  };

  const getShareLink = async () => {
    try {
      const response = await createShareStorylink({ storyId: id }, accessToken);
      await navigator.clipboard.writeText(response.shareableLink);
      setIsCopied(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (allStoriesDataLoading || getSingleStoryDataLoading) {
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
        <Typography variant="h2" mb={1} textAlign="center">
          {' '}
          {getSingleStoryData?.story?.title}{' '}
        </Typography>
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
            <Button
              variant="outlined"
              color="primary"
              disableRipple
              fullWidth
              sx={{ textTransform: 'none', borderRadius: 10, py: 2 }}
              onClick={() => {
                state?.addOns?.some((addOn) => addOn?.name === 'Hard cover (print a book)')
                  ? router.push(`/dashboard/my-stories/${id}/print-story`)
                  : setIsPrintBook(true);
              }}
            >
              Print a book
            </Button>
          </Grid>
          <Grid item md={2} xs={12}>
            <Button
              variant="outlined"
              color="primary"
              disableRipple
              fullWidth
              sx={{ textTransform: 'none', borderRadius: 10, py: 2 }}
              onClick={() => router.push(paths.dashboard.addOns)}
            >
              Add-Ons
            </Button>
          </Grid>
          <Grid item md={2} xs={12}>
            <Button
              variant="outlined"
              fullWidth
              color="primary"
              size="medium"
              sx={{ textTransform: 'none', borderRadius: 10, py: 2 }}
              onClick={
                state?.subscriptionPlan?.slug == 'free' || state?.subscriptionPlan?.slug == null
                  ? () => setIsEdit(true)
                  : () => router.push(`/dashboard/my-stories/${id}/edit`)
              }
              disableRipple
            >
              Edit
            </Button>
          </Grid>

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
          <Grid item md={2} xs={12}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ textTransform: 'none', borderRadius: 10, py: 2 }}
              onClick={
                state?.subscriptionPlan?.slug == 'free' || state?.subscriptionPlan?.slug == null
                  ? () => setIsPdf(true)
                  : generatePDF
              }
              disableRipple
            >
              PDF
            </Button>
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
      <InfoModal
        open={isEdit}
        handleClose={() => setIsEdit(false)}
        handleAction={() => router.push(paths.dashboard.pricing)}
        title="Upgrade Required to Edit"
        description="To edit your book, please upgrade to a pricing plan that supports editing features."
      />

      <InfoModal
        open={isPdf}
        handleClose={() => setIsPdf(false)}
        handleAction={() => router.push(paths.dashboard.pricing)}
        title="Upgrade Required to Download PDF"
        description="To download your book as a PDF, please upgrade to a pricing plan that includes PDF download capabilities."
      />

      <InfoModal
        open={isPrintBook}
        handleClose={() => setIsPrintBook(false)}
        handleAction={() => router.push(paths.dashboard.addOns)}
        title="Upgrade Required to Print Book"
        description="To print your book, please upgrade to a pricing plan that includes printing services."
      />
    </Container>
  );
}
