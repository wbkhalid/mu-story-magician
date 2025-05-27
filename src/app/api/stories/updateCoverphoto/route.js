import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import requireAuth from 'src/utils/requireAuth';
import { getBestImage, rewriteImagePrompt } from '../create/route';
import axios from 'axios';
import Story from 'src/models/Story';
import { processIllustrations } from 'src/services/illustrationService';
import { uploadImageToAzureBlob } from 'src/utils/uploadStoryImagestoazure';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getPageTexts = (pageContent) => {
  if (!Array.isArray(pageContent)) {
    return [];
  }
  return pageContent.map((page) => page.page);
};

export function normalizeData(data) {
  const normalizedArray = [];

  data.forEach((item) => {
    const key = Object.keys(item)[0];
    const obj = item[key];

    if (obj) {
      const normalized = {
        'Subject Description':
          obj.subject_description ||
          obj['Subject Description'] ||
          obj['SubjectDescription'] ||
          obj['1. Subject Description'],
        'Environment Description':
          obj.environment_description ||
          obj['Environment Description'] ||
          obj['EnvironmentDescription'] ||
          obj['2. Environment Description'],
        'Art Style': obj.art_style || obj['Art Style'] || obj['ArtStyle'] || obj['3. Art Style'],
        'Color and Light':
          obj.color_and_light ||
          obj['Color and Light'] ||
          obj['ColorAndLight'] ||
          obj['4. Color and Light'],
        'Camera Angle and Composition':
          obj.camera_angle_and_composition ||
          obj['Camera Angle and Composition'] ||
          obj['CameraAngleAndComposition'] ||
          obj['5. Camera Angle and Composition'],
      };

      normalizedArray.push(normalized);
    }
  });

  return normalizedArray.slice(0, 5);
}

