// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  SHARED_STORY: '/sharedStory',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    // root: ROOTS.DASHBOARD,
    root: `${ROOTS.DASHBOARD}/my-stories`,
    pricing: `${ROOTS.DASHBOARD}/pricing`,
    createStory: `${ROOTS.DASHBOARD}/my-stories/new`,
    discover: `${ROOTS.DASHBOARD}/discover`,
    addOns: `${ROOTS.DASHBOARD}/add-ons`,
    profile: `${ROOTS.DASHBOARD}/profile`,
    payment: `${ROOTS.DASHBOARD}/payment`,

    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  sharedStory: (storyId) => `${ROOTS.SHARED_STORY}/${storyId}`,
  success: `/success`,
  cancel: `/cancel`,
};
