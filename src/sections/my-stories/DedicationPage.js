'use client';
import { Box, Button, Card, Grid, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSettingsContext } from 'src/components/settings';
import { CustomFormField, CustomFormTextarea } from 'src/components/story-cards/customFormFields';
import { useRouter } from 'next/navigation';

const validationSchema = Yup.object({
  title: Yup.string().required('* Required'),
  message: Yup.string().required('* Required'),
  from: Yup.string().required('* Required'),
});

const DedicationPage = () => {
  const settings = useSettingsContext();
  const router= useRouter()

  const formik = useFormik({
    initialValues: {
      title: '',
      message: '',
      from: '',
    },
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
  <Container maxWidth={false} sx={{ maxWidth:'1350px' }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h2" mb="1.5rem">
          Create story
        </Typography>
        <Typography color="#95969c" fontSize="1.5rem">
          Dedication page (Optional)
        </Typography>

        <Card
          sx={{
            p: 4,
            mt: '2rem',
            width: { xs: '100%', md: '70%' },
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box mb="2rem">
                  <CustomFormField name="title" label="Title" formik={formik} isWidth={true} />
                </Box>
                <Box mb="2rem">
                  <CustomFormTextarea name="message" label="Message" formik={formik} />
                </Box>
                <Box mb="2rem">
                  <CustomFormField name="from" label="From" formik={formik} isWidth={true} />
                </Box>

                <Box display='flex' gap={1} alignItems='cnter' mt={2}>
                  <Button
                    type="submit"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 10,
                      py: 2,
                      maxWidth: { md: 150, xs: '100%' },
                    }}
                    variant="contained"
                    disableRipple
                    fullWidth
                  >
                    Next
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    disableRipple
                    sx={{
                      textTransform: 'none',
                      borderRadius: 10,
                      py: 2,
                      maxWidth: { md: 150, xs: '100%' },
                    }}
                    onClick={() => router.push('/dashboard/my-stories/new')}
                  >
                    Previous
                  </Button>
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
                    {formik.values[field]}
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </Container>
  );
};

export default DedicationPage;
