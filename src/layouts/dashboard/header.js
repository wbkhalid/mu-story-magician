import PropTypes from 'prop-types';
import { useState } from 'react';

import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import { useTheme } from '@mui/material/styles';
import { Button, Container, Typography } from '@mui/material';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
import { bgBlur } from 'src/theme/css';
import { useRouter } from 'src/routes/hooks';

import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import { NAV, HEADER } from '../config-layout';
import AccountPopover from '../common/account-popover';
import { paths } from 'src/routes/paths';
import { useNavData } from './config-navigation';
import HeaderNav from '../common/HeaderNav';
import Link from 'next/link';

export default function Header({ onOpenNav }) {
  const theme = useTheme();
  const router = useRouter();
  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const isNavMini = settings.themeLayout === 'mini';
  const lgUp = useResponsive('up', 'lg');
  const offset = useOffSetTop(HEADER.H_DESKTOP);
  const offsetTop = offset && !isNavHorizontal;
  const navData = useNavData();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const renderContent = (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      {lgUp ? (
        <Logo />
      ) : (
        <IconButton onClick={handleDrawerToggle}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      {lgUp && (
        <Stack direction="row" alignItems="center" spacing={9}>
          <Button
            sx={{ textTransform: 'none', borderRadius: 10 }}
            size="lg"
            variant="contained"
            onClick={() => router.push(paths.dashboard.pricing)}
            disableRipple
          >
            Upgrade Plan
          </Button>{' '}
          <HeaderNav data={navData} direction={'row'} />
        </Stack>
      )}

      <AccountPopover />
    </Stack>
  );

  return (
    <>
      <AppBar
        sx={{
          height: HEADER.H_MOBILE,
          zIndex: theme.zIndex.appBar + 1,
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          transition: theme.transitions.create(['height'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(lgUp && {
            height: HEADER.H_DESKTOP,
            ...(offsetTop && {
              height: HEADER.H_DESKTOP_OFFSET,
            }),
            ...(isNavHorizontal && {
              width: 1,
              bgcolor: 'background.default',
              height: HEADER.H_DESKTOP_OFFSET,
            }),
            ...(isNavMini && {
              width: `calc(100% - ${NAV.W_MINI + 1}px)`,
            }),
          }),
        }}
      >
        <Toolbar
          sx={{
            height: 1,
            px: { lg: 5 },
          }}
        >
       <Container maxWidth={false} sx={{ maxWidth:'1350px' }}>{renderContent}</Container>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
          onClick={handleDrawerToggle}
          onKeyDown={handleDrawerToggle}
        >
          <HeaderNav data={navData} direction={'column'} />
        </Box>
      </Drawer>
    </>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
