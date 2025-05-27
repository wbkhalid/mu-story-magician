'use client';

import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Button, Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSettingsContext } from 'src/components/settings';
import { CustomFormField, CustomFormTextarea } from 'src/components/story-cards/customFormFields';
import SelectTextField from 'src/components/customDropdown';
import { useRouter } from 'src/routes/hooks';
import StoryInProgress from './StoryInProgress';
import { age, hairColor, hairLength, readerAge, writingStyles, storyType, languages } from './data';
import PersonilizePhotosModal from './PersonilizePhotosModal';
import { createStoryApi } from 'src/apis/create-story';
import toast from 'react-hot-toast';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import AddDedication from './AddDedication';
import { getAddOnsData } from 'src/apis/addOns';
import { useQuery } from 'react-query';
import { handleCheckout } from '../add-ons/view';
import { BookContext } from 'src/context/BookContext';

const validationSchema = Yup.object().shape({
  mainCharacter: Yup.string()
    .min(2, 'Main character must be at least 3 characters')
    .max(50, 'Main charactermust be at most 50 characters')
    .required('* Required'),
  ageInYears: Yup.string().nullable(),
  hairColor: Yup.string().nullable(),
  hairLength: Yup.string().nullable(),
  ethnicity: Yup.string().nullable(),
  storyIdea: Yup.string()
    .min(5, 'Story idea must be at least 5 characters')
    .min(10, 'Story idea must be at least 10 characters')
    .required('* Required'),
  readerAge: Yup.string().required('* Required'),
  writingStyle: Yup.string().required('* Required'),
  storyType: Yup.string().required('* Required'),
  language: Yup.string().required('* Required'),
  standardAIphotos: Yup.boolean(),
  personalizedPhotos: Yup.array(),
  dedicationPage: Yup.object().shape({
    title: Yup.string().nullable(),
    message: Yup.string().nullable(),
    from: Yup.string().nullable(),
  }),
});

