import axios from 'axios';
import { NextResponse } from 'next/server';
import Story from 'src/models/Story';
import { jsPDF } from 'jspdf';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { uploadPdfToAzureBlob } from 'src/utils/uploadFilesToAzure';
import requireAuth from 'src/utils/requireAuth';
import User from 'src/models/User';
import { v4 as uuidv4 } from 'uuid';
import { QuicksandBold } from 'public/fonts/Quicksand-Bold-normal';
import { QuicksandNormal } from 'public/fonts/Quicksand-Regular-normal';

const updateUserShippingAddress = async (userId, shippingAddress) => {
  try {
    await User.findByIdAndUpdate(userId, { shippingAddress });
    console.log('Shipping address updated successfully');
  } catch (error) {
    console.error('Error updating shipping address:', error);
    throw new Error('Failed to update shipping address');
  }
};

export async function POST(req) {
  const { storyId, shippingAddress } = await req.json();

  console.log(storyId, 'storyId');

  const userAuth = await requireAuth(req);

  await updateUserShippingAddress(userAuth._id, shippingAddress);

  try {
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(`Story with id ${storyId} not found`, { status: 404 });
    }

    const coverPdfUrl = await generateCoverPDF(story?.coverphoto, story?.title, story?.writer);
    const interiorPdfUrl = await generateInteriorPDF(story);
    const accessToken = await getLuluAccessToken();

    const validateCoverId = await validateCoverFile(
      coverPdfUrl,
      accessToken,
      24,
      '0850X0850FCPRECW080CW444GXX'
    );

    console.log(validateCoverId, 'validateCoverId');
    const validateInteriorId = await validateInterior(interiorPdfUrl, accessToken);

    console.log(validateInteriorId, 'validateInteriorId');
    const coverValidationStatus = await getValidationStatusWithDelay(
      `https://api.sandbox.lulu.com/validate-cover/${validateCoverId}/`,
      accessToken
    );
    const interiorValidationStatus = await getValidationStatusWithDelay(
      `https://api.sandbox.lulu.com/validate-interior/${validateInteriorId}/`,
      accessToken
    );

    console.log(
      coverValidationStatus,
      'coverValidationStatus',
      interiorValidationStatus,
      'coverValidationStatus',
      interiorPdfUrl
    );
    let printJobCost;
    if (coverValidationStatus == 'NORMALIZED' && interiorValidationStatus == 'VALIDATED') {
      printJobCost = await getPrintJobCost(accessToken, shippingAddress);
    } else {
      return NextResponse.json({
        success: false,
        message: 'pdf validation failed',
        coverValidationStatus: coverValidationStatus,
        interiorValidationStatus: interiorValidationStatus,
        status: 500,
        accessToken: accessToken,
      });
    }

    return NextResponse.json({
      interiorPdfUrl,
      coverPdfUrl,
      accessToken,
      printJobCost,
      shippingAddress,
      success: true,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message });
  }
}

