import { getPublicStories, getSingleStory } from 'src/apis/create-story';
import Discovered from 'src/components/discovered-stories/Discovered';

export async function generateMetadata({ params }) {
  const id = params.id;
  
  try {
    const getDiscoveredStory = await getSingleStory(id);
    
    const storyData = getDiscoveredStory?.story;
    console.log(storyData.title,"discovered")

   

    return {
      title: storyData?.title || 'Default Title', 
    };
  } catch (error) {
    console.error("Error fetching story data:", error);
    return {
      title: 'Discovered Stories',
    };
  }
}

export default function Page({ params }) {
  return <Discovered id={params.id} />;
}
