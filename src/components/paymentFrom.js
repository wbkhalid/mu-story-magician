'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  stripeCharge,
  stripeChargeForAddsOn,
  stripeChargeForHardCoverBook,
} from 'src/apis/pricing';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { usePayment } from 'src/context/paymentContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { printStoryBook, updateOrderStatus } from 'src/apis/printStoryBook';
import StoryInProgress from 'src/sections/my-stories/StoryInProgress';
import { trusted } from 'mongoose';
import { getSingleUserData } from 'src/apis/getSingeUserData';
import { Button, Card, Divider, Grid, Paper, Typography } from '@mui/material';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const { state } = useLocalStorage('user');
  const router = useRouter();
  const paymentData = JSON.parse(sessionStorage.getItem('paymentData'));
  console.log(paymentData);
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(false);
  const [showModal, setShowModal] = useState(false);

  let accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!stripe || !elements) {
      setError('Failed to load payment provider.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card details are incomplete.');
      setLoading(false);
      return;
    }

    try {
      const { error, token } = await stripe.createToken(cardElement);

      if (error) {
        setError(error.message);
      } else {
        let response;
        try {
          if (paymentData.type === 'subscription') {
            response = await stripeCharge(
              paymentData.slug,
              paymentData.amount,
              token,
              state._id,
              paymentData.name,
              paymentData.numOfStories,
              accessToken
            );
          } else if (paymentData.type === 'addsOn') {
            response = await stripeChargeForAddsOn(
              paymentData.name,
              paymentData.amount,
              paymentData.quantity,
              token,
              state._id,
              accessToken
            );
          } else if (paymentData.type === 'printBook') {
            response = await stripeChargeForHardCoverBook(
              paymentData.name,
              paymentData.amount,
              paymentData.quantity,
              token,
              state._id,
              accessToken
            );
          }
          if (!response.success) {
            throw new Error('Failed to process payment. Please try again.');
          }
          if (response.success && paymentData.type == 'printBook') {
            const printBookInfo = JSON.parse(localStorage.getItem('printBookInfo'));

            const payload = {
              contact_email: state?.email,
              external_id: response?.orderId,
              line_items: [
                {
                  printable_normalization: {
                    cover: {
                      source_url: printBookInfo?.coverPdfUrl,
                    },
                    interior: {
                      source_url: printBookInfo?.interiorPdfUrl,
                    },
                    pod_package_id: process.env.NEXT_PUBLIC_LULU_POD_PACKAGE_ID,
                  },
                  quantity: printBookInfo?.shippingAddress?.quantity,
                  title: printBookInfo?.storyTitle || 'Print a hard cover book',
                },
              ],
              production_delay: 120,
              shipping_address: {
                city: printBookInfo?.shippingAddress?.city,
                country_code: printBookInfo?.shippingAddress?.countryCode,
                name: printBookInfo?.shippingAddress?.name,
                phone_number: printBookInfo?.shippingAddress?.phone,
                postcode: printBookInfo?.shippingAddress?.postCode,
                state_code: printBookInfo?.shippingAddress?.stateCode,
                street1: printBookInfo?.shippingAddress?.street,
              },
              shipping_level: printBookInfo?.shippingAddress?.shippingLevel,
            };

            const printStoryResponse = await printStoryBook(accessToken, {
              accessToken: printBookInfo.accessToken,
              ...payload,
            });

            if (printStoryResponse.status.name == 'CREATED') {
              console.log(response);
              const payload = {
                status: printStoryResponse.status.name,
                dropShipId: printStoryResponse.dropship_profile_id,
                shippingLevel: printStoryResponse.shipping_level,
                orderId: printStoryResponse.id,
                contactEmail: printStoryResponse.contact_email,
              };
              const orderResponse = await updateOrderStatus(response.orderId, payload, accessToken);
              if (orderResponse.success) {
                console.log('order updated successfully');
                const updatedUser = await getSingleUserData(state?._id);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
              setShowModal(true);
            }
          }

          toast.success('Payment successful!');
          const updatedUser = await getSingleUserData(state?._id);
          localStorage.setItem('user', JSON.stringify(updatedUser));

          paymentData.type !== 'printBook' && router.back();
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          setError('Payment failed. Please try again.');
          setRetry(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Button
        onClick={() => router.back()}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: '#6772e5',
        }}
      >
        &larr; Back
      </Button>
      <Card>
        <Grid container spacing={1}>
          <Grid item xs={12} md={5}>
            <Paper style={{ padding: '20px', borderRadius: '5px' }}>
              <Typography variant="h4" textAlign={'center'} mb={2}>
                Payment Information
              </Typography>

              <Typography sx={{ lineHeight: '2' }}>
                <strong>Name:</strong> {paymentData?.name}
              </Typography>
              <Typography sx={{ lineHeight: '2' }}>
                <strong>Amount:</strong> {paymentData?.amount && `$ ${paymentData?.amount}`}
              </Typography>
            </Paper>
          </Grid>
          <Grid item sx={{ md: 1, xs: 1 }}>
            <Divider orientation="vertical" flexItem style={{ height: '100%' }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: '20px', borderRadius: '5px' }}>
              <Typography variant="h4" textAlign={'center'} mb={2}>
                Card Details
              </Typography>
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  style={{ width: '100%' }}
                  disabled={!stripe || loading}
                  sx={{ background: 'linear-gradient(90deg, #FF00B3, #8A2BE2)', color: '#fff' }}
                >
                  {loading
                    ? 'Processing...'
                    : `Pay ${paymentData?.amount && `$ ${paymentData?.amount}`}`}
                </Button>
                {retry && (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="secondary"
                    style={{ width: '100%', marginTop: '10px' }}
                    disabled={loading}
                  >
                    Retry Payment
                  </Button>
                )}
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Card>

      <StoryInProgress
        inProgressModal={showModal}
        setInProgressModal={setShowModal}
        message={{
          text1:
            'Exciting! Your book is being created! We’ll send you an email when it is ready with order tracking details.',
          text2: '',
          text3: ' This usually takes around 1-2 weeks.',
        }}
      />
    </div>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
