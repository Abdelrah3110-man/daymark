export const LIGHT_COLORS = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF0F8',
  border: '#E8EAF2',
  borderSubtle: '#F1F3F9',
  
  // Core text
  text: '#12131C',
  textSecondary: '#6B7082',
  textMuted: '#9CA1B4',
  textLight: '#C5C8D6',
  textInverse: '#FFFFFF',
  
  // Signature pastels
  lavender: '#C8B6FF',
  lavenderDark: '#432C81',
  lavenderLight: '#EFEAFF',
  
  peach: '#FFBA59',
  peachDark: '#663C00',
  peachLight: '#FFF2DC',
  
  lightBlue: '#BCE2FF',
  lightBlueDark: '#10447A',
  lightBlueLight: '#EAF4FF',
  
  softPink: '#FFB4E8',
  softPinkDark: '#701454',
  softPinkLight: '#FFEBF9',
  
  mint: '#A7F3D0',
  mintDark: '#047857',
  mintLight: '#ECFDF5',
  
  // Dark floating bottom bar
  navBackground: '#12131C',
  navSurface: '#1E202E',
  navActive: '#12131C',
  navActiveCircle: '#FFFFFF',
  navInactive: '#7C8097',
  navBorder: '#202230',
  
  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
};

export const DARK_COLORS = {
  background: '#0E1017',
  surface: '#181A26',
  surfaceSecondary: '#222536',
  border: '#2B2E42',
  borderSubtle: '#1E2030',
  
  // Core text
  text: '#F3F4F8',
  textSecondary: '#A3A8BE',
  textMuted: '#70758E',
  textLight: '#4E536B',
  textInverse: '#0E1017',
  
  // Signature pastels calibrated for dark contrast
  lavender: '#B79FF7',
  lavenderDark: '#D5C4FF',
  lavenderLight: '#26203D',
  
  peach: '#F5A738',
  peachDark: '#FED7AA',
  peachLight: '#3A2710',
  
  lightBlue: '#93C9F8',
  lightBlueDark: '#BAE6FD',
  lightBlueLight: '#132B45',
  
  softPink: '#F494D7',
  softPinkDark: '#FBCFE8',
  softPinkLight: '#3B1A32',
  
  mint: '#86EFAC',
  mintDark: '#D1FAE5',
  mintLight: '#0D3322',
  
  // Dark floating bottom bar
  navBackground: '#151722',
  navSurface: '#202334',
  navActive: '#12131C',
  navActiveCircle: '#FFFFFF',
  navInactive: '#6B7088',
  navBorder: '#2A2D40',
  
  // Status
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
};

export const THEME = {
  colors: { ...LIGHT_COLORS },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    giant: 40,
  },
  
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 34,
    pill: 9999,
  },
  
  shadows: {
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  typography: {
    h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.6 },
    h2: { fontSize: 22, fontWeight: '800' as const, lineHeight: 28, letterSpacing: -0.4 },
    h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24, letterSpacing: -0.2 },
    bodyLg: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
    body: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    micro: { fontSize: 11, fontWeight: '700' as const, lineHeight: 14, letterSpacing: 0.4 },
  },
};

export function setAppThemeColors(isDark: boolean) {
  Object.assign(THEME.colors, isDark ? DARK_COLORS : LIGHT_COLORS);
}

export type ThemeColors = typeof THEME.colors;

