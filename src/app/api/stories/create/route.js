import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import axios from 'axios';
import Story from 'src/models/Story';
import axiosRetry from 'axios-retry';
import { fixJsonData } from 'src/auth/context/jwt/utils';
import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';
import nodemailer from 'nodemailer';
import AddOns from 'src/models/AddOns';
import { processIllustrations } from 'src/services/illustrationService';
import { uploadImageToAzureBlob } from 'src/utils/uploadStoryImagestoazure';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED' ||
      error.response.status === 429
    );
  },
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function POST(req) {
  await connectToDatabase();

  try {
    const userAuth = await requireAuth(req);

    const formData = await req.formData();

    const mainCharacter = formData.get('mainCharacter');
    const ageInYears = formData.get('ageInYears');
    const hairColor = formData.get('hairColor');
    const hairLength = formData.get('hairLength');
    const ethnicity = formData.get('ethnicity');
    const storyIdea = formData.get('storyIdea');
    const readerAge = formData.get('readerAge');
    const writingStyle = formData.get('writingStyle');
    const storyType = formData.get('storyType');
    const language = formData.get('language');
    const standardAIphotos = formData.get('standardAIphotos');
    const personalizedPhotos = formData.get('personalizedPhotos');
    const dedicationPage = JSON.parse(formData.get('dedicationPage'));

    const userId = formData.get('userId');
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.numOfStories < 1) {
      return NextResponse.json(
        { error: 'You do not have enough stories. Please upgrade your plan.' },
        { status: 404 }
      );
    }
    if (!mainCharacter || !storyIdea || !readerAge) {
      return NextResponse.json(
        { error: 'Main Character, Story Idea, and Reader Age are required' },
        { status: 400 }
      );
    }

    let data = JSON.stringify({
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that outputs JSON.',
        },
        {
          role: 'user',
          content: `I want you to act as a world-class children’s book author. You will come up with entertaining personalised stories that are engaging, imaginative and captivating for the audience. It can be fairy tales, educational stories or any other type of stories which has the potential to capture people’s attention and imagination.Depending on the target audience, you may choose specific themes or topics for your storytelling session e.g., if it’s children then you can talk about animals; If it’s adults then history-based tales might engage them better etc. If its a young child, keep the story gentle and engaging that introduces simple concepts. If its a child above 7 years, then explore more complex themes, thrilling adventures. Ensure stories, their themes, their simplicity and complexity and their content are suitable for target audience’s age. Ensure the language to be accessible for the audience’s age, using simpler words and shorter sentences for younger audience specifically. Provide more descriptive language where required. Enrich the vocabulary and add vivid sensory details where required. Keep the plot simpler and more straightforward, keeping it easy to follow for kids age 6 years and younger. Make the plot a bit more intricate to challenge 7 and above age’s imagination. Incorporate a strong relevant message into the story.Analyse the following information which is key input to create the captivating personalised story around the main character based on the story idea.Main character: ${mainCharacter}, ${ageInYears}, ${hairLength}, ${hairColor} hair, ${ethnicity} Story idea: ${storyIdea} Language: ${language}, Story type: ${storyType}, Reader age: ${readerAge} years old, Writing style: ${writingStyle}, Create Story title Create Story outline ending the story in total 6 outline points.Create characters for this story. For each character, provide these succinctly: their profile information (name, age, gender, etc.), details of their outfits, physical features, and personalities. Include details of the character(s) mentioned above.The response you write should strictly be in the following format:Story title: <story title> Story outline:<1st outline><2nd outline><3rd outline>..Story characters summary as one text string ensuring no character detail is missed in this summary text: <story characters summary>Respond in JSON format: result: {title, outline array, characters array, characters summary} Example response: {'result': {'title': 'abc','outline': ['outline1','outline2','outline3','outline4','outline5','outline6'],'characters': [{'name': 'Troy','gender': 'boy','age': 8,'hairColor': 'black','hairLength': long`,
          outfit: 'casual clothes',
          physicalFeatures:
            "black hair, long hair','personality': 'curious, determined, imaginative'},{'name': 'Troy’s parents','outfit': 'casual clothes','physicalFeatures': 'black hair','personality': 'supportive'}], “charactersSummary”: “Troy:, Troy is an 8-year-old boy with long black hair who wears casual clothes. He is curious, determined, and imaginative. Troy's Parents: Troy's parents have black hair, wear casual clothes, and are supportive.” }}",
        },
      ],
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    const openAIResult = response.data;

    if (openAIResult && openAIResult.choices && openAIResult.choices.length > 0) {
      let response = openAIResult.choices[0].message.content;

      response = response.replace(/^```json\s*/, '').replace(/```$/, '');

      try {
        response = fixJsonData(response);

        const parsed_response = JSON.parse(response);

        const title = parsed_response.result.title;
        const outlines = parsed_response.result.outline;
        const characters = parsed_response.result.characters;
        const characterSummary = parsed_response.result['characters summary'];

        const previousResponse = await createStoryText(outlines, title, characters);
        const prompts = await createIllustrationPrompts(previousResponse, characters);

        const updatedPrompts1 = prompts.map((prompt) => {
          return JSON.parse(
            prompt.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\d+\. |\n\n\d+\. /gm, '')
          );
        });

        const simpleParagraphPrompts = await rewriteImagePrompt(updatedPrompts1);

        const ImageLinks = await generateImages(simpleParagraphPrompts);
        await delay(150000);

        const analyzedImages = [];

        for (let i = 0; i < ImageLinks.length; i++) {
          try {
            const result = await analyzeImages(ImageLinks[i], simpleParagraphPrompts[i]);
            analyzedImages.push(result);
          } catch (error) {
            console.error(`Error processing prompt and images for index ${i}:`, error);
            analyzedImages.push(null);
          }
        }

        const storyData = {
          title,
          outlines,
          coverphoto: {},
          type: 'private',
          characters: characters.map((char) => ({
            name: char.name,
            age: char.age,
            gender: char.gender,
            description: char.description,
          })),
          pageContent: previousResponse.flat().map((pageContent, index) => ({
            imageUrls: analyzedImages.flat()[index].urls,
            bestImageUrl: analyzedImages.flat()[index].bestImageUrl,
            page: pageContent,
          })),
          dedicationPage: dedicationPage,
          user: user._id,
        };
        const analyzedImagesForCover = await processIllustrations(storyData);

        console.log(storyData);

        console.log(analyzedImagesForCover, 'analyzedImagesForCoveranalyzedImagesForCover');

        storyData.coverphoto.urls = analyzedImagesForCover[0].urls || [];
        storyData.coverphoto.bestImageUrl = analyzedImagesForCover[0].bestImageUrl || '';
        console.log(storyData);
        const story = new Story(storyData);
        console.log(storyData);

        const allObjectsValid =
          story &&
          Array.isArray(story.pageContent) &&
          story.pageContent.length === 12 &&
          story.pageContent.every(
            (item) =>
              item &&
              Array.isArray(item.imageUrls) &&
              item.imageUrls.length > 3 &&
              item.page &&
              item.bestImageUrl
          ) &&
          story.coverphoto &&
          story.coverphoto.bestImageUrl
            ? true
            : false;

        if (allObjectsValid) {
          if (user.numOfStories > 0) {
            user.numOfStories -= 1;
          } else {
            console.warn('User has no remaining stories.');
            return NextResponse.json(
              { success: false, error: 'You have no remaining stories.' },
              { status: 400 }
            );
          }

          try {
            await story.save();
            sendEmailToUser(user, story.title);
            if (dedicationPage !== null || personalizedPhotos) {
              const addOnToRemove = await AddOns.findOne({
                name: 'Add Dedication page and personalized photos',
              });
              if (!addOnToRemove) {
                return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
              }

              console.log('User add-ons before removal:', user.addOns);

              user.addOns = user.addOns.filter((addOnId) => !addOnId.equals(addOnToRemove._id));

              console.log('User add-ons after removal:', user.addOns);
            }
            await user.save();

            const updatedUser = await User.findById(user._id)
              .populate({
                path: 'subscriptionPlan',
                select: '-createdAt -updatedAt -version',
              })
              .populate({
                path: 'addOns',
                select: '-createdAt -updatedAt -version ',
              })
              .select('-createdAt -updatedAt -version -password')
              .exec();

            const returnResponse = {
              success: true,
              story,
              updatedUser,
            };

            return NextResponse.json(returnResponse, { status: 201 });
          } catch (error) {
            console.error('Error saving story:', error);
            return NextResponse.json(
              {
                success: false,
                error: 'There was an issue saving your story. Please try again later.',
              },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Error in processing request. Please try again.',
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return NextResponse.error('Error parsing JSON');
      }
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

async function generateImages(simpleParagraphPrompt) {
  console.log('generating story images from text');
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
      webhook:
        'https://story-magician-ai-dev.web.musketeers.dev/api/stories/webhook?pageText=page text',
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
        await delay(60000);
        response = await axios.request(config);
        urls = imageUrls();
      }

      results.push(urls || []);
    } catch (error) {
      console.error(
        'Error generating image:',
        error.response ? error.response.data : error.message
      );
      return NextResponse.json({ error: 'Error generating image:', error, success: false });
    }
  }

  return results;
}

const createStoryText = async (outlines, title, characters) => {
  console.log('creating story text');
  const results = [];

  while (results.flat().length !== 12) {
    results.length = 0;

    for (const outline of outlines) {
      const data = JSON.stringify({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that outputs JSON.',
          },
          {
            role: 'user',
            content: `You now need to create story in steps. Guidelines to follow strictly: 
              - Story needs to be based on outline you have generated.
              - Analyse the audience age and ensure number of words generated per page matches the word count requirement provided below.
              - Use the following guidelines as you are composing the story based on target audience age group.
              **Age 0-3:** Create a short, simple, and soothing story suitable for toddlers. Focus on repetitive language, vibrant imagery, and basic concepts like colors, animals, or bedtime routines.
              **Age 4-6:** Craft a short story for preschoolers. Keep it sweet and engaging with simple language. If it's a bedtime story, consider incorporating a magical dream sequence during naptime with vivid sensory details to captivate their young imagination.
              **Age 7-10:** Develop an imaginative and adventurous story for early-grade readers. Include relatable characters and a plot that sparks curiosity. Keep the language accessible, but introduce slightly more complexity and challenge for this age group.
              **Age 10-12:** Create an exciting and adventurous story suitable for upper elementary readers. Introduce more complex themes, characters, and plot twists. Engage the reader's imagination with vivid descriptions and a compelling storyline, while ensuring the language is still accessible for their age.
              - Story content for each item in outline should be 2 pages. Example, first item in outline is to be spread into 2 pages. Second item in outline is to be spread across further 2 more pages. And so on till last outline.
              - Ensure story content for the current outline does not cover aspects of the story that may interfere with content of other outlines. End story content for current outline so that it does not cover content that will be used for next outline.
              - Ensure word count requirements are followed strictly. For example, if age is 8, then word count of story content for page 1 should be approximately 40 words and word count of story content for page 2 should also be approximately 40 words. Each page's story content can go to a maximum of 50 words but it must not exceed 50 words.
              Age 0-3 - generate story content for each outline approximately 10 words per page.
              Age 4-6 - generate story content for each outline approximately 20 words per page.
              Age 7-10 - generate story content for each outline approximately 40 words per page.
              Age 10-12 - generate story content for each outline approximately 150 words per page.
              Based on the above provided information and instructions, story title, story characters and story outline that you created, continue the story for the provided outline. Split the content logically into two pages per outline. Ensure you are meeting word count requirement based on age of the reader by referencing table above. Example if age is 11, then word count per page is 150 words. The response you write should strictly be in the following format:
              Page 1: <story content>
              Page 2: <story content>
              Story_title: ${title},
              Story_outline: ${JSON.stringify(outlines)},
              Story_characters: ${JSON.stringify(characters)},
              Story_generated so far: ${JSON.stringify(results)},
              Outline_to_continue_story_for_next: ${JSON.stringify(outline)},
              Respond in JSON format:
              result: {page array},
              Example response: {"result": ["After the final whistle blew and the celebrations died down, John realized the true meaning of success. It wasn't just about winning games or trophies, but about the journey he had taken with his team.", "John understood that hard work and teamwork were the foundation of their success. Without dedication, perseverance, and unity, they would not have achieved their goal. He was grateful for the lessons he had learned on the field."]} Another example response: {"result": ["As John drifted off to sleep, he pictured himself scoring the winning goal in a packed stadium, the crowd cheering his name. The thrill of victory filled him with excitement and motivation to keep chasing his dream.", "In his dream, John dribbled past defenders with ease, showing off his skills and agility. He felt the adrenaline rush as he approached the goal, ready to take the shot that would define his soccer career."]}`,
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
        data: data,
      };

      try {
        let response = await axios.request(config);
        if (response && response.data.choices.length > 0) {
          response = response.data.choices[0].message.content;

          const jsonStartIndex = response.indexOf('{');
          const jsonEndIndex = response.lastIndexOf('}') + 1;
          const jsonContent = response.substring(jsonStartIndex, jsonEndIndex);
          response = fixJsonData(jsonContent);
          const generatedStory = JSON.parse(response);
          results.push(generatedStory.result);
        }
      } catch (error) {
        console.error(
          'Error generating story:',
          error.response ? error.response.data : error.message
        );

        if (error.code === 'ECONNABORTED' || (error.response && error.response.status === 524)) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retry attempt ${retryCount + 1} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return createStoryText(outlines, title, characters);
        }
      }
    }
  }

  return results;
};

const createIllustrationPrompts = async (previousResponse, characters) => {
  console.log('creating Image Prompts');
  const results = [];
  for (let pageIndex = 0; pageIndex < previousResponse.length; pageIndex++) {
    const pages = previousResponse[pageIndex];
    for (let contentIndex = 0; contentIndex < pages.length; contentIndex++) {
      const pageContent = pages[contentIndex];
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
  
Page ${pageIndex + 1}:
${pageContent}
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
    }
  }

  return results;
};

export const rewriteImagePrompt = async (updatedPrompts1) => {
  console.log('rewriting Image Prompt');
  const results = [];

  for (const prompt of updatedPrompts1) {
    const data = {
      model: 'gpt-3.5-turbo',
      response_format: { type: 'text' },
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that outputs text descriptions in a concise format.',
        },
        {
          role: 'user',
          content: `You are a master artist, well-versed and artistic terminology with a vast vocabulary for being able to describe visually things that you see. I'm going to give you an image prompt.

Analyse this prompt. Then rewrite this prompt in precise and concise format so it can be forwarded to AI image generation program called Stable Diffusion.

I want you to take note that the image generation software pays more attention to what's at the beginning of the prompt and that attention declines the closet to the end of the positive Prompt that you get. The formatting may look something like this: [main character or focus of the image], [lighting style, shot style, and color], [other aesthetics like mood, emotion, peripheral subject matter), [possible artists or art styles]

Keep character physical details, but you can remove any unnecessary details. Too many details confuses the AI image generation program. Keep details that you think are important, and rest can be removed.

Order matters-words near the front of your prompt are weighted more heavily than the things at the end of your prompt. Keep the prompt precise and concise in a paragraph format.
          Example result short prompts for you to understand:
In 3d animated movie style. Disney pixar style. Sunlit bedroom. Lucy young girl with long black hair wears a cute pink dress and a small blue backpack. Next to her is Lucy's mother Clara, age 30, short brown hair. The room is filled with toys and bathed in morning light streaming through the window. Morning feel.

In 3d animated movie style. Disney pixar style. Stella, a 20-year-old with short brown hair and blue eyes, silver space suit. Cosmo, her companion, sports messy red hair, freckles, and a green space suit. Set against the boundless expanse of space, their shimmering suits twinkle with starlight as they embark on their intergalactic cosmic adventure. Around them, toddlers are depicted snuggled in cozy blankets, joining the duo in their cosmic escapade. Bright, soft lights illuminate the cosmic setting. The dynamic composition frames Stella and Cosmo amidst the toddlers and blankets, conveying the anticipation and excitement of their cosmic journey.
          Prompt to rewrite: ${JSON.stringify(prompt)}`,
        },
      ],
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
      data: data,
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
        'Error generating illustration prompt:',
        error.response ? error.response.data : error.message
      );
    }
  }
  return results;
};

