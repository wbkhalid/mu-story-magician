'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import { useEffect, useState } from 'react';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import {
  deleteStory,
  editStory,
  getSingleStory,
  getUpdatedCoverPhoto,
  getUpdateStoryImages,
} from 'src/apis/create-story';
import { useParams } from 'next/navigation';
import WarningDialouge from './WarningDialouge';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import Book from '../book/Book';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import AddDedication from '../my-stories/AddDedication';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import { getAddOnsData } from 'src/apis/addOns';
import { useLocalStorage } from 'src/hooks/use-local-storage';

export default function EditStory() {
  const settings = useSettingsContext();
  const [checked, setChecked] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentlyOpenedPage, setCurrentlyOpenedPage] = useState(0);
  const [singlePageContent, setSinglePageContent] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [pagesContent, setPagesContent] = useState([]);
  const [title, setTitle] = useState('');
  const [writerName, setWriterName] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updatedImagesUrl, setUpdatedImagesUrl] = useState();
  const [updatedImagesLoading, setUpdatedImagesLoading] = useState(false);
  const [dedicationTitle, setDedicationTitle] = useState('');
  const [dedicationMessage, setDedicationMessage] = useState('');
  const [dedicationFrom, setDedicationFrom] = useState('');
  const [updatedCoverPhotoUrl, setUpdatedCoverPhotoUrl] = useState([]);
  const [updatedCoverPhotoLoading, setUpdatedCoverPhotoLoading] = useState(false);
  const router = useRouter();
  const { id } = useParams();
  const { state } = useLocalStorage('user');
  const user = state;

  const { data: getSingleStoryData, refetch } = useQuery(
    ['getSingleStory', id],
    () => getSingleStory(id),
    {
      onSuccess: (data) => {
        setTitle(data?.story?.title || '');
        setCoverPhoto(data?.story?.coverphoto || '');
        setChecked(data?.story?.type === 'private');
        setPagesContent(
          data?.story?.pageContent?.map((content) => ({
            image: content?.image,
            page: content?.page,
          })) || []
        );
        setWriterName(data?.story?.writer);
        setDedicationTitle(data?.story?.dedicationPage?.title);
        setDedicationMessage(data?.story?.dedicationPage?.message);
        setDedicationFrom(data?.story?.dedicationPage?.from);
        setUpdatedCoverPhotoUrl(getSingleStoryData?.story?.coverphoto?.urls)
        setUpdatedImagesUrl(getSingleStoryData?.story?.pageContent?.imageUrls)
      },
    }
  );




  const { data: addOnsData, isLoading } = useQuery('addOnsData', getAddOnsData);

  const [addOns, setAddOns] = useState([]);

  useEffect(() => {
    if (addOnsData?.length > 0) {
      setAddOns(addOnsData);
    }
  }, [addOnsData]);

  const updatePagesContent = (index, page, image) => {
    const updatedPagesContent = [...pagesContent];
    updatedPagesContent[index] = {
      ...updatedPagesContent[index],
      page: page,
      image: image || updatedPagesContent[index]?.image,
    };
    setPagesContent(updatedPagesContent);
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleDelete = async () => {
    try {
      let response = await deleteStory(id);
      if (response?.success) {
        toast.success(response?.message);
        router.push(paths.dashboard.root);
      }
    } catch (error) {
      toast.error(error?.response?.data?.error);
    }
  };

  const handleSave = async () => {
    const updatedPagesContent = [...pagesContent];
    const contentIndex = Math.floor((currentlyOpenedPage - 1) / 2);
    updatedPagesContent[contentIndex] = {
      ...updatedPagesContent[contentIndex],
      page: singlePageContent,
      image: selectedImage || updatedPagesContent[contentIndex]?.image,
    };
    setPagesContent(updatedPagesContent);
    const payload = {
      title: title,
      writer: writerName,
      type: checked ? 'private' : 'public',
      coverphoto: coverPhoto,
      pageContent: updatedPagesContent,
      dedicationPage: {
        title: dedicationTitle,
        message: dedicationMessage,
        from: dedicationFrom,
      },
    };
    try {
      setUpdateLoading(true);
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }
      const response = await editStory(id, payload, accessToken);
      if (response.success) {
        setUpdateLoading(false);
        toast.success('Update Successfully');
        refetch();
      }
    } catch (error) {
      setUpdateLoading(false);
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const updatedImages = async () => {
    setUpdatedImagesLoading(true);
    const payload = {
      characters: getSingleStoryData?.story?.characters,
      pageText: singlePageContent,
    };
    try {
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }

      let response = await getUpdateStoryImages(payload, accessToken);
      if (response?.success) {
        setUpdatedImagesUrl(response?.data);
      }
      setUpdatedImagesLoading(false);
    } catch (error) {
      setUpdatedImagesLoading(false);
      toast.error(error.message);
    }
  };

  const updatedCoverPhoto = async () => {
    setUpdatedCoverPhotoLoading(true);
    const payload = {
      storyId: id,
    };

    try {
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }

      let response = await getUpdatedCoverPhoto(payload, accessToken);
      if (response?.success) {
        const filteredData = response?.data.filter((item) => item);
        setUpdatedCoverPhotoUrl(filteredData);
      }
      setUpdatedCoverPhotoLoading(false);
    } catch (error) {
      setUpdatedCoverPhotoLoading(false);
      toast.error(error.message);
    }
  };

  const dedication = getSingleStoryData?.story?.dedicationPage;
  const hasDedication = dedication?.title || dedication?.message || dedication?.from;

  if (isLoading) {
    return '';
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: '1350px' }}>
      <Typography variant="h2" textAlign="center" mb="2rem">
        Edit Story
      </Typography>

      <Book
        singleBookData={getSingleStoryData?.story}
        setCurrentlyOpenedPage={setCurrentlyOpenedPage}
        setSinglePageContent={setSinglePageContent}
        pagesContent={pagesContent}
        updatePagesContent={updatePagesContent}
        isEdit={true}
        updatedImagesLoading={updatedImagesLoading}
      />

      <Grid
        container
        mt="2rem"
        spacing={1}
        sx={{
          display:
            (hasDedication
              ? currentlyOpenedPage < 3 ||
              currentlyOpenedPage > getSingleStoryData?.story?.pageContent?.length * 2 + 2
              : currentlyOpenedPage < 1 ||
              currentlyOpenedPage > getSingleStoryData?.story?.pageContent?.length * 2) && 'none',
        }}
      >
        <Grid item xs={12} md={6}>
          <Typography>Edit Page Photo</Typography>
          <Grid container spacing={1} my={1.5}>
            {updatedImagesUrl?.map((imgUrl, index) => (
              <Grid item xs={2.5} key={index}>
                <Box
                  sx={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedImage(imgUrl);
                    updatePagesContent(
                      Math.floor((currentlyOpenedPage - 1) / 2),
                      singlePageContent,
                      imgUrl
                    );
                  }}
                >
                  <img src={imgUrl} alt={index} />
                  {updatedImagesLoading && (
                    <CircularProgress
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                  {selectedImage === imgUrl && (
                    <div className="select-image">
                      <CheckIcon style={{ fontSize: '3rem' }} />
                    </div>
                  )}
                </Box>
              </Grid>
            ))}
            <Grid item xs={2} display="flex" justifyContent="center" alignItems="center">
              <IconButton color="primary" disableRipple onClick={updatedImages}>
                <CachedIcon fontSize="large" />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography mb={1}>Edit Page Text</Typography>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={5}
            value={singlePageContent}
            onChange={(e) => {
              setSinglePageContent(e.target.value);
              updatePagesContent(
                Math.floor((currentlyOpenedPage - 1) / 2),
                e.target.value,
                selectedImage
              );
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: '1rem',
                },
              },
            }}
          />
        </Grid>
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          display:
            hasDedication && (currentlyOpenedPage == 1 || currentlyOpenedPage == 2)
              ? 'block'
              : 'none',
          mt: '2rem',
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box mb="1rem">
              <Typography>Title</Typography>
              <TextField
                variant="outlined"
                fullWidth
                value={dedicationTitle || ''}
                onChange={(e) => setDedicationTitle(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '1rem',
                    },
                  },
                }}
              />
            </Box>
            <Box mb="1rem">
              <Typography>Message</Typography>
              <TextField
                variant="outlined"
                fullWidth
                value={dedicationMessage || ''}
                multiline
                rows={5}
                onChange={(e) => setDedicationMessage(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '1rem',
                    },
                  },
                }}
              />
            </Box>
            <Box mb="1rem">
              <Typography>From</Typography>
              <TextField
                variant="outlined"
                fullWidth
                value={dedicationFrom || ''}
                onChange={(e) => setDedicationFrom(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '1rem',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography fontSize="1.5rem" mb={2} color="#797979" fontWeight="bold">
              Preview
            </Typography>
            <Typography variant="subtitle1" fontSize="1.3rem" color="#797979" mb="1rem">
              {dedicationTitle}
            </Typography>
            <Typography variant="subtitle1" fontSize="1.3rem" color="#797979" mb="1rem">
              {dedicationMessage}
            </Typography>
            <Typography variant="subtitle1" fontSize="1.3rem" color="#797979" mb="1rem">
              {dedicationFrom}
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ display: currentlyOpenedPage >= 1 && 'none', mt: '2rem' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: '2rem' }}>
              <Typography>Edit Title</Typography>

              <TextField
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '1rem',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: '2rem' }}>
              <Typography>Writer Name</Typography>

              <TextField
                variant="outlined"
                fullWidth
                value={writerName}
                onChange={(e) => setWriterName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '1rem',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography>Edit Cover photo</Typography>
              <Grid container spacing={0.5} my={1.5}>
                {updatedCoverPhotoUrl?.slice(0, 4)?.map((imgUrl, index) => (
                  <Grid item xs={2.5} key={index}>
                    <Box
                      sx={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => {
                        setCoverPhoto(imgUrl);
                      }}
                    >
                      <img src={imgUrl} alt={index} />
                      {updatedCoverPhotoLoading && (
                        <CircularProgress
                          sx={{
                            position: 'absolute',
                            top: '40%',
                            left: '40%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      )}
                      {coverPhoto === imgUrl && (
                        <div className="select-image">
                          <CheckIcon style={{ fontSize: '3rem' }} />
                        </div>
                      )}
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={1.2} display="flex" justifyContent="center" alignItems="center">
                  <IconButton color="primary" disableRipple onClick={updatedCoverPhoto}>
                    <CachedIcon fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
              <Typography>Or choose from photos from the book</Typography>
              <Box width="85%">
                <Swiper
                  spaceBetween={10}
                  slidesPerView={3.6}
                  navigation={true}
                  modules={[Navigation]}
                  style={{
                    '--swiper-navigation-color': '#c64bff',
                    '--swiper-navigation-size': '1.5rem',
                  }}
                >
                  {getSingleStoryData?.story?.pageContent.map((data, index) => (
                    <SwiperSlide key={index}>
                      <Box
                        sx={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => setCoverPhoto(data?.bestImageUrl)}
                      >
                        <img src={data?.bestImageUrl} alt={data?.bestImageUrl} />

                        {coverPhoto === data?.bestImageUrl && (
                          <div className="select-image">
                            <CheckIcon style={{ fontSize: '3rem' }} />
                          </div>
                        )}
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <FormGroup sx={{ mt: '3rem', display: currentlyOpenedPage >= 1 && 'none' }}>
        <FormControlLabel
          control={<Checkbox disableRipple checked={checked} onChange={handleChange} />}
          label="Private story"
        />
      </FormGroup>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent={{ md: 'space-between   ' }}
        mt="2rem"
        gap={1}
      >
        <Box display="flex" gap={1} flexDirection={{ xs: 'column', md: 'row' }}>
          <Button
            color="primary"
            variant="contained"
            disableRipple
            sx={{
              textTransform: 'none',
              borderRadius: 10,
              py: 2,
              width: {
                xs: '100%',
                md: 120,
                color: '#fff',
                background: 'linear-gradient(90deg, #FF00B3, #8A2BE2)',

                '&:hover': {
                  background: 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
                },
              },
            }}
            onClick={handleSave}
          >
            {updateLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}
          </Button>
          <Button
            variant="outlined"
            disableRipple
            sx={{
              textTransform: 'none',
              borderRadius: 10,
              py: 2,
              width: { xs: '100%', md: 120 },
            }}
            onClick={() => router.push(`/dashboard/my-stories/${id}`)}
          >
            Cancel
          </Button>
        </Box>
        <Box>
          <Button
            onClick={() => setOpenDeleteModal(true)}
            variant="contained"
            disableRipple
            sx={{
              display: currentlyOpenedPage >= 1 && 'none',
              textTransform: 'none',
              borderRadius: 10,
              py: 2,
              width: { xs: '100%', md: 120 },
              background: 'red',
              color: '#fff',
              '&:hover': {
                background: 'red',
                opacity: 0.9,
              },
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <Box mt={3}>
        {!user?.addOns?.some((addOn) => addOn?.name === addOns[0]?.name) && (
          <AddDedication addOns={addOns} />
        )}
      </Box>
      <WarningDialouge
        message="Are you sure you want to delete this story? This action is permanent and cannot be undone."
        onDelete={handleDelete}
        handleClose={() => setOpenDeleteModal(false)}
        open={openDeleteModal}
      />
    </Container>
  );
}
