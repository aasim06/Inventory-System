// third-party
import { presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';
import { extendPaletteWithChannels } from 'utils/colorUtils';

// ==============================|| GREY COLORS BUILDER ||============================== //

function buildGrey() {
  const greyPrimary = [
    '#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#d9d9d9',
    '#bfbfbf', '#8c8c8c', '#595959', '#262626', '#141414', '#000000'
  ];
  const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  const greyConstant = ['#fafafb', '#e6ebf1'];
  return [...greyPrimary, ...greyAscent, ...greyConstant];
}

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export function buildPalette(presetColor) {
  const colors = { ...presetPalettes, grey: buildGrey() };
  const paletteColor = ThemeOption(colors, presetColor);
  const commonColor = { common: { black: '#000', white: '#fff' } };

  const extendedLight = extendPaletteWithChannels(paletteColor);
  const extendedCommon = extendPaletteWithChannels(commonColor);

  const lightPalette = {
    mode: 'light',
    ...extendedCommon,
    ...extendedLight,
    text: {
      primary: extendedLight.grey[700],
      secondary: extendedLight.grey[500],
      disabled: extendedLight.grey[400]
    },
    action: { disabled: extendedLight.grey[300] },
    divider: extendedLight.grey[200],
    background: {
      paper: extendedLight.grey[0],
      default: 'rgb(247, 246, 242)'
    }
  };

  // Magic UI Neutral Zinc/Black Dark Mode Palette
  const darkPalette = {
    mode: 'dark',
    ...extendedCommon,
    ...extendedLight,
    primary: {
      ...extendedLight.primary,
      lighter: '#27272a',
      100: '#3f3f46',
      200: '#52525b',
      light: '#e4e4e7',
      400: '#f4f4f5',
      main: '#ffffff',
      dark: '#d4d4d8',
      700: '#a1a1aa',
      darker: '#71717a',
      900: '#52525b',
      contrastText: '#09090b'
    },
    secondary: {
      lighter: '#18181b',
      100: '#27272a',
      200: '#3f3f46',
      light: '#a1a1aa',
      400: '#71717a',
      main: '#a1a1aa',
      dark: '#d4d4d8',
      700: '#e4e4e7',
      darker: '#f4f4f5',
      900: '#fafafa',
      contrastText: '#ffffff'
    },
    text: {
      primary: '#f4f4f5',
      secondary: '#a1a1aa',
      disabled: '#71717a'
    },
    action: {
      active: '#a1a1aa',
      hover: 'rgba(255, 255, 255, 0.06)',
      selected: 'rgba(255, 255, 255, 0.1)',
      disabled: 'rgba(161, 161, 170, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.05)'
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    background: {
      paper: '#121215',
      default: '#09090b'
    },
    grey: {
      0: '#fafafa',
      50: '#18181b',
      100: '#27272a',
      200: '#3f3f46',
      300: '#52525b',
      400: '#71717a',
      500: '#8b8b96',
      600: '#a1a1aa',
      700: '#cbd5e1',
      800: '#e4e4e7',
      900: '#f4f4f5',
      A50: '#18181b',
      A100: '#27272a',
      A200: '#3f3f46',
      A400: '#71717a',
      A700: '#a1a1aa',
      A800: '#52525b'
    }
  };

  return {
    light: lightPalette,
    dark: darkPalette
  };
}
