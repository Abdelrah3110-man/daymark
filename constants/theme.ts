export const THEME = {
  colors: {
    background: '#F7F5F0',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0ECE4',
    border: '#E8E4DC',
    borderSubtle: '#F0EDE6',
    
    // Core text
    text: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#71717A',
    textLight: '#A1A1AA',
    textInverse: '#FDFDFC',
    
    // Signature pastels
    lavender: '#D0C9FF',
    lavenderDark: '#4F46E5',
    lavenderLight: '#ECE9FF',
    
    peach: '#FFC887',
    peachDark: '#B45309',
    peachLight: '#FFEBD1',
    
    lightBlue: '#BEE1FF',
    lightBlueDark: '#0369A1',
    lightBlueLight: '#E5F3FF',
    
    softPink: '#FFC0EA',
    softPinkDark: '#BE185D',
    softPinkLight: '#FFE5F7',
    
    mint: '#A7F3D0',
    mintDark: '#047857',
    mintLight: '#ECFDF5',
    
    // Dark floating bottom bar
    navBackground: '#12131C',
    navSurface: '#1E202E',
    navActive: '#FFFFFF',
    navInactive: '#8A8D9E',
    navBorder: '#272938',
    
    // Status
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    info: '#2563EB',
    infoLight: '#DBEAFE',
  },
  
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
    md: 14,
    lg: 18,
    xl: 24,
    pill: 9999,
  },
  
  shadows: {
    subtle: {
      shadowColor: '#18181B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    card: {
      shadowColor: '#18181B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, letterSpacing: -0.2 },
    bodyLg: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
    body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    micro: { fontSize: 10, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.5 },
  },
} as const;

export type ThemeColors = typeof THEME.colors;
