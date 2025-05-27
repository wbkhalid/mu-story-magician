import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';

export async function POST(req) {
  try {
    const request = await req.json();

    const url = new URL(req.url); // Create a URL object from the request URL
    const queryParams = new URLSearchParams(url.search); // Extract query parameters

    // Retrieve specific query parameters
    const pageText = queryParams.get('pageText');

    if (request.status == 'success') {
      let i = 1;
      console.log(pageText, 'pagetect from query params');

      console.log(i++, 'iiiiiiiii');
      console.log(request?.output, 'after success');
      console.log(request?.meta, 'after success');
      console.log(request?.id, 'after success');
      // const selectedUrls = await analyzeImages(req.output, req.meta.prompt);

      // console.log(selectedUrls);

      // results.push(req.output[selectedUrls - 1]);
    }

    // console.log(results, '***************************************************************');
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    return NextResponse.json({ success: true, req }, { status: 200 });
  } catch (error) {
    console.error('Internal server error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// export const analyzeImages = async (imageUrls, promptText) => {
//   const apiUrl = 'https://api.openai.com/v1/chat/completions';
//   const apiKey = process.env.NEXT_PUBLIC_OPEN_AI_KEY;

//   const requestData = {
//     model: 'gpt-4o-mini',
//     response_format: { type: 'json_object' },
//     messages: [
//       {
//         role: 'user',
//         content: [
//           {
//             type: 'text',
//             text: `Analyse the following 4 AI generated images for the provided prompt.
//             Give rating out of 10 to each and suggest which is the best image for the given prompt.
//             Check characters, scenery, adherence to prompt, art style, etc.
//             Keep your response short, precise and to the point.
//             \n\nPrompt: ${promptText}
//             Your response should be in the following JSON format.\nresult: {best_image: image_number, rating: rating..., reason: reason...}\n\n`,
//           },
//           ...imageUrls.map((imageUrl) => ({
//             type: 'image_url',
//             image_url: { url: imageUrl },
//           })),
//         ],
//       },
//     ],
//     temperature: 1,
//     max_tokens: 735,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//   };

//   const config = {
//     method: 'post',
//     url: apiUrl,
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     data: requestData,
//   };

//   try {
//     const response = await axios(config);
//     const parsedContent = JSON.parse(response.data.choices[0].message.content);
//     const bestImage = parsedContent.result.best_image;
//     return bestImage;
//   } catch (error) {
//     console.error(
//       'Error calling OpenAI API to analyze images:',
//       error.response ? error.response.data : error.message
//     );

//     throw error;
//   }
// };
