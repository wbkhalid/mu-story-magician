'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { useState, memo, useEffect } from 'react';
import { useFormik } from 'formik';
import CustomStoryCard from 'src/components/story-cards/customStroyCard';
import { CustomFormField } from 'src/components/story-cards/customFormFields';
import StoryInProgress from '../my-stories/StoryInProgress';
import { getSingleStory } from 'src/apis/create-story';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'react-query';
import { generateTokenAndGetPrintCost, shippingInfo } from 'src/apis/printStoryBook';
import { usePayment } from 'src/context/paymentContext';
import { paths } from 'src/routes/paths';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import SelectTextField from 'src/components/customDropdown';
import * as Yup from 'yup';
import { getSingleUserData } from 'src/apis/getSingeUserData';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .matches(/^[a-zA-Z\s]+$/, 'First Name must contain only alphabets')
    .min(3, 'minimum 3 letters')
    .max(50, 'max 50 letters')
    .required('* Required'),
  phone: Yup.string()
    .matches(/^\+\d{1,3} \d{3} \d{3} \d{4}$/, 'Phone number must be in the format +1 896 554 9459')
    .required('* Required'),
  quantity: Yup.number().min(1, 'Quantity must be at least 1').required('* Required'),
  city: Yup.string().required('* Required'),
  postCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Post Code is not valid')
    .required('* Required'),
  countryCode: Yup.string()
    .matches(/^[A-Z]{2}$/, 'Country Code is not valid')
    .required('* Required'),
  stateCode: Yup.string()
    .matches(/^[A-Z]{2}$/, 'State Code is not valid')
    .required('* Required'),
  street: Yup.string().required('* Required'),
  shippingLevel: Yup.string(),
});

