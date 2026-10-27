export const THEME = {
  colors: {
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
    
    // Exact signature pastels from reference design
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
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 34,
    pill: 9999,
  },
  
  shadows: {
    subtle: {
      shadowColor: '#12131C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    card: {
      shadowColor: '#12131C',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
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
} as const;

export type ThemeColors = typeof THEME.colors;