export default function CreateStory() {
  const settings = useSettingsContext();
  const { state } = useLocalStorage('user');
  const user = state;

  const [pageNo, setPageNo] = useState(1);
  const [inProgressModal, setInProgressModal] = useState(false);
  const [openPersonilizePhotos, setOpenPersonilizePhotos] = useState(false);
  const [addOns, setAddOns] = useState([]);
  const router = useRouter();

  const { showCardHandler, handleProcessingError } = useContext(BookContext);

  const handleAiImagesSelect = (formik) => {
    formik.setFieldValue('statndardAIphotos', !formik.values.statndardAIphotos);
    formik.setFieldValue('personalizedPhotos', []);
  };

  const formik = useFormik({
    initialValues: {
      mainCharacter: '',
      ageInYears: '',
      hairColor: '',
      hairLength: '',
      ethnicity: '',
      storyIdea: '',
      readerAge: '4-6',
      writingStyle: 'imaginative',
      storyType: 'bedtime-story',
      language: 'english',
      statndardAIphotos: false,
      personalizedPhotos: [],
      dedicationPage: {
        title: null,
        message: null,
        from: null,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }
      const formData = new FormData();
      for (const key in values) {
        if (Array.isArray(values[key])) {
          values[key].forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (typeof values[key] === 'object' && values[key] !== null) {
          formData.append(key, JSON.stringify(values[key]));
        } else {
          formData.append(key, values[key]);
        }
      }

      formData.append('userId', user?._id);

      try {
        setInProgressModal(true);
        showCardHandler(true);
        const response = await createStoryApi(formData, accessToken);
        if (response.success) {
          toast.success('Your story has been successfully created');
          showCardHandler(false);
        }
      } catch (error) {
        console.log(error);
        handleProcessingError(
          error?.response?.data?.error || 'Error processing your request. Please try again '
        );
        showCardHandler(false);
      }
    },
  });

  const { data: addOnsData } = useQuery('addOnsData', getAddOnsData);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (addOnsData?.length > 0) {
      setAddOns(addOnsData);
    }
  }, [addOns, pageNo]);

  const disableButton = (pageNo, values, errors) => {
    switch (pageNo) {
      case 1:
        return !values.mainCharacter || !!errors.mainCharacter;
      case 2:
        return !values.storyIdea || !!errors.storyIdea || !values.readerAge || !!errors.readerAge;
      case 4:
        return !(formik.values.statndardAIphotos || formik.values.personalizedPhotos.length > 10);
      default:
        return false;
    }
  };

  const getSubtitleText = (pageNo) => {
    if (pageNo === 1) return 'Describe your main character';
    if (pageNo === 2) return 'Describe your story idea';
    if (pageNo === 3 && !(user?.subscriptionPlan?.slug == 'free')) return 'Dedication page';
    return 'Choose Photo Style';
  };

  const pageOneContent = (
    <>
      <Grid item xs={12}>
        <CustomFormField
          label="Main charater for your story"
          name="mainCharacter"
          formik={formik}
          placeholder="E.G. A girl named Paris"
        />
      </Grid>
      <Grid item xs={12}>
        <SelectTextField
          label="Age in Years (Optional)"
          name="ageInYears"
          formik={formik}
          placeholder="ageInYears"
          options={age}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectTextField
          label="Hair Color (Optional)"
          name="hairColor"
          formik={formik}
          options={hairColor}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectTextField
          label="Hair Length (Optional)"
          name="hairLength"
          formik={formik}
          options={hairLength}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomFormField label="Ethnicity (Optional)" name="ethnicity" formik={formik} />
      </Grid>
    </>
  );

  const pageTwoContent = (
    <>
      <Grid item xs={12}>
        <CustomFormTextarea
          label="Briefly describe your story’s idea"
          name="storyIdea"
          formik={formik}
          placeholder="Paris’s first day at school..."
        />
      </Grid>
      <Grid item xs={12}>
        <SelectTextField
          label="Reader Age"
          name="readerAge"
          formik={formik}
          placeholder="ageInYears"
          options={readerAge}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectTextField
          label="Writing Style"
          name="writingStyle"
          formik={formik}
          options={writingStyles}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectTextField label="Story Type" name="storyType" formik={formik} options={storyType} />
      </Grid>

      <Grid item xs={12}>
        <SelectTextField label="Language" name="language" formik={formik} options={languages} />
      </Grid>
      {!user?.addOns?.some((addOn) => addOn?.name === addOns[0]?.name) && (
        <Grid item xs={12}>
          <AddDedication addOns={addOns} />
        </Grid>
      )}
    </>
  );

  const pageThreeContent = (
    <>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box mb="2rem">
              <CustomFormField
                label="Title"
                name="dedicationPage.title"
                formik={formik}
                isWidth={true}
              />
            </Box>
            <Box mb="2rem">
              <CustomFormTextarea label="Message" name="dedicationPage.message" formik={formik} />
            </Box>
            <Box mb="2rem">
              <CustomFormField
                label="From"
                name="dedicationPage.from"
                formik={formik}
                isWidth={true}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography fontSize="1.5rem" mb={2} color="#797979" fontWeight="bold">
              Preview
            </Typography>
            {['title', 'message', 'from'].map((field) => (
              <Typography
                key={field}
                variant="subtitle1"
                fontSize="1.3rem"
                color="#797979"
                mb="1rem"
              >
                {formik.values.dedicationPage[field]}
              </Typography>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  const pageFourContent = (
    <>
      <Grid item md={6} xs={12} sx={{ display: 'flex' }}>
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
              border: formik.values.statndardAIphotos && '2px solid blue',
            }}
          >
            <CardMedia
              component="img"
              alt="green iguana"
              height="350"
              image="/assets/images/contact/standard-ai-photos.png"
            />
            <CardContent>
              <Typography gutterBottom variant="h4" component="div">
                Standard AI Photos
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderRadius: 10,
                  py: 1.5,
                  maxWidth: { xs: '100%', md: 120 },
                }}
                onClick={() => handleAiImagesSelect(formik)}
              >
                {formik.values.statndardAIphotos ? 'Unselect' : 'Select'}
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Grid>
      <Grid item md={6} xs={12} style={{ display: 'flex' }}>
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
              cursor: 'pointer',
            }}
            onClick={() => setOpenPersonilizePhotos(true)}
          >
            <CardMedia
              component="img"
              alt="personalized"
              height="350"
              image="/assets/images/contact/personalized-photos.png"
            />
            <CardContent>
              <Typography gutterBottom variant="h4" component="div">
                {addOns[0]?.description[0]}
              </Typography>
            </CardContent>
            {!user?.addOns?.some((addOn) => addOn?.name === addOns[0]?.name) && (
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
                  onClick={() => router.push(paths.dashborad.addOns)}
                >
                  Upgrade
                </Button>
              </CardActions>
            )}
          </Card>
        </Box>
      </Grid>
    </>
  );

  return (
    <Container maxWidth={false} sx={{ position: 'relative', maxWidth: '1350' }}>
      <Box>
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
          <Typography variant="h2">Create Story</Typography>

          <Typography
            color="textSecondary"
            sx={{
              textAlign: 'center',
              fontWeight: 400,
              fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' },
            }}
          >
            {getSubtitleText(pageNo)}
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 0, md: 8 } }}>
          <Card>
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  {pageNo === 1 && pageOneContent}
                  {pageNo === 2 && pageTwoContent}

                  {pageNo === 3 &&
                    user?.addOns?.some((addOn) => addOn?.name == addOns[0]?.name) &&
                    pageThreeContent}
                  {pageNo === 4 && pageFourContent}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {(pageNo === 1 || pageNo === 2 || pageNo === 3) && (
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            borderRadius: 10,
                            py: 2,
                            maxWidth: { xs: '100%', md: 150 },
                            background: (theme) => theme.palette.grey[300],
                            color: '#fff',
                            background: (theme) =>
                              !disableButton(pageNo, formik.values, formik.errors)
                                ? 'linear-gradient(90deg, #FF00B3, #8A2BE2)' // Gradient when enabled
                                : theme.palette.grey[300], // Gray color when disabled
                            '&:hover': {
                              background: (theme) =>
                                !disableButton(pageNo, formik.values, formik.errors)
                                  ? 'linear-gradient(90deg, #FF00B3, #8A2BE2)' // Gradient when enabled
                                  : theme.palette.grey[300], // Gray color when disabled
                            },
                          }}
                          onClick={
                            !user?.addOns?.some((addOn) => addOn?.name === addOns[0]?.name) &&
                            pageNo === 2
                              ? () => setPageNo(pageNo + 2)
                              : () => setPageNo(pageNo + 1)
                          }
                          disabled={disableButton(pageNo, formik.values, formik.errors)}
                        >
                          Next
                        </Button>
                      )}
                      {pageNo === 4 && (
                        <Button
                          color="primary"
                          variant="contained"
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            borderRadius: 10,
                            py: 2,
                            maxWidth: { xs: '100%', md: 150 },
                            background: (theme) => theme.palette.grey[300],
                            color: '#fff',
                            background: (theme) =>
                              !disableButton(pageNo, formik.values, formik.errors)
                                ? 'linear-gradient(90deg, #FF00B3, #8A2BE2)' // Gradient when enabled
                                : theme.palette.grey[300], // Gray color when disabled
                            '&:hover': {
                              background: (theme) =>
                                !disableButton(pageNo, formik.values, formik.errors)
                                  ? 'linear-gradient(90deg, #FF00B3, #8A2BE2)' // Gradient when enabled
                                  : theme.palette.grey[300], // Gray color when disabled
                            },
                          }}
                          type="submit"
                          disabled={
                            !(
                              formik.values.statndardAIphotos ||
                              formik.values.personalizedPhotos.length > 10
                            )
                          }
                        >
                          Create Story
                        </Button>
                      )}
                      {(pageNo === 2 || pageNo === 3 || pageNo === 4) && (
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            borderRadius: 10,
                            py: 2,
                            maxWidth: { xs: '100%', md: 150 },
                          }}
                          onClick={
                            !user?.addOns?.some((addOn) => addOn?.name === addOns[0]?.name) &&
                            pageNo === 4
                              ? () => setPageNo(pageNo - 2)
                              : () => setPageNo(pageNo - 1)
                          }
                        >
                          Previous
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <StoryInProgress
        inProgressModal={inProgressModal}
        setInProgressModal={setInProgressModal}
        message={{
          text1: 'Exciting! Your story is being created! We’ll send you an email when it is ready.',
          text2: 'This usually takes around 3-5 minutes on a good day.',
          text3: ' Your new story will show up in your library when it’s ready.',
        }}
      />
      <PersonilizePhotosModal
        openPersonilizePhotos={openPersonilizePhotos}
        setOpenPersonilizePhotos={setOpenPersonilizePhotos}
        formik={formik}
      />
    </Container>
  );
}