const generateCoverPDF = async (coverImageUrl, title, writer) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [19, 10.25],
    });

    const coverImageResponse = await fetch(coverImageUrl);
    if (!coverImageResponse.ok) {
      throw new Error('Failed to load cover image');
    }
    const coverImageArrayBuffer = await coverImageResponse.arrayBuffer();
    const coverImageData = new Uint8Array(coverImageArrayBuffer);

    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/logo/Logo.png`;
    const logoResponse = await fetch(logoUrl);
    if (!logoResponse.ok) {
      throw new Error('Failed to load logo image');
    }
    const logoArrayBuffer = await logoResponse.arrayBuffer();
    const logoData = new Uint8Array(logoArrayBuffer);

    const safetyMargin = 0.5;
    const marginBetweenCovers = 1.25;
    const wrapMargin = 0.75;

    const totalAvailableWidth = 19 - 2 * safetyMargin - 2 * wrapMargin;
    const availableCoverWidth = (totalAvailableWidth - marginBetweenCovers) / 2;
    const availableCoverHeight = 10.25 - 2 * safetyMargin - 2 * wrapMargin;

    doc.addFileToVFS('Quicksand-Bold.ttf', QuicksandBold);
    doc.addFont('Quicksand-Bold.ttf', 'Quicksand', 'bold');

    doc.addFileToVFS('Quicksand-Regular.ttf', QuicksandNormal);
    doc.addFont('Quicksand-Regular.ttf', 'Quicksand-normal', 'normal');

    doc.setFillColor(34, 181, 240);
    doc.rect(0, 0, 19, 10.25, 'F');

    doc.setFillColor(2, 14, 126);
    doc.rect(wrapMargin, wrapMargin, 19 - 2 * wrapMargin, 10.25 - 2 * wrapMargin, 'F');

    doc.setFillColor(2, 14, 126);
    doc.rect(
      wrapMargin + safetyMargin,
      wrapMargin + safetyMargin,
      0.5,
      10.25 - 2 * (wrapMargin + safetyMargin),
      'F'
    );

    doc.setFillColor(158, 47, 167);
    doc.rect(
      wrapMargin + safetyMargin + availableCoverWidth + 0.5,
      wrapMargin,
      0.25,
      10.25 - 2 * wrapMargin,
      'F'
    );

    doc.setFillColor(238, 205, 187);
    doc.rect(
      wrapMargin + safetyMargin,
      wrapMargin + safetyMargin,
      availableCoverWidth,
      availableCoverHeight,
      'F'
    );

    doc.setFont('Quicksand', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(68, 68, 68);
    doc.text(
      title,
      wrapMargin + safetyMargin + availableCoverWidth / 2,
      2 * wrapMargin + 2 * safetyMargin,
      { align: 'center', maxWidth: 7 }
    );

    const logoWidth = 3;
    const logoHeight = 0.4;
    doc.addImage(
      logoData,
      'PNG',
      wrapMargin + safetyMargin + availableCoverWidth / 2 - logoWidth / 2,
      wrapMargin + safetyMargin + availableCoverHeight / 2 - logoHeight / 2,
      logoWidth,
      logoHeight
    );

    doc.setFont('Quicksand', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(68, 68, 68);
    doc.text(
      'Tag line',
      wrapMargin + safetyMargin + availableCoverWidth / 2,
      availableCoverHeight - wrapMargin,
      { align: 'center', maxWidth: 7 }
    );

    doc.setFont('Quicksand', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(68, 68, 68);
    doc.text(
      'www.storymagician.ai',
      wrapMargin + safetyMargin + availableCoverWidth / 2,
      wrapMargin + availableCoverHeight,
      { align: 'center', maxWidth: 7 }
    );

    const rightCoverX = wrapMargin + safetyMargin + availableCoverWidth + marginBetweenCovers;
    doc.addImage(
      coverImageData,
      'PNG',
      rightCoverX,
      wrapMargin + safetyMargin,
      availableCoverWidth,
      availableCoverHeight
    );

    doc.setFont('Quicksand', 'bold');
    doc.setFontSize(32);

    const shadowOffsets = [{ x: 0.02, y: 0.02 }];

    shadowOffsets.forEach((offset) => {
      doc.setTextColor(255, 255, 255);
      doc.text(
        title,
        rightCoverX + availableCoverWidth / 2 + offset.x,
        2 * wrapMargin + 2 * safetyMargin + offset.y,
        { align: 'center', maxWidth: 7 }
      );
    });

    doc.setTextColor(252, 133, 68);
    doc.text(title, rightCoverX + availableCoverWidth / 2, 2 * wrapMargin + 2 * safetyMargin, {
      align: 'center',
      maxWidth: 7,
    });

    if (writer) {
      doc.setFontSize(24);

      shadowOffsets.forEach((offset) => {
        doc.setTextColor(255, 255, 255);
        doc.text(
          writer,
          rightCoverX + availableCoverWidth / 2 + offset.x,
          availableCoverHeight + safetyMargin + offset.y,
          { align: 'center', maxWidth: 7 }
        );
      });

      doc.setTextColor(0, 0, 0);
      doc.text(writer, rightCoverX + availableCoverWidth / 2, availableCoverHeight + safetyMargin, {
        align: 'center',
        maxWidth: 7,
      });
    }

    const pdfBuffer = doc.output('arraybuffer');
    const uniqueId = uuidv4();
    const fileUrl = await uploadPdfToAzureBlob(Buffer.from(pdfBuffer), `${uniqueId}.pdf`);

    return fileUrl;
  } catch (error) {
    console.error('Error generating cover PDF:', error);
    throw error;
  }
};

const generateInteriorPDF = async (story) => {
  try {
    const totalWidth = 8.75;
    const totalHeight = 8.75;

    const trimWidth = 8.125;
    const trimHeight = 8.125;

    const safetyMargin = 0.5;
    const bleed = 0.125;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'in',
      format: [totalWidth, totalHeight],
    });

    // Add the Quicksand font to the document
    doc.addFileToVFS('Quicksand-Regular.ttf', QuicksandNormal);
    doc.addFont('Quicksand-Regular.ttf', 'Quicksand', 'normal');

    const drawMargins = () => {
      // doc.setFillColor(255, 255, 255);
      doc.setFillColor(158, 47, 167);
      doc.rect(0, 0, totalWidth, totalHeight, 'F');
      // doc.setFillColor(255, 255, 255);
      doc.setFillColor(2, 14, 126);
      doc.rect(bleed, bleed, totalWidth - 2 * bleed, totalHeight - 2 * bleed, 'F');
      doc.setFillColor(230, 230, 210);
      doc.rect(
        bleed + safetyMargin,
        bleed + safetyMargin,
        trimWidth - safetyMargin - bleed,
        trimHeight - safetyMargin - bleed,
        'F'
      );
    };

    const calculateTextHeight = (doc, text, fontSize, maxWidth) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = doc.internal.getLineHeight() / doc.internal.scaleFactor;
      return lines.length * lineHeight;
    };

    const addTextVerticallyCentered = (doc, text, x, y, maxWidth, pageHeight) => {
      const fontSize = doc.internal.getFontSize();
      const textHeight = calculateTextHeight(doc, text, fontSize, maxWidth);
      const centeredY = y + (pageHeight - textHeight) / 2;
      doc.text(text, x, centeredY, { maxWidth });
    };

    // Add first empty page
    drawMargins();
    doc.addPage();

    // Add second page with title and writer
    drawMargins();

    if (story?.title) {
      doc.setFont('Quicksand', 'normal');
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(story?.title, trimWidth / 2 + bleed, trimHeight / 2.5 + bleed, {
        align: 'center',
        maxWidth: 7,
      });
    }

    if (story?.writer) {
      doc.setFont('Quicksand', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(story?.writer, trimWidth / 2 + bleed, trimHeight - 2 * safetyMargin, {
        align: 'center',
        maxWidth: 7,
      });
    }
    doc.addPage();

    const dedicationPage = story?.dedicationPage;

    if (
      dedicationPage &&
      (dedicationPage?.from || dedicationPage?.message || dedicationPage?.title)
    ) {
      drawMargins();
      doc.addPage();
    }

    if (
      dedicationPage &&
      (dedicationPage?.from || dedicationPage?.message || dedicationPage?.title)
    ) {
      drawMargins();

      if (dedicationPage?.title) {
        doc.setFont('Quicksand', 'normal');
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(dedicationPage?.title, trimWidth / 3 + bleed, trimHeight / 3 + bleed);
      }

      if (dedicationPage?.message) {
        doc.setFont('Quicksand', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(dedicationPage?.message, trimWidth / 3 + bleed, trimHeight / 2.4 + bleed);
      }

      if (dedicationPage?.from) {
        doc.setFont('Quicksand', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(dedicationPage?.from, trimWidth / 3 + bleed, trimHeight / 1.5);
      }
      doc.addPage();
    }

    const pages = story?.pageContent
      ?.map((content) => {
        return [{ image: content?.image }, { page: content?.page }];
      })
      .flat(2);

    for (let i = 0; i < pages?.length; i++) {
      const page = pages[i];

      if (i > 0) {
        doc.addPage();
      }

      drawMargins();

      if (page?.page) {
        const x = 2 * bleed + 2 * safetyMargin;
        const maxWidth = trimWidth - 3 * safetyMargin - bleed;
        const y = bleed + safetyMargin;
        doc.setFontSize(16);
        doc.setFont('Quicksand', 'normal');
        doc.setLineHeightFactor(2.5);
        doc.setTextColor(68, 68, 68);
        addTextVerticallyCentered(doc, page?.page, x, y, maxWidth, trimHeight);
      }

      if (page?.image) {
        const imageResponse = await fetch(page?.image);
        if (!imageResponse.ok) {
          throw new Error('Failed to load image');
        }
        const imageArrayBuffer = await imageResponse.arrayBuffer();
        const imageData = new Uint8Array(imageArrayBuffer);
        doc.addImage(
          imageData,
          'PNG',
          bleed + safetyMargin,
          bleed + safetyMargin,
          trimWidth - safetyMargin - bleed,
          trimHeight - safetyMargin - bleed
        );
      }
    }

    // Add "-- The End --" page
    doc.addPage();
    drawMargins();
    doc.rect(
      bleed + safetyMargin,
      bleed + safetyMargin,
      trimWidth - safetyMargin - bleed,
      trimHeight - safetyMargin - bleed,
      'F'
    );

    doc.setFont('Quicksand', 'normal');
    doc.setFontSize(24);
    doc.setTextColor(68, 68, 68);
    doc.text('-- The End --', trimWidth / 2 + bleed, trimHeight / 2 + bleed, { align: 'center' });

    // Add empty page after "-- The End --"
    doc.addPage();
    drawMargins();

    const pdfBuffer = doc.output('arraybuffer');
    const uniqueId = uuidv4();
    const fileUrl = await uploadPdfToAzureBlob(Buffer.from(pdfBuffer), `${uniqueId}.pdf`);

    return fileUrl;
  } catch (error) {
    console.error('Error generating interior PDF:', error);
    throw error;
  }
};

const getLuluAccessToken = async () => {
  const tokenUrl =
    'https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token';
  const clientId = process.env.NEXT_PUBLIC_LULU_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_LULU_CLIENT_SECRET;

  console.log(clientId, clientSecret);

  const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const authHeader = `Basic ${base64Credentials}`;

  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');

  console.log(authHeader, 'authHeader');

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.log(error.message, error);
    console.error('Error generating Lulu access token from function:', error.message);
    throw new Error(`Failed to generate Lulu access token: ${error.message}`);
  }
};

const getPrintJobCost = async (accessToken, shippingAddress) => {
  const apiUrl = 'https://api.sandbox.lulu.com/print-job-cost-calculations/';
  const authToken = 'Bearer ' + accessToken;


  const requestData = JSON.stringify({
    line_items: [
      {
        page_count: 24,
        pod_package_id: '0850X0850FCPRECW080CW444GXX',
        quantity: shippingAddress.quantity,
      },
    ],

    shipping_address: {
      city: shippingAddress.city,
      country_code: shippingAddress.countryCode,
      postcode: shippingAddress.postCode,
      state_code: shippingAddress.stateCode,
      street1: shippingAddress.street,
      phone_number: shippingAddress.phone,
    },
    shipping_option: shippingAddress?.shippingLevel,
  });

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        Authorization: authToken,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.log(error.response.data.shipping_address.detail.errors, 'dfjsajh');
    console.error('Error getting print job cost:', error.message, error.response?.data);
    throw new Error('Failed to get print job cost');
  }
};

const validateCoverFile = async (coverFileUrl, authToken, interiorPageCount, podPackageId) => {
  try {
    const options = {
      method: 'POST',
      url: 'https://api.sandbox.lulu.com/validate-cover',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      data: {
        source_url: coverFileUrl,
        pod_package_id: podPackageId,
        interior_page_count: interiorPageCount,
      },
    };

    const response = await axios(options);

    if (response.status === 200) {
      console.log('Cover file validation result:', response.data);
    } else if (response.status === 201) {
      console.log(
        'Request successfully created. The processing result might be pending:',
        response.data
      );
    } else {
      console.error(`Unexpected status code: ${response.status}`);
      console.error('Response Body:', response.data);
    }

    return response.data.id;
  } catch (error) {
    console.error('Error:', error);
  }
};

const validateInterior = async (pdfUrl, authToken) => {
  const data = JSON.stringify({
    source_url: pdfUrl,
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.sandbox.lulu.com/validate-interior/',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.id;
  } catch (error) {
    console.error('Error validating interior:', error);
  }
};

const getValidationStatus = async (requestUrl, authToken) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: requestUrl,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data.status;
  } catch (error) {
    console.error('Error fetching validation status:', error);
    throw error;
  }
};

const getValidationStatusWithDelay = (url, token) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const status = await getValidationStatus(url, token);
      resolve(status);
    }, 5000);
  });
};
