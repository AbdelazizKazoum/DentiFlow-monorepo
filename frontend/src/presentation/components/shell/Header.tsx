import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Drawer,
  Box,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LanguageIcon from "@mui/icons-material/Language";

// Dummy static navigation links
const navLinks = [
  { href: "/", label: "nav.home" },
  { href: "/services", label: "nav.services" },
  { href: "/about", label: "nav.about" },
];

export default function Header() {
  const t = useTranslations();
  const theme = useTheme();

  // Mobile Menu State
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Language Menu State
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };
  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box sx={{ my: 2 }}>
        <Link href="/" aria-label="Home">
          <span className="font-bold text-xl ms-2">DentilFlow</span>
        </Link>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {navLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded min-h-[44px] flex items-center justify-center"
          >
            {t(item.label) || item.label}
          </Link>
        ))}
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      component="header"
      className="bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800"
    >
      <Toolbar className="container mx-auto flex justify-between items-center ps-4 pe-4">
        {/* Logo and Brand */}
        <Box className="flex items-center gap-2">
          <Link href="/" className="flex items-center" aria-label="Home">
            <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
              DF
            </div>
            <span className="font-semibold text-lg ms-2 sm:ms-3 hidden sm:block">
              DentilFlow
            </span>
          </Link>
        </Box>

        {/* Desktop Navigation */}
        <Box
          component="nav"
          className="hidden md:flex flex-1 justify-center gap-6"
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors"
            >
              {t(item.label) || item.label}
            </Link>
          ))}
        </Box>

        {/* Actions (Language, Theme, Auth, Mobile Toggle) */}
        <Box className="flex items-center justify-end gap-1 ms-auto">
          {/* Language Selector */}
          <IconButton
            aria-label="Toggle language menu"
            aria-controls="language-menu"
            aria-haspopup="true"
            onClick={handleLangMenuOpen}
            className="text-gray-600 dark:text-gray-300 min-w-[44px] min-h-[44px]"
            role="combobox"
          >
            <LanguageIcon />
          </IconButton>
          <Menu
            id="language-menu"
            anchorEl={langAnchorEl}
            open={Boolean(langAnchorEl)}
            onClose={handleLangMenuClose}
            keepMounted
          >
            <MenuItem
              onClick={handleLangMenuClose}
              className="min-w-[44px] min-h-[44px]"
            >
              English
            </MenuItem>
            <MenuItem
              onClick={handleLangMenuClose}
              className="min-w-[44px] min-h-[44px]"
            >
              Français
            </MenuItem>
            <MenuItem
              onClick={handleLangMenuClose}
              className="min-w-[44px] min-h-[44px]"
            >
              العربية
            </MenuItem>
          </Menu>

          {/* Theme Toggle */}
          <IconButton
            aria-label="Toggle theme mode"
            className="text-gray-600 dark:text-gray-300 min-w-[44px] min-h-[44px]"
          >
            {theme.palette?.mode === "dark" ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </IconButton>

          {/* Mobile Menu Button */}
          <IconButton
            aria-label="Toggle mobile menu"
            onClick={handleDrawerToggle}
            className="md:hidden text-gray-600 dark:text-gray-300 min-w-[44px] min-h-[44px] ms-2"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            role: "dialog",
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
