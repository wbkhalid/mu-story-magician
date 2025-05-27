'use client';
import HTMLFlipBook from 'react-pageflip';
import './book.css';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import React, { useEffect, useRef, useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { speakText, stopSpeaking } from 'src/utils/textTospeech';
import DesktopBook from './DesktopBook';
import MobileBook from './MobileBook';
import useMediaQuery from '@mui/material/useMediaQuery';
import LaptopBook from './LaptopBook';

export const Page = React.forwardRef(
  ({ title, text, image, dedication, className, pageNumber, dedicationId, fontSize }, ref) => {
    return (
      <Box className={`demoPage ${className}`} ref={ref} sx={{ position: 'relative' }}>
        {title && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {title}
          </Box>
        )}
        {dedication && (
          <Box
            bgcolor="#f5f5dc"
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            p={{ xs: '1rem', md: '2rem' }}
            sx={{
              borderRight: { xs: 'none', md: dedicationId === 1 ? '1px solid black' : 'none' },
            }}
          >
            {dedication}
          </Box>
        )}
        {text && (
          <Box
            bgcolor="#f5f5dc"
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography className="book_text" sx={{ fontSize: fontSize }}>
              {text}
            </Typography>
          </Box>
        )}
        {image && (
          <Box>
            <img src={image} alt={title} />
          </Box>
        )}
        <Box
          sx={{
            position: 'absolute',
            bottom: '.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Typography sx={{ fontSize: { xs: '.5rem', md: '.9rem' }, color: '#000' }}>
            {pageNumber}
          </Typography>
        </Box>
      </Box>
    );
  }
);

const Book = ({
  singleBookData,
  setCurrentlyOpenedPage,
  setSinglePageContent,
  pagesContent,
  updatePagesContent,
  isEdit = false,
  updatedImagesLoading = false,
}) => {
  const desktopFlipBookRef = useRef(null);
  const laptopFlipBookRef = useRef(null);
  const mobileFlipBookRef = useRef(null);
  const [canFlip, setCanFlip] = useState(true);
  const [fontSize, setFontSize] = useState('1.2rem');
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const dedication = singleBookData?.dedicationPage;
  const hasDedication = dedication?.title || dedication?.message || dedication?.from;
  const totalPages = singleBookData?.pageContent?.flat()?.length * 2 + (hasDedication ? 4 : 2);
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('1336'));
  const isLaptop = useMediaQuery((theme) => theme.breakpoints.up('md'));

  useEffect(() => {
    if (isEdit && updatedImagesLoading) {
      setCanFlip(false);
    } else {
      setCanFlip(true);
    }
  }, [isEdit, updatedImagesLoading]);

  useEffect(() => {
    const disableMouseEvents = (e) => {
      if (isEdit && updatedImagesLoading) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    if (isEdit && updatedImagesLoading) {
      document.addEventListener('mousedown', disableMouseEvents, true);
      document.addEventListener('mouseup', disableMouseEvents, true);
    } else {
      document.removeEventListener('mousedown', disableMouseEvents, true);
      document.removeEventListener('mouseup', disableMouseEvents, true);
    }

    return () => {
      document.removeEventListener('mousedown', disableMouseEvents, true);
      document.removeEventListener('mouseup', disableMouseEvents, true);
    };
  }, [isEdit, updatedImagesLoading]);

  const handlePageFlip = (e) => {
    let pageIndex = e.data;
    setCurrentPage(pageIndex);
    setCurrentlyOpenedPage(pageIndex);
    const contentIndex = Math.floor((pageIndex - 1) / 2) - (hasDedication ? 1 : 0);
    setSinglePageContent(pagesContent[contentIndex]?.page || '');
    updatePagesContent(contentIndex, pagesContent[contentIndex]?.page || '');
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    }
  };

  const handlePageFlipNonEdit = (e) => {
    setCurrentPage(e.data);
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    }
  };

  const handlePrevPage = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    }
    if (isDesktop) {
      desktopFlipBookRef?.current?.pageFlip()?.flipPrev();
    } else if (isLaptop) {
      laptopFlipBookRef?.current?.pageFlip()?.flipPrev();
    } else {
      mobileFlipBookRef?.current?.pageFlip()?.flipPrev();
    }
  };

  const handleNextPage = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    }
    if (isDesktop) {
      desktopFlipBookRef?.current?.pageFlip()?.flipNext();
    } else if (isLaptop) {
      laptopFlipBookRef?.current?.pageFlip()?.flipNext();
    } else {
      mobileFlipBookRef?.current?.pageFlip()?.flipNext();
    }
  };

  const pagesData = singleBookData?.pageContent?.map((content, index) => {
    return [
      { image: content?.bestImageUrl, pageNumber: index * 2 + 1 },
      { text: content?.page, pageNumber: index * 2 + 2 },
    ];
  });

  const hasLongPageContent = singleBookData?.pageContent?.some((obj) => obj.page.length > 400);

  useEffect(() => {
    if (hasLongPageContent) {
      if (isDesktop) {
        setFontSize('1rem');
      } else if (isLaptop) {
        setFontSize('.8rem');
      } else {
        setFontSize('0.6rem');
      }
    } else {
      if (isDesktop) {
        setFontSize('1.2rem');
      } else if (isLaptop) {
        setFontSize('1rem');
      } else {
        setFontSize('.8rem');
      }
    }
  }, [singleBookData,isDesktop,isLaptop]);

  useEffect(() => {
    if (isReading) {
      const onSpeechEnd = () => {
        setIsReading(false);
      };

      const pageContent = singleBookData?.pageContent[Math.floor(currentPage / 2)]?.page || '';

      const content = currentPage == 0 ? singleBookData?.title : pageContent;
      speakText(content, onSpeechEnd);
    }
  }, [isReading, currentPage]);

  useEffect(() => {
    return () => {
      if (isReading) {
        stopSpeaking();
        setIsReading(false);
      }
    };
  }, [isReading, stopSpeaking, setIsReading]);

  const handleReadButtonClick = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      const pageContent = singleBookData?.pageContent[Math.floor(currentPage / 2)]?.page || '';
      const content = currentPage == 0 ? singleBookData?.title : pageContent;
      speakText(content);
      setIsReading(true);
    }
  };

  const pages = [
    {
      title: (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <img
            src={singleBookData?.coverphoto?.bestImageUrl}
            alt="Cover"
            style={{ width: '100%', height: '100%' }}
          />
          <h1 className="cover-title">{singleBookData?.title}</h1>
          <h1 className="cover-name">{singleBookData?.writer}</h1>
        </Box>
      ),
    },
  ];

  if (hasDedication) {
    pages.push(
      {
        dedication: <Box />,
        dedicationId: 1,
      },
      {
        dedication: (
          <Box width="100%">
            <Typography
              variant="h4"
              sx={{ textAlign: 'center', mb: '.5rem', fontSize: { xs: '1rem', lg: '1.5rem' } }}
            >
              {dedication?.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: 'center', mb: '3rem', fontSize: { xs: '.8rem', lg: '1rem' } }}
            >
              {dedication?.message}
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: 'right', fontSize: { xs: '.8rem', lg: '1rem' } }}
            >
              {` ${dedication?.from}`}
            </Typography>
          </Box>
        ),
        dedicationId: 2,
      }
    );
  }

  pages.push(pagesData, { title: '-  The End  -', className: 'end-page' });

  return (
    <Box width="100%">
      <Box display="flex" alignItems="center" justifyContent="center" gap={2} width={'100%'}>
        <IconButton
          aria-label="previous"
          onClick={handlePrevPage}
          disableRipple
          sx={{
            ...iconButon,
            opacity: !canFlip || currentPage === 0 ? 0 : 1,
          }}
          disabled={currentPage === 0 || !canFlip}
        >
          <ChevronLeftIcon sx={{ fontSize: { xs: '1rem', md: '2rem' } }} />
        </IconButton>
        <Box className="display_desktop_book" justifyContent="center" width="100%">
          <DesktopBook
            flipBookRef={desktopFlipBookRef}
            handlePageFlip={handlePageFlip}
            handlePageFlipNonEdit={handlePageFlipNonEdit}
            isEdit={isEdit}
            pages={pages}
            fontSize={fontSize}
          />
        </Box>
        <Box className="display_laptop_book" justifyContent="center" width="100%">
          <LaptopBook
            flipBookRef={laptopFlipBookRef}
            handlePageFlip={handlePageFlip}
            handlePageFlipNonEdit={handlePageFlipNonEdit}
            isEdit={isEdit}
            pages={pages}
            fontSize={fontSize}
          />
        </Box>

        <Box display={{ xs: 'flex', md: 'none' }} justifyContent="center" mt="2rem">
          <MobileBook
            flipBookRef={mobileFlipBookRef}
            handlePageFlip={handlePageFlip}
            handlePageFlipNonEdit={handlePageFlipNonEdit}
            isEdit={isEdit}
            pages={pages}
            fontSize={fontSize}
          />
        </Box>

        <IconButton
          aria-label="next"
          display="flex"
          onClick={handleNextPage}
          disableRipple
          sx={{
            ...iconButon,
            opacity: !canFlip || currentPage === totalPages - 1 ? 0 : 1,
          }}
          disabled={currentPage === totalPages - 1 || !canFlip}
        >
          <ChevronRightIcon sx={{ fontSize: { xs: '1rem', md: '2rem' } }} />
        </IconButton>
      </Box>

      {!isEdit && (
        <Box p={5} display={{ xs: 'flex', sm: 'flex' }} alignItems="center" justifyContent="center">
          <Box
            sx={{
              borderRadius: '20px',
              border: '1px solid #E3E3E3',
              padding: '10px 20px',
              gap: '20px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              width: { xs: '300px', md: '350px' },
            }}
          >
            <IconButton
              aria-label={isReading ? 'stop reading' : 'read to me'}
              onClick={handleReadButtonClick}
              disableRipple
              sx={{
                ...iconButon,
              }}
            >
              {isReading ? (
                <StopIcon sx={{ fontSize: { xs: '1rem', md: '2rem' } }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: { xs: '1rem', md: '2rem' } }} />
              )}
            </IconButton>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}
            >
              Read to me
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const iconButon = {
  bgcolor: '#d9d9d9',
  color: '#fff',
  borderRadius: '50%',
  width: { xs: '25px', md: '40px' },
  height: { xs: '25px', md: '40px' },
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    opacity: 0.8,
  },
};

export default Book;
