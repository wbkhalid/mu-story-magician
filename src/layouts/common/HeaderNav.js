import { Box, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from 'src/components/logo';

const HeaderNav = ({ data, direction }) => {
  const pathname = usePathname();
  const theme = useTheme();
  let updatedPathname = pathname.slice(0, -1);
  const isActivePath = (navItemPath) => {
    return updatedPathname == navItemPath;
  };

  return (
    <Box display="flex" sx={{ gap: { xs: 1.5, md: 9 } }} flexDirection={direction}>
      {direction === 'column' && (
        <Box
          sx={{ width: '10rem', textDecoration: 'none' }}
          component={Link}
          href="/dashboard/my-stories"
        >
          <img src="/logo/Logo.svg" alt="Logo" width="100%" />
        </Box>
      )}
      {data[0].items.map((navItem) => {
        const isActive = isActivePath(navItem.path);
        return (
          <Typography
            key={navItem.path}
            component={Link}
            href={navItem.path}
            sx={{
              textDecoration: 'none',
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
            }}
          >
            {navItem.title}
          </Typography>
        );
      })}
    </Box>
  );
};

export default HeaderNav;
