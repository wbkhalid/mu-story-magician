import { rewriteImagePrompt, analyzeImages } from 'src/app/api/stories/create/route';
import {
  createIllustrationPromptForCover,
  createIllustrationPromptForPages,
  generateImages,
  getPageTexts,
} from 'src/app/api/stories/updateCoverphoto/route';

export const processIllustrations = async (story) => {
  try {
    const prompt = await createIllustrationPromptForCover(story.characters, story.outlines);

    const updatedPrompt = JSON.parse(
      prompt.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\d+\. |\n\n\d+\. /gm, '')
    );

    const pageTexts = getPageTexts(story.pageContent);

    const promptFromAllPages = await createIllustrationPromptForPages(story.characters, pageTexts);
    const updatedPrompts1 = promptFromAllPages.map((prompt) => {
      return JSON.parse(prompt.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\d+\. |\n\n\d+\. /gm, ''));
    });

    const allPrompts = [...updatedPrompts1, updatedPrompt];
    console.log(allPrompts, 'allPromptsallPromptsallPrompts');

    const simpleParagraphPrompts = await rewriteImagePrompt(allPrompts);

    console.log(simpleParagraphPrompts, 'simpleParagraphPrompts');

    const ImageLinks = await generateImages(simpleParagraphPrompts);

    const analyzedImages = [];
    console.log(ImageLinks.length);

    for (let i = 0; i < ImageLinks.length; i++) {
      try {
        const result = await analyzeImages(ImageLinks[i], simpleParagraphPrompts[i]);
        analyzedImages.push(result);
      } catch (error) {
        console.error(`Error processing prompt and images for index ${i}:`, error);
        analyzedImages.push(null);
      }
    }

    console.log(analyzedImages);

    return analyzedImages.flat();
  } catch (error) {
    console.error('Error processing illustrations:', error);
    throw new Error('Failed to process illustrations');
  }
};