export async function POST(req) {
  const { storyId } = await req.json();

  await connectToDatabase();

  try {
    const user = await requireAuth(req);

    const story = await Story.findById(storyId);

    if (!story) {
      return NextResponse.json({ error: 'story not found' }, { status: 403 });
    }

    const analyzedImages = await processIllustrations(story);

    return NextResponse.json({ success: true, data: analyzedImages.flat() }, { status: 200 });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function generateImages(simpleParagraphPrompts) {
  const results = [];

  for (const [index, prompt] of simpleParagraphPrompts.entries()) {
    const data = {
      key: process.env.NEXT_PUBLIC_MODELS_LAB_API_KEY,
      model_id: process.env.NEXT_PUBLIC_MODELS_LAB_MODEL_ID,
      num_inference_steps: '31',
      enhance_prompt: 'no',
      prompt: `In 3D animated movie style. Disney Pixar style. ${prompt}`,
      negative_prompt:
        'ugly, bad res, blur, boring, low quality, medium quality, blurry, drawn, extra limbs, missing limbs, extra legs, missing legs, extra ears, amateur quality, vague shapes, vague texture, wrong perspective, ugly, dowdy style, low resolution, bad hands, disfigured, deformed, poorly drawn, mutilated, lowpoly',
      width: '1024',
      height: '1024',
      samples: '4',
      safety_checker: 'no',
      temp: 'no',
      seed: null,
      guidance_scale: 7.5,
      webhook: 'https://story-magician-ai-dev.web.musketeers.dev/api/stories/webhook',
      track_id: null,
      use_karras_sigmas: 'yes',
      scheduler: process.env.NEXT_PUBLIC_MODELS_LAB_SCHEDULER,
      tomesd: 'yes',
    };

    const config = {
      method: 'post',
      url: 'https://modelslab.com/api/v6/images/text2img',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(data),
    };

    try {
      let response = await axios.request(config);
      const imageUrls = () => {
        if (response.data.status === 'processing') {
          console.log('Processing images...');
          return response.data.future_links;
        } else if (response.data.status === 'success') {
          return response.data.output;
        }
      };

      let urls = imageUrls();
      if (!urls) {
        await delay(100000);
        response = await axios.request(config);
        urls = imageUrls();
      }

      results.push(urls || []);
    } catch (error) {
      console.error(
        'Error generating image:',
        error.response ? error.response.data : error.message
      );
    }
  }

  return results;
}

export const createIllustrationPromptForCover = async (characters, outlines) => {
  const results = [];
  const prompt = JSON.stringify({
    model: 'gpt-3.5-turbo',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that outputs JSON.',
      },
      {
        role: 'user',
        content: `You specialise in creating vivid, Pixar-style illustrations for a children's story featuring story characters provided below. This tool focuses on portraying this story.

Using established character descriptions and base prompts, you ensure consistency in their appearances, outfits and expressions across illustrations. Each illustration request will center on the specific scene's context, highlighting character interactions, actions and the environment. Whenever you generates an image, it will always maintain a consistent visual style and use the base prompts for subject description. For every image generated, you will ensure high resolution and high-quality Pixar 3D animated film style, capturing the essence of the scene with detailed rendering and lifelike textures. The characters should be depicted with the same visual style, proportions, and clothing details as the reference images provided. Unless specifically requested by a user, you will not alter the set outfits of the characters. Always generate the image in aspect ratio 16:9.

To ensure consistency and desired output, a specific formula that will be used for creating prompts for Stable diffusion image generation model. This formula comprises the following elements, forming a cohesive sentence:

1. [Subject Description]: Utilizing the base prompts for all story characters ensuring consistent features, outfits, and appearances in line with reference images. All character descriptions in the base prompt must be fully included in every image prompt.
2. [Environment Description]: Detailing the scene's setting based on user requests or generating an appropriate background if not specified.
3. [Art Style]: Consistently employing high-resolution, Pixar 3D animated film style with detailed rendering.
4. [Color and Light]: Describing main colors and lighting, focusing on bright, soft lights and a warm feel.
5. [Camera Angle and Composition]: Indicating the perspective for the scene, like a bird's-eye view, to enhance the storytelling aspect.
**Story_characters:**
  
${characters.map(
  (character) => `
${character.name}, ${character.age} years old
Profile: ${character?.personality}
Outfit: ${character?.outfit}
`
)}
**Story_outlines:**
${outlines}
`,
      },
    ],
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY}`,
      'Content-Type': 'application/json',
    },
    data: prompt,
  };

  try {
    let response = await axios.request(config);
    if (response && response.data.choices.length > 0) {
      response = response.data.choices[0].message.content;

      if (response.startsWith('```json') && response.endsWith('```')) {
        response = response.replace(/^```json\s*/, '').replace(/```$/, '');
      }

      return response;
    }
  } catch (error) {
    console.error(
      'Error generating cover image illustration prompts:',
      error.response ? error.response.data : error.message
    );
  }

  console.log(results.length);
  return results;
};

export const createIllustrationPromptForPages = async (characters, pageTexts) => {
  const results = [];

  const generatePrompt = (characters, pages) => {
    return JSON.stringify({
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that outputs JSON.',
        },
        {
          role: 'user',
          content: `You specialise in creating vivid, Pixar-style illustrations for a children's story featuring story characters provided below. This tool focuses on portraying this story.

Using established character descriptions and base prompts, you ensure consistency in their appearances, outfits and expressions across illustrations. Each illustration request will center on the specific scene's context, highlighting character interactions, actions and the environment. Whenever you generates an image, it will always maintain a consistent visual style and use the base prompts for subject description. For every image generated, you will ensure high resolution and high-quality Pixar 3D animated film style, capturing the essence of the scene with detailed rendering and lifelike textures. The characters should be depicted with the same visual style, proportions, and clothing details as the reference images provided. Unless specifically requested by a user, you will not alter the set outfits of the characters. Always generate the image in aspect ratio 16:9.

To ensure consistency and desired output, a specific formula that will be used for creating prompts for Stable diffusion image generation model. This formula comprises the following elements, forming a cohesive sentence:

1. [Subject Description]: Utilizing the base prompts for all story characters ensuring consistent features, outfits, and appearances in line with reference images. All character descriptions in the base prompt must be fully included in every image prompt.
2. [Environment Description]: Detailing the scene's setting based on user requests or generating an appropriate background if not specified.
3. [Art Style]: Consistently employing high-resolution, Pixar 3D animated film style with detailed rendering.
4. [Color and Light]: Describing main colors and lighting, focusing on bright, soft lights and a warm feel.
5. [Camera Angle and Composition]: Indicating the perspective for the scene, like a bird's-eye view, to enhance the storytelling aspect.
**Story characters:**
${characters
  .map(
    (character) => `
${character.name}, ${character.age} years old
Profile: ${character?.personality}
Outfit: ${character?.outfit}
Physical features: ${character?.physicalFeatures}
`
  )
  .join('\n')}

**Story on each page:**
${pages.map((text, index) => `Page ${index + 1}: ${text}`).join('\n')}
`,
        },
      ],
    });
  };

  for (let i = 0; i < pageTexts.length; i += 3) {
    const chunk = pageTexts.slice(i, i + 3);
    const prompt = generatePrompt(characters, chunk);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
      data: prompt,
    };

    try {
      let response = await axios.request(config);
      if (response && response.data.choices.length > 0) {
        response = response.data.choices[0].message.content;

        if (response.startsWith('```json') && response.endsWith('```')) {
          response = response.replace(/^```json\s*/, '').replace(/```$/, '');
        }

        results.push(response);
      }
    } catch (error) {
      console.error(
        'Error generating cover image illustration prompts:',
        error.response ? error.response.data : error.message
      );
    }
  }

  return results;
};

export const analyzeImages = async (imageUrls, promptText) => {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.NEXT_PUBLIC_OPEN_AI_KEY;

  const requestData = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyse the following 4 AI generated images for the provided prompt. 
            Give rating out of 10 to each and suggest which is the best image for the given prompt. 
            Check characters, scenery, adherence to prompt, art style, etc. 
            Keep your response short, precise and to the point. 
            \n\nPrompt: ${promptText}  
            Your response should be in the following JSON format.\nresult: {best_image: image_number, rating: rating..., reason: reason...}\n\n`,
          },
          ...imageUrls.map((imageUrl) => ({
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'low' },
          })),
        ],
      },
    ],
    temperature: 1,
    max_tokens: 735,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  const config = {
    method: 'post',
    url: apiUrl,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    data: requestData,
  };

  try {
    const response = await axios(config);
    const parsedContent = JSON.parse(response.data.choices[0].message.content);

    const bestImage = getBestImage(parsedContent);
    const result = await uploadImageToAzureBlob(imageUrls[bestImage - 1])
      .then((url) => {
        console.log('Image successfully uploaded:', url);
        return url;
      })
      .catch((error) => {
        console.error('Failed to upload image:', error.message);
        throw error;
      });
    return result;
  } catch (error) {
    console.error(
      'Error calling OpenAI API to analyze images:',
      error.response ? error.response.data : error.message
    );

    throw error;
  }
};
