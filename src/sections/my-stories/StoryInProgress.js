'use client';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 12,
  p: { xs: 2, md: 4 },
  borderRadius: '1rem',
  width: {
    xs: '90%',
    md: 'auto',
  },
};

const StoryInProgress = ({ inProgressModal, setInProgressModal, message }) => {
  const router = useRouter();

  const handleClose = () => {
    setInProgressModal(false);
  };

  return (
    <Modal
      open={inProgressModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography variant="h3" mb="1.5rem">
          {message?.text1}
        </Typography>
        <Typography variant="body1" color="#95969c" fontSize="1.3rem">
          {message?.text2}
        </Typography>
        <Typography variant="body1" color="#95969c" fontSize="1.3rem">
          {message?.text3}
        </Typography>
        <Button
          sx={{
            textTransform: 'none',
            borderRadius: 10,
            py: 2,
            maxWidth: { md: 150, xs: '100%' },
            mt: '2rem',

            color: '#fff',
            background: (theme) => 'linear-gradient(90deg, #FF00B3, #8A2BE2)',
          }}
          variant="contained"
          disableRipple
          fullWidth
          onClick={() => {
            router.push('/dashboard/my-stories/');
            handleClose();
          }}
        >
          My stories
        </Button>
      </Box>
    </Modal>
  );
};

export default StoryInProgress;
