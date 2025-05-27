import { Box, Button, Card, Modal, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 12,
  p: 2,
  borderRadius: '1rem',
  width: {
    xs: '90%',
    md: '60%',
  },
};

const PersonilizePhotosModal = ({ openPersonilizePhotos, setOpenPersonilizePhotos, formik }) => {
  const onDrop = (acceptedFiles) => {
    if (formik.values.personalizedPhotos.length + acceptedFiles.length <= 20) {
      formik.setFieldValue('personalizedPhotos', [
        ...formik.values.personalizedPhotos,
        ...acceptedFiles,
      ]);
    }
  };

  const handlePersonalizeImages = (formik) => {
    setOpenPersonilizePhotos(false);
    formik.setFieldValue('statndardAIphotos', false);
  };
  const handlePrevious = (formik) => {
    setOpenPersonilizePhotos(false);
    formik.setFieldValue('personalizedPhotos', []);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop,
    maxFiles: 20 - formik.values.personalizedPhotos.length,
    disabled: formik.values.personalizedPhotos.length >= 20,
  });

  const fileCount = formik.values.personalizedPhotos.length;

  const renderUploadMessage = () => {
    if (fileCount === 0) {
      return (
        <Typography variant="body1" color="#95969c" fontSize="1.2rem">
          Click to browse or <br /> drag and drop your photos here
        </Typography>
      );
    } else if (fileCount >= 1 && fileCount <= 9) {
      return (
        <>
          <Typography variant="subtitle1" color="#95969c" fontSize="1.2rem" mb="1rem">
            Great! Uploaded {fileCount} photos. Please upload at least {10 - fileCount} more photos.
          </Typography>
          <Typography color="#95969c" fontSize="1.2rem">
            Click to browse or <br /> drag and drop your photos here
          </Typography>
        </>
      );
    } else if (fileCount >= 10 && fileCount <= 20) {
      return (
        <>
          <Typography variant="subtitle1" color="#95969c" fontSize="1.2rem">
            Great! Uploaded {fileCount} photos.
          </Typography>
          <Typography color="#95969c" fontSize="1.2rem">
            Let’s continue with creating your story!
          </Typography>
        </>
      );
    } else {
      return (
        <Typography variant="body1" color="#95969c" fontSize="1.2rem">
          You have reached the maximum limit
        </Typography>
      );
    }
  };

  return (
    <Modal
      open={openPersonilizePhotos}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box display="flex" flexDirection="column" alignItems="center" p={2}>
          <Typography variant="h3">Create story</Typography>
          <Typography color="#797979" sx={{ fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}>
            Main character photos
          </Typography>
          <Typography color="#797979" sx={{ fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}>
            Let’s make Paris the hero!
          </Typography>
          <Typography
            textAlign="center"
            sx={{ fontSize: { xs: '.9rem', sm: '1rem', md: '1.8rem' } }}
          >
            Please provide 10-20 photos of Paris.
            <br /> High quality images will ensure great results.
          </Typography>

          <Box sx={{ p: 1, mt: 2, width: '100%' }}>
            <Card sx={{ p: 3 }}>
              <Box
                {...getRootProps()}
                border="1px dashed #e2e6ea"
                borderRadius="1rem"
                textAlign="center"
                p={2}
                sx={{
                  cursor: formik.values.personalizedPhotos.length >= 20 ? 'not-allowed' : 'pointer',
                }}
              >
                <input
                  {...getInputProps()}
                  disabled={formik.values.personalizedPhotos.length >= 20}
                />
                {renderUploadMessage()}
              </Box>
            </Card>

            <Typography variant="subtitle1" mt={2}>
              Tips for the best results:
            </Typography>
            <ul style={{ color: '#797979' }}>
              <li>
                Photos should be different from each other (lighting, location, time of day, etc.).
              </li>
              <li>Photos should show only one person in them.</li>
              <li>
                Use photos that show a range of expressions, eyes looking in different directions.
              </li>
              <li>Photos with minimal or no makeup, and without sunglasses.</li>
            </ul>
            <Box display="flex" gap={1}>
              <Button
                sx={{
                  textTransform: 'none',
                  borderRadius: 10,
                  py: 2,
                  maxWidth: { md: 150, xs: '100%' },
                  mt: '2rem',
                }}
                variant="contained"
                disableRipple
                fullWidth
                disabled={fileCount < 10 || fileCount > 20}
                onClick={() => handlePersonalizeImages(formik)}
              >
                Next
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderRadius: 10,
                  py: 2,
                  maxWidth: { md: 150, xs: '100%' },
                  mt: '2rem',
                }}
                onClick={() => handlePrevious(formik)}
              >
                Previous
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PersonilizePhotosModal;
