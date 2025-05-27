'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useFormik } from 'formik';
import { useSettingsContext } from 'src/components/settings';
import { CustomFormField } from 'src/components/story-cards/customFormFields';
import { Checkbox, Chip, FormControlLabel, Grid, Stack } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useRouter } from 'src/routes/hooks';
import * as Yup from 'yup';
import { paths } from 'src/routes/paths';
import { OrderDetailModal } from './orderDetailModal';
import { getUser } from 'src/auth/context/jwt/utils';
import { verifyPassword, updateProfile } from 'src/apis/profile';
import toast from 'react-hot-toast';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import moment from 'moment';
import { useQuery } from 'react-query';
import { getOrdersByUserId } from 'src/apis/orders';

function BasicProfile({ user }) {
  const [step, setStep] = useState(1);
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = () => {
    setIsChecked(!isChecked);
  };

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      newPassword: '',
      confirmNewPassword: '',
      existingPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().when(['step', 'isChecked'], {
        is: (step, isChecked) => step === 2 && isChecked,
        then: Yup.string().required('New Password is required'),
      }),
      confirmNewPassword: Yup.string().when(['step', 'isChecked'], {
        is: (step, isChecked) => step === 2 && isChecked,
        then: Yup.string()
          .oneOf([Yup.ref('newPassword')], 'Passwords must match')
          .required('Confirm New Password is required'),
      }),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        if (step === 1 && isChecked) {
          const payload = {
            userId: user?._id,
            existingPassword: values.existingPassword,
          };
          const response = await verifyPassword(payload);
          if (response.success) {
            toast.success('Password Verified');
            setStep(step + 1);
          }
        } else {
          const payload = {
            userId: user?._id,
            name: values?.name,
            newPassword: values?.newPassword,
          };
          const response = await updateProfile(payload);
          if (response.success) {
            const updatedUser = { ...user, name: values.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Profile Updated Successfully');
            resetForm({
              values: { ...values, newPassword: '', confirmNewPassword: '', existingPassword: '' },
            });
            setIsChecked(false);
            setStep(1);
          }
        }
      } catch (error) {
        toast.error(error.response.data.error);
      }
    },
  });

  const isButtonDisabled =
    !formik.dirty ||
    !formik.isValid ||
    (isChecked &&
      step === 2 &&
      (!formik.values.newPassword ||
        formik.values.newPassword !== formik.values.confirmNewPassword));

  return (
    <Box sx={{ mt: 4, mb: 2, width: '100%', maxWidth: 500 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item md={12} xs={12}>
            <CustomFormField label="Name" name="name" fullWidth margin="normal" formik={formik} />
          </Grid>
          <Grid item md={12} xs={12}>
            <CustomFormField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              disabled={true}
              formik={formik}
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <FormControlLabel
              control={<Checkbox checked={isChecked} onChange={handleChange} />}
              label="Change Password"
            />
          </Grid>

          {isChecked && step === 1 ? (
            <>
              <Grid item xs={12}>
                <CustomFormField
                  label="Enter Existing Password"
                  name="existingPassword"
                  type="password"
                  margin="normal"
                  fullWidth
                  formik={formik}
                  isPassword={true}
                />
              </Grid>
            </>
          ) : (
            isChecked &&
            step === 2 && (
              <>
                <Grid item xs={12}>
                  <CustomFormField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    fullWidth
                    margin="normal"
                    formik={formik}
                    isPassword={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomFormField
                    label="Confirm New Password"
                    name="confirmNewPassword"
                    type="password"
                    fullWidth
                    margin="normal"
                    formik={formik}
                    isPassword={true}
                  />

                  {formik.values.confirmNewPassword &&
                    formik.values.newPassword !== formik.values.confirmNewPassword && (
                      <Typography color="error" variant="body1">
                        The passwords do not match
                      </Typography>
                    )}
                </Grid>
              </>
            )
          )}
          <Grid item md={12} xs={12}>
            {step === 1 && isChecked ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                size="lg"
                sx={{ textTransform: 'none', borderRadius: 10 }}
                disabled={!formik.values.existingPassword || formik.isSubmitting}
              >
                Next
              </Button>
            ) : (
              (step === 2 || !isChecked) && (
                <Button
                  variant="contained"
                  color="primary"
                  size="lg"
                  type="submit"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 10,
                    py: 2,
                    maxWidth: { xs: '100%', md: 150 },
                    background: (theme) => theme.palette.grey[300],
                    color: '#fff',
                    background: (theme) =>
                      !(formik.isSubmitting || isButtonDisabled)
                        ? 'linear-gradient(90deg, #FF00B3, #8A2BE2)'
                        : theme.palette.grey[300],
                    '&:hover': {
                      background: (theme) =>
                        !(formik.isSubmitting || isButtonDisabled)
                          ? 'linear-gradient(90deg, #FF00B3, #8A2BE2)'
                          : theme.palette.grey[300],
                    },
                  }}
                  disabled={formik.isSubmitting || isButtonDisabled}
                >
                  Save Changes
                </Button>
              )
            )}
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
const SubscriptionPlanAndUsage = ({ user }) => {
  const router = useRouter();
  const currentPlan = user?.subscriptionPlan;

  return (
    <Card
      key={currentPlan?.id}
      variant="outlined"
      sx={{ mb: 2, backgroundColor: '#F9F9F9', width: { xs: '100%', md: '50%' } }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            {currentPlan?.name}
          </Typography>
          <Chip label="Current Plan" variant="outlined" color="warning" sx={{ borderRadius: 10 }} />
        </Box>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          <strong>Start Date:</strong> {moment(user?.subscriptionStartDate).format('MMMM Do YYYY')}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          <strong>Expiration:</strong> {moment(user?.subscriptionExpiryDate).format('MMMM Do YYYY')}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          <strong>Price:</strong>{' '}
          {currentPlan?.category === 'free'
            ? 'Free'
            : `$ ${currentPlan?.price} ${currentPlan?.category}`}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          <strong>No. of stories:</strong> {user?.numOfStories}
        </Typography>

        <Grid container spacing={1} sx={{ mt: 2 }}>
          {currentPlan?.description.map((desc, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="body2" color="textSecondary">
                - {desc}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={12} md={12}>
            <Typography variant="body" color="textSecondary">
              Ability to purchase:
            </Typography>
          </Grid>
          {currentPlan?.abilityToPurchase.map((step, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="body2" color="textSecondary">
                - {step}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <CardActions>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          spacing={2}
          sx={{ p: 2 }}
        >
          <Button
            variant="contained"
            size="lg"
            sx={{ textTransform: 'none', borderRadius: 10 }}
            onClick={() => router.push(paths.dashboard.pricing)}
          >
            Renew Subscription
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="lg"
            sx={{ textTransform: 'none', borderRadius: 10 }}
            onClick={() => router.push(paths.dashboard.addOns)}
          >
            Unsubscribe
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none', borderRadius: 10 }}
            onClick={() => router.push(paths.dashboard.pricing)}
          >
            Change Plan
          </Button>
        </Stack>
      </CardActions>
      <Divider />
    </Card>
  );
};

export const statusConfig = {
  Pending: { color: 'primary', label: 'Pending' },
  'In Progress': { color: 'warning', label: 'In Progress' },
  Completed: { color: 'success', label: 'Completed' },
  Canceled: { color: 'error', label: 'Canceled' },
};

const Orders = ({ orders }) => {
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleClickOpen = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };
  const excludedStatuses = ['REJECTED', 'CANCELED', 'ERROR'];

  const currentOrders = orders?.filter((order) => !excludedStatuses.includes(order?.status));
  const orderHistory = orders?.filter((order) => excludedStatuses.includes(order?.status));

  const renderOrder = (order) => {
    const { color, label } = statusConfig[order.status] || {
      color: 'default',
      label: order.status.replace(/_/g, ' '),
    };
    return (
      <Card
        key={order.id}
        variant="outlined"
        sx={{ mb: 2, backgroundColor: '#F9F9F9', cursor: 'pointer' }}
        onClick={() => handleClickOpen(order)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" gutterBottom>
              {order?.name}
            </Typography>
            <Box display="flex" alignItems="center">
              <Chip
                color={color}
                label={label.toUpperCase()}
                variant="outlined"
                sx={{ mr: 1, borderRadius: 10 }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {moment(order?.updatedAt).format('LL')}
            </Typography>
          </Box>
        </CardContent>
        <Divider />
      </Card>
    );
  };

  return (
    <Box sx={{ mt: 4, width: '100%', maxWidth: 800 }}>
      {currentOrders?.length > 0 || orderHistory?.length > 0 ? (
        <>
          {currentOrders?.length > 0 && (
            <>
              <Typography variant="h6" mb={2}>
                Current Orders
              </Typography>
              {currentOrders?.map(renderOrder)}
            </>
          )}

          {orderHistory?.length > 0 && (
            <>
              <Typography variant="h6" mt={4} mb={2}>
                Order History
              </Typography>
              {orderHistory?.map(renderOrder)}
            </>
          )}
        </>
      ) : (
        <Typography variant="h3" mt={4} textAlign="center">
          No Order Found
        </Typography>
      )}

      <OrderDetailModal open={open} handleClose={handleClose} selectedOrder={selectedOrder} />
    </Box>
  );
};

export default function UserProfile() {
  const settings = useSettingsContext();
  const { state } = useLocalStorage('user');
  const user = state || getUser();
  const [value, setValue] = useState(0);
  const { data: orders } = useQuery(['getOrders', user?._id], () => getOrdersByUserId(user?._id));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container
      sx={{ maxWidth: '1350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="h2" mb={1}>
        Profile
      </Typography>
      {/* <Typography variant="body" color="textSecondary" sx={{ textAlign: 'center' }}>
        Lorem ipsum dolor sit amet consectetur adipiscing elit <br /> interdum ullamcorper sed
        pharetra sene.
      </Typography> */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <Tabs value={value} onChange={handleChange} centered>
            <Tab label="Basic Profile" />
            <Tab label="Orders" />
            <Tab label="Plan and Usage" />
          </Tabs>
        </Box>

        <Box display="flex" justifyContent="center">
          {value === 0 && <BasicProfile user={user} />}
          {value === 1 && <Orders orders={orders} />}
          {value === 2 && <SubscriptionPlanAndUsage user={user} />}
        </Box>
      </Box>
    </Container>
  );
}
