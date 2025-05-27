import MyStoriesDetail from 'src/components/my-stories/MyStoriesDetail';
import { getSingleStory } from 'src/apis/create-story';

export async function generateMetadata({ params }) {
  const id = params.id;
  
  try {
    const getSingleStoryData = await getSingleStory(id);
    
    const storyData = getSingleStoryData?.story;
   

    return {
      title: storyData?.title || 'Default Title', 
    };
  } catch (error) {
    console.error("Error fetching story data:", error);
    return {
      title: 'Story Details',
    };
  }
}

export default function Page({ params }) {
  return <MyStoriesDetail id={params.id} />;
}


