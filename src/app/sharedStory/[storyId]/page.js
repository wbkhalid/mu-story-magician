import SharedStoryPage from 'src/sections/sharedStory';

export default function Page({ params }) {
  const { storyId } = params;
  return <SharedStoryPage storyId={storyId} />;
}
