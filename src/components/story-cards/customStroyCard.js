import * as React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { useRouter } from 'next/navigation';
import { Typography } from '@mui/material';

export default function CustomStoryCard({
  story,
  cursor = '',
  clickable = true,
  isPublic = false,
}) {
  const router = useRouter();
  const handleStoryDetails = (id) => {
    isPublic
      ? router.push(`/dashboard/discover/${id}`)
      : router.push(`/dashboard/my-stories/${id}`);
  };
  return (
    <Card
      sx={{
        borderRadius: '0px',
        cursor: cursor,
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      onClick={() => {
        clickable && handleStoryDetails(story?._id);
      }}
    >
      <CardMedia
        component="img"
        image={story?.coverphoto?.bestImageUrl}
        alt={story?.title}
        sx={{ width: '100%', height: 'auto' }}
      />
      <Typography
        sx={{
          ...headingStyle,
          color: '#ff5a00',
          top: '15%',
          lineHeight: '100%',
          fontSize: clickable ? '1rem' : '2rem',
        }}
      >
        {story?.title}
      </Typography>
      <Typography
        sx={{
          ...headingStyle,
          top: '80%',
          color: '#000',
          fontSize: clickable ? '.8rem' : '1.3rem',
        }}
      >
        {story?.writer}
      </Typography>
    </Card>
  );
}

const headingStyle = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  fontWeight: '700',
  width: '100%',
  textAlign: 'center',
  textShadow:
    '0 0 2px #fff, 0 0 2px #fff, 0 0 6px #fff,0 0 8px #fff,0 0 12px #fff, 0 0 15px #fff, 0 0 10px #fff',
  fontFamily: 'Quicksand !important',
  padding: '1rem',
};

CustomStoryCard.propTypes = {
  story: PropTypes.object,
};