const sendEmailToUser = async (userDetail, storyTitle) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com.au',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL,
      pass: process.env.NEXT_PUBLIC_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `StoryMagician.ai <${process.env.NEXT_PUBLIC_EMAIL}>`,
    to: userDetail.email,
    subject: 'Your personalized storybook is ready! Start Reading Today!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Story Created</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
          @media screen {
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 400;
              src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
            }
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 700;
              src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
            }
          }
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
          }
          table,
          td {
            mso-table-rspace: 0pt;
            mso-table-lspace: 0pt;
          }
          img {
            -ms-interpolation-mode: bicubic;
          }
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
          div[style*="margin: 16px 0;"] {
            margin: 0 !important;
          }
          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          table {
            border-collapse: collapse !important;
          }
          a {
            color: #1a82e2;
          }
          img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
          }
        </style>
      </head>
      <body style="background-color: #f6f0fc;">
  
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" bgcolor="#f6f0fc">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 20px 0;">
                    <img src="cid:logo" alt="StoryMagician.ai Logo" width="200px" style="display: block;"/>
                  </td>             
                </tr>
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">     
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Your personalized storybook is ready!</h1>
                  </td>
                </tr>
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                    <p style="margin: 0;">Hi,</p>
                    <p style="margin: 0;">Great news! Your storybook has been created, and it’s ready for you to enjoy!</p>
                    <p style="margin: 0;">We’re delighted to bring your story to life. Get ready to dive into a world of adventure, fun, and excitement. Every page is filled with colorful illustrations and captivating tales designed just for you.</p>
                    <p style="margin: 0;">Click the link below to start your journey and explore your unique story:</p>
                    <p style="margin: 0;"><strong>Title: ${storyTitle}</strong></p>
                  </td>
                </tr>
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                  <table border="0" cellpadding="0" cellspacing="0">
                     <tr>
                        <td align="center" style="border-radius: 40px;">
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/my-stories/" target="_blank" 
                            style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #FF00B3; background-image: linear-gradient(90deg, #FF00B3, #8A2BE2);">
                            View Your Storybook
                          </a>
                        </td>
                      </tr>
                  </table>

                  </td>
                </tr>
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                    <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                    <p style="margin: 0;"><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/my-stories/" target="_blank">${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/my-stories</a></p>
                  </td>
                </tr>
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                    <p style="margin: 0;">Cheers,<br> Story Magician</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'Logo.png',
        path: `${process.env.NEXT_PUBLIC_BASE_URL}/logo/Logo.png`,
        cid: 'logo',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

