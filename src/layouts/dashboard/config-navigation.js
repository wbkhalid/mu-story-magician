import { useEffect, useMemo, useState } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ExtensionIcon from '@mui/icons-material/Extension';
import { useLocalStorage } from 'src/hooks/use-local-storage';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  addOns: <ExtensionIcon />,
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  price: <AttachMoneyIcon />,
  discover: <FindInPageIcon />,
  dashboard: <AutoStoriesIcon />,
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { state } = useLocalStorage('user');
  const user = state;

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        // subheader: 'overview v5.7.0',
        items: [
          { title: 'My Stories', path: paths.dashboard.root, icon: ICONS.dashboard },
          {
            title: 'Create Story',
            path: user?.numOfStories <= 0 ? paths.dashboard.pricing : paths.dashboard.createStory,
            icon: ICONS.price,
          },
          {
            title: 'Discover',
            path: paths.dashboard.discover,
            icon: ICONS.discover,
          },
          {
            title: 'Contact Us',
            path: paths.dashboard.addOns,
            icon: ICONS.addOns,
          },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      // {
      //   subheader: 'management',
      //   items: [
      //     {
      //       title: 'user',
      //       path: paths.dashboard.group.root,
      //       icon: ICONS.user,
      //       children: [
      //         { title: 'four', path: paths.dashboard.group.root },
      //         { title: 'five', path: paths.dashboard.group.five },
      //         { title: 'six', path: paths.dashboard.group.six },
      //       ],
      //     },
      //   ],
      // },
    ],
    [user?.numOfStories]
  );

  return data;
}
