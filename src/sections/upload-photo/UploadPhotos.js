'use client';
import { useState } from 'react';
import { Box, Button, Card, Container, Typography, useTheme } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { alpha } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';


const UploadPhotos = () => {
  const settings = useSettingsContext();
  const theme = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    if (uploadedFiles.length + acceptedFiles.length <= 20) {
      setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop,
    maxFiles: 20 - uploadedFiles.length,
    disabled: uploadedFiles.length >= 20,
  });

  const fileCount = uploadedFiles.length;

  const renderUploadMessage = () => {
    if (fileCount === 0) {
      return (
        <Typography variant="body1" color="#95969c" fontSize="2rem">
          Click to browse or <br /> drag and drop your photos here
        </Typography>
      );
    } else if (fileCount >= 1 && fileCount <= 9) {
      return (
        <>
          <Typography variant="subtitle1" color="#95969c" fontSize="1.5rem" mb="1rem">
            Great! Uploaded {fileCount} photos. Please upload at least {10 - fileCount} more photos.
          </Typography>
          <Typography color="#95969c" fontSize="1.5rem">
            Click to browse or <br /> drag and drop your photos here
          </Typography>
        </>
      );
    } else if (fileCount >= 10 && fileCount <= 20) {
      return (
        <>
          <Typography variant="subtitle1" color="#95969c" fontSize="1.5rem">
            Great! Uploaded {fileCount} photos.
          </Typography>
          <Typography color="#95969c" fontSize="1.5rem">
            Let’s continue with creating your story!
          </Typography>
        </>
      );
    } else {
      return (
        <Typography variant="body1" color="#95969c" fontSize="1.5rem">
          You have reached the maximum limit
        </Typography>
      );
    }
  };

  return (
    <Box
    // sx={{ position: 'relative' }}
    >
      {/* <img
        src="/assets/bg-patterns.png"
        style={{ position: 'absolute', top: 0, right: '-1%', zIndex: -1, height: '60rem' }}
      /> */}
    <Container maxWidth={false} sx={{ maxWidth:'1350px' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h2">Create story</Typography>
          <Typography color="#797979" fontSize="2rem">
            Main character photos
          </Typography>
          <Typography color="#797979" fontSize="2rem">
            Let’s make Paris the hero!
          </Typography>
          <Typography textAlign="center" fontSize="1.5rem">
            Please provide 10-20 photos of Paris. High quality images will ensure great results.
          </Typography>

          <Card sx={{ p:{xs:1,md:3}, mt: 2, width: '90%' }}>
            <Card sx={{ px: {xs:1,md:3}, py: 4}}>
              <Box
                {...getRootProps()}
                border="1px dashed #e2e6ea"
                borderRadius="1rem"
                textAlign="center"
                p={1}
                sx={{ cursor: uploadedFiles.length >= 20 ? 'not-allowed' : 'pointer' }}
              >
                <input {...getInputProps()} disabled={uploadedFiles.length >= 20} />
                {renderUploadMessage()}
              </Box>
            </Card>

            <Typography variant="subtitle1" mt={3}>
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

            <Button
              sx={{
                textTransform: 'none',
                borderRadius: 10,
                py: 2,
                maxWidth: { md: 150, xs: '100%' },
                mt: '2rem',
                display: fileCount < 10 || fileCount > 20 ? 'none' : 'block',
              }}
              variant="contained"
              disableRipple
              fullWidth
              disabled={fileCount < 10 || fileCount > 20}
              onClick={() => console.log(uploadedFiles)}
            >
              Next
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default UploadPhotos;
