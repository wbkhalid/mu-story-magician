'use client';
import HTMLFlipBook from 'react-pageflip';
import './book.css';
import { Page } from './Book';

const DesktopBook = ({
  flipBookRef,
  handlePageFlip,
  handlePageFlipNonEdit,
  isEdit,
  pages,
  fontSize,
}) => {
  return (
    <HTMLFlipBook
      width={500}
      height={500}
      className="flipbook-container"
      maxShadowOpacity={0.4}
      showCover={true}
      drawShadow={false}
      ref={flipBookRef}
      onFlip={isEdit ? handlePageFlip : handlePageFlipNonEdit}
    >
      {pages.flat(2).map((page, index) => (
        <Page key={index} {...page} fontSize={fontSize} /> 
      ))}
    </HTMLFlipBook>
  );
};

export default DesktopBook;