export const analyzeImages = async (imageUrls, promptText) => {
  console.log('analyze images');
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.NEXT_PUBLIC_OPEN_AI_KEY;

  let requestCount = 0;
  const maxRequestsBeforeDelay = 3;
  const delayDuration = 60000;

  async function processImageUrls(urls) {
    const results = {
      bestImageUrl: '',
      urls: [],
    };
    for (let i = 0; i < urls.length; i += 4) {
      const batchUrls = urls.slice(i, i + 4);

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
              ...batchUrls.map((imageUrl) => ({
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
        console.log(parsedContent, 'parsedContentparsedContentparsedContent');

        const bestImage = getBestImage(parsedContent);

        const uploadPromises = batchUrls.map(async (url) => {
          try {
            const uploadedUrl = await uploadImageToAzureBlob(url);
            results.urls.push(uploadedUrl);
          } catch (error) {
            console.error('Failed to upload image:', error.message);
          }
        });

        await Promise.all(uploadPromises);

        results.bestImageUrl = results.urls[bestImage - 1];
      } catch (error) {
        console.error(
          'Error calling OpenAI API to analyze images:',
          error.response ? error.response.data : error.message
        );
        throw error;
      }

      requestCount++;
      if (requestCount % maxRequestsBeforeDelay === 0) {
        await delay(delayDuration);
      }
    }

    return results;
  }

  return processImageUrls(imageUrls);
};

export function getBestImage(response) {
  if (response.best_image !== undefined) {
    return response.best_image;
  }

  if (response.result && response.result.best_image !== undefined) {
    return response.result.best_image;
  }

  if (response.results && Array.isArray(response.results)) {
    return response.best_image;
  }

  return null;
}