export default function PrintStoryBook() {
  const settings = useSettingsContext();
  const { setPaymentInfo } = usePayment();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);

  const [printJobCost, setPrintJobCost] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingOptionsLoading, setShippingOptionsLoading] = useState(false);
  const [generateTokenLoading, setGenerateTokenLoading] = useState(false);
  const [shippingAddressData, setShippingAddressData] = useState();

  const searchParams = useSearchParams();
  const { id } = useParams();
  const { state } = useLocalStorage('user');

  const getUpdatedUser = async () => {
    const response = await getSingleUserData(state?._id);
    setShippingAddressData(response?.shippingAddress);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (state?._id) {
        await getUpdatedUser();
      }
    };
    fetchData();
  }, [state?._id]);

  useEffect(() => {
    if (shippingAddressData) {
      formik.setValues({
        name: shippingAddressData?.name || '',
        phone: shippingAddressData?.phone || '',
        quantity: shippingAddressData?.quantity || 1,
        city: shippingAddressData?.city || '',
        postCode: shippingAddressData?.postCode || '',
        countryCode: shippingAddressData?.countryCode || '',
        stateCode: shippingAddressData?.stateCode || '',
        street: shippingAddressData?.street || '',
        shippingLevel: shippingAddressData?.shippingLevel || '',
      });
    }
  }, [shippingAddressData]);

  let accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  const { data: getSingleStoryData } = useQuery(['getSingleStory', id], () => getSingleStory(id));
  useEffect(() => {
    const page = searchParams.get('pageNo');
    if (page) {
      setPageNo(Number(page));
    }
  }, [searchParams]);

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      quantity: 1,
      city: '',
      postCode: '',
      countryCode: '',
      stateCode: '',
      street: '',
      shippingLevel: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!values?.shippingLevel) {
        const payload = {
          shippingAddress: {
            city: values.city,
            country: values.countryCode,
            postcode: values.postCode,
            stateCode: values.stateCode,
            street: values.street,
            quantity: +values.quantity,
          },
        };

        try {
          setShippingOptionsLoading(true);
          const shippingResponse = await shippingInfo(payload, accessToken);
          if (shippingResponse?.success) {
            const levels = shippingResponse?.shippingOptions?.map((option) => ({
              value: option?.level,
              label: option?.level,
            }));
            setShippingOptionsLoading(false);
            setShippingOptions(levels);
            setPageNo((prevPageNo) => prevPageNo + 1);
          }
        } catch (error) {
          console.log(error);
        }
      } else if (values?.shippingLevel) {
        const payload = {
          shippingAddress: {
            name: values.name,
            city: values.city,
            countryCode: values.countryCode,
            postCode: values.postCode,
            stateCode: values.stateCode,
            street: values.street,
            quantity: +values.quantity,
            phone: values.phone,
            shippingLevel: values.shippingLevel,
          },
          storyId: getSingleStoryData.story._id,
        };
        setGenerateTokenLoading(true);
        const response = await generateTokenAndGetPrintCost(payload, accessToken);

        setPrintJobCost(response?.printJobCost);
        setGenerateTokenLoading(false);
        setPageNo(pageNo + 1);
        localStorage.setItem(
          'printBookInfo',
          JSON.stringify({
            interiorPdfUrl: response.interiorPdfUrl,
            coverPdfUrl: response.coverPdfUrl,
            accessToken: response.accessToken,
            shippingAddress: response.shippingAddress,
            storyTitle: getSingleStoryData.story.title,
          })
        );
      }
    },
  });

  const MemoizedStoryCard = memo(CustomStoryCard);

  const handleQuantityChnange = (e, formik) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      formik.setFieldValue('quantity', value);
    }
  };

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
        <Typography variant="h2"> Print a book </Typography>
      </Box>
      <Box sx={{ p: { xs: 0, md: 8 } }}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {pageNo === 1 ? (
                <>
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
                        }}
                        onClick={() => setPageNo(2)}
                      >
                        <CardMedia
                          component="img"
                          alt="personalized"
                          height="350"
                          image="/assets/images/contact/personalized-photos.png"
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h4" component="div">
                            Print a high quality hard cover book
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ px: 3 }}>
                          <Button
                            color="primary"
                            variant="contained"
                            disableRipple
                            sx={{
                              textTransform: 'none',
                              borderRadius: 10,
                              py: 2,
                              maxWidth: { xs: '100%', md: 200 },
                              background: (theme) => theme.palette.grey[300],
                              color: '#fff',
                              background: (theme) => 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
                            }}
                            onClick={() => setPageNo(2)}
                          >
                            Order Hard Cover Book
                          </Button>
                        </CardActions>
                      </Card>
                    </Box>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <MemoizedStoryCard story={getSingleStoryData?.story} clickable={false} />
                  </Grid>
                </>
              ) : pageNo === 2 ? (
                <Box p={4} display={'flex'} flexDirection={'column'} gap={5}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="h3">Shipping information</Typography>
                      </Box>
                      <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={4}>
                          <Grid item md={6} xs={12}>
                            <CustomFormField name="name" label="Name" formik={formik} />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField
                              name="phone"
                              label="Phone"
                              formik={formik}
                              type="tel"
                            />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField
                              name="quantity"
                              label="Quantity"
                              formik={formik}
                              onChange={(event) => handleQuantityChnange(event, formik)}
                            />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField name="city" label="City" formik={formik} />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField
                              name="countryCode"
                              label="Country Code"
                              formik={formik}
                            />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField name="postCode" label="Post Code" formik={formik} />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField name="stateCode" label="State Code" formik={formik} />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomFormField name="street" label="Street" formik={formik} />
                          </Grid>

                          <Grid item xs={12}>
                            <Box
                              display="flex"
                              flexDirection={{ md: 'row', xs: 'column' }}
                              mt={4}
                              gap={1}
                            >
                              <Button
                                color="primary"
                                variant="contained"
                                disableRipple
                                fullWidth
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: 10,
                                  py: 2,
                                  width: { xs: '100%', md: 150 },
                                  background: (theme) => theme.palette.grey[300],
                                  color: '#fff',
                                  background: (theme) => 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
                                }}
                                type="submit"
                                disabled={!formik.dirty || !formik.isValid}
                              >
                                {shippingOptionsLoading ? (
                                  <CircularProgress sx={{ color: '#fff' }} size={20} />
                                ) : (
                                  'Next'
                                )}
                              </Button>
                              <Button
                                disableRipple
                                onClick={() => setPageNo(pageNo - 1)}
                                variant="outlined"
                                fullWidth
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: 10,
                                  py: 2,
                                  maxWidth: { xs: '100%', md: 150 },
                                }}
                              >
                                Previous
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </form>
                    </Grid>
                  </Grid>
                </Box>
              ) : pageNo === 3 ? (
                <Box p={4} display={'flex'} flexDirection={'column'} gap={5}>
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="h3">Shipping Options</Typography>
                        </Box>
                        <SelectTextField
                          label="Select a Shipping Option"
                          name="shippingLevel"
                          formik={formik}
                          fullWidth
                          placeholder="Select a shipping option"
                          options={shippingOptions}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          display="flex"
                          flexDirection={{ md: 'row', xs: 'column' }}
                          mt={4}
                          gap={1}
                        >
                          <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            disableRipple
                            sx={{
                              textTransform: 'none',
                              borderRadius: 10,
                              py: 2,
                              width: { xs: '100%', md: 150 },
                              color: '#fff !important',
                              background: (theme) => 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
                            }}
                            type="submit"
                            disabled={!formik.values.shippingLevel}
                          >
                            {generateTokenLoading ? (
                              <CircularProgress sx={{ color: '#fff' }} size={20} />
                            ) : (
                              'Next'
                            )}
                          </Button>
                          <Button
                            disableRipple
                            onClick={() => setPageNo(pageNo - 1)}
                            variant="outlined"
                            fullWidth
                            sx={{
                              textTransform: 'none',
                              borderRadius: 10,
                              py: 2,
                              maxWidth: { xs: '100%', md: 150 },
                            }}
                          >
                            Previous
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              ) : (
                pageNo === 4 && (
                  <>
                    <Grid item xs={12}>
                      <Box p={4} display={'flex'} flexDirection={'column'} gap={5}>
                        <Box>
                          <Typography variant="h3" sx={{ cursor: 'pointer' }}>
                            Order Summary
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Cost Breakdown
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="subtitle1">Per item cost:</Typography>
                            <Typography variant="body1" color="text.secondary">
                              $40
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="subtitle1">Number of items:</Typography>
                            <Typography variant="body1" color="text.secondary">
                              {printJobCost?.line_item_costs[0]?.quantity}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="subtitle1">Total item cost:</Typography>
                            <Typography variant="body1" color="text.secondary">
                              ${40 * printJobCost?.line_item_costs[0]?.quantity}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="subtitle1">Shipping cost:</Typography>
                            <Typography variant="body1" color="text.secondary">
                              {printJobCost?.shipping_cost?.total_cost_incl_tax}
                            </Typography>
                          </Box>

                          <Divider sx={{ mb: 2 }} />
                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="h6">Total cost incl tax:</Typography>
                            <Typography variant="body1" color="text.secondary" fontWeight="bold">
                              $
                              {40 * (printJobCost?.line_item_costs[0]?.quantity || 0) +
                                parseFloat(printJobCost?.shipping_cost?.total_cost_incl_tax || 0)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          display="flex"
                          flexDirection={{ md: 'row', xs: 'column' }}
                          mt={4}
                          gap={1}
                        >
                          <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            sx={{
                              textTransform: 'none',
                              borderRadius: 10,
                              py: 2,
                              maxWidth: { xs: '100%', md: 250 },
                              background: (theme) => theme.palette.grey[300],
                              color: '#fff',
                              background: (theme) => 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
                            }}
                            onClick={() => {
                              setPaymentInfo({
                                amount:
                                  40 * (printJobCost?.line_item_costs[0]?.quantity || 0) +
                                  parseFloat(printJobCost?.shipping_cost?.total_cost_incl_tax || 0),
                                name: getSingleStoryData.story?.title,
                                type: 'printBook',
                                quantity: printJobCost?.line_item_costs[0]?.quantity,
                              });
                              router.push(paths.dashboard.payment);
                            }}
                          >
                            Proceed to checkout
                          </Button>
                          <Button
                            disableRipple
                            onClick={() => setPageNo(pageNo - 1)}
                            variant="outlined"
                            fullWidth
                            sx={{
                              textTransform: 'none',
                              borderRadius: 10,
                              py: 2,
                              maxWidth: { xs: '100%', md: 150 },
                            }}
                          >
                            Previous
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
