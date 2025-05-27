import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import requireAuth from 'src/utils/requireAuth';
import { rewriteImagePrompt } from '../create/route';
import axios from 'axios';
import { analyzeImages } from '../updateCoverphoto/route';
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function POST(req) {
  const { pageText, characters } = await req.json();

  await connectToDatabase();

  try {
    const previousResponse = [pageText];

    const user = await requireAuth(req);

    const prompts = await createIllustrationPrompts(previousResponse, characters);

    const updatedPrompts1 = prompts.map((prompt) => {
      return JSON.parse(prompt.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\d+\. |\n\n\d+\. /gm, ''));
    });

    const simpleParagraphPrompt = await rewriteImagePrompt(updatedPrompts1);
    const allImageLinks = [];

    for (let i = 0; i < 4; i++) {
      try {
        const imageLinks = await generateImages(simpleParagraphPrompt);

        allImageLinks.push(imageLinks.flat());
      } catch (error) {
        console.error(`Error generating images for prompt ${i + 1}:`, error);
      }
    }

    console.log(allImageLinks, 'ImageLinks');
    const analyzedImages = [];

    for (let i = 0; i < allImageLinks.length; i++) {
      console.log(allImageLinks);
      try {
        const result = await analyzeImages(allImageLinks[i], simpleParagraphPrompt[0]);
        analyzedImages.push(result);
      } catch (error) {
        console.error(`Error processing prompt and images for index ${i}:`, error);
        analyzedImages.push(null);
      }
    }

    return NextResponse.json({ success: true, data: analyzedImages }, { status: 200 });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

async function generateImages(simpleParagraphPrompt) {
  const results = [];

  for (const [index, prompt] of simpleParagraphPrompt.entries()) {
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
        await delay(120000);
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

const createIllustrationPrompts = async (previousResponse, characters) => {
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
        content: `You specialize in creating vivid, Pixar-style illustrations for a children's story featuring story characters provided below. This tool focuses on portraying this story.
  
Using established character descriptions and base prompts, you ensure consistency in their appearances, outfits, and expressions across illustrations. Each illustration request will center on the specific scene's context, highlighting character interactions, actions, and the environment. Whenever you generate an image, it will always maintain a consistent visual style and use the base prompts for subject description. For every image generated, you will ensure high resolution and high-quality Pixar 3D animated film style, capturing the essence of the scene with detailed rendering and lifelike textures. The characters should be depicted with the same visual style, proportions, and clothing details as the reference images provided. Unless specifically requested by a user, you will not alter the set outfits of the characters. Always generate the image in aspect ratio 16:9.
  
To ensure consistency and desired output, a specific formula will be used for creating prompts for Stable diffusion image generation model. This formula comprises the following elements, forming a cohesive sentence:
  
1. [Subject Description]: Utilizing the base prompts for all story characters ensuring consistent features, outfits, and appearances in line with reference images. All character descriptions in the base prompt must be fully included in every image prompt.
2. [Environment Description]: Detailing the scene's setting based on user requests or generating an appropriate background if not specified.
3. [Art Style]: Consistently employing high-resolution, Pixar 3D animated film style with detailed rendering.
4. [Color and Light]: Describing main colors and lighting, focusing on bright, soft lights and a warm feel.
5. [Camera Angle and Composition]: Indicating the perspective for the scene, like a bird's-eye view, to enhance the storytelling aspect.
  
**Story_characters:**
  
${characters
  .map(
    (character) => `
${character.name}, ${character.age} years old
Profile: ${character.personality}
Outfit: ${character.outfit}
`
  )
  .join('\n')}
  
**Story_on_each_page:**
  
Page ${1}:
${previousResponse}
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

      results.push(response.trim());
    }
  } catch (error) {
    console.error(
      'Error generating story illustration prompts:',
      error.response ? error.response.data : error.message
    );
  }

  return results;
};
