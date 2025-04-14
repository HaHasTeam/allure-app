import { Dimensions } from 'react-native'

export const myFontWeight = {
  bold: 'Main-Font-Bold',
  boldItalic: 'Main-Font-BoldItalic',
  extraBold: 'Main-Font-ExtraBold',
  extraBoldItalic: 'Main-Font-ExtraBoldItalic',
  italic: 'Main-Font-Italic',
  medium: 'Main-Font-Medium',
  mediumItalic: 'Main-Font-MediumItalic',
  regular: 'Main-Font-Regular',
  semiBold: 'Main-Font-SemiBold',
  semiBoldItalic: 'Main-Font-SemiBoldItalic'
}

export const myTextColor = {
  primary: '#f16f90',
  caption: '#697B7A'
}

export const myTheme = {
  // primary: "#f16f90",
  white: '#FFF',
  black: '000',
  lighter: '#D5F3F0',
  lightGrey: '#f6faf9',
  lightPrimary: '#e5f7f7',
  grey: '#697B7A',
  // primary: "#e62e68", // hsl(345, 82%, 69%)
  // primaryForeground: "#ffffff", // hsl(0, 0%, 100%)
  // background: "#fbe7eb", // hsl(345, 60%, 98%)
  // background: "#faf3f4", // hsl(351, 77.80%, 98.20%)
  // foreground: "#130003", // hsl(345, 57%, 0%)
  // muted: "#e8c9d0", // hsl(345, 24%, 91%)
  // mutedForeground: "#646464", // hsl(0, 0%, 39.22%)
  // popover: "#fbe7eb", // hsl(345, 60%, 98%)
  // popoverForeground: "#130003", // hsl(345, 57%, 0%)
  // card: "#fbe7eb", // hsl(345, 60%, 98%)
  // cardForeground: "#130003", // hsl(345, 57%, 0%)
  // border: "#e3bfc5", // hsl(345, 9%, 89%)
  // input: "#e3bfc5", // hsl(345, 9%, 89%)
  // secondary: "#e7bfc8", // hsl(345, 18%, 90%)
  // secondaryForeground: "#66323d", // hsl(345, 18%, 30%)
  // accent: "#dbc2c8", // hsl(345, 26%, 81%)
  // accentForeground: "#49202c", // hsl(345, 26%, 21%)
  // destructive: "#d70015", // hsl(7.08, 97.99%, 39.02%)
  // destructiveForeground: "#f0ebef", // hsl(0, 19.05%, 94.3%)
  // ring: "#e62e68", // hsl(345, 82%, 69%)
  background: '#feebf1' /* HSL: 345 60% 98% */,
  foreground: '#000000' /* HSL: 345 57% 0% */,
  muted: '#eed8de' /* HSL: 345 24% 91% */,
  mutedForeground: '#646464' /* HSL: 0 0% 39.22% */,
  popover: '#feebf1' /* HSL: 345 60% 98% */,
  popoverForeground: '#000000' /* HSL: 345 57% 0% */,
  card: '#feebf1' /* HSL: 345 60% 98% */,
  cardForeground: '#000000' /* HSL: 345 57% 0% */,
  border: '#e8e1e3' /* HSL: 345 9% 89% */,
  input: '#e8e1e3' /* HSL: 345 9% 89% */,
  primary: '#f96c9c' /* HSL: 345 82% 69% */,
  primaryForeground: '#ffffff' /* HSL: 0 0% 100% */,
  secondary: '#eedce1' /* HSL: 345 18% 90% */,
  secondaryForeground: '#7c5462' /* HSL: 345 18% 30% */,
  accent: '#e0c3cc' /* HSL: 345 26% 81% */,
  accentForeground: '#582f3b' /* HSL: 345 26% 21% */,
  destructive: '#ce1717' /* HSL: 7.08 97.99% 39.02% */,
  destructiveForeground: '#f1f0f0' /* HSL: 0 19.05% 94.3% */,
  ring: '#f96c9c' /* HSL: 345 82% 69% */,
  blue: {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '800': '#1e40af',
    '900': '#1e3a8a',
    '950': '#172554'
  },
  sky: {
    '50': '#f0f9ff',
    '100': '#e0f2fe',
    '200': '#bae6fd',
    '300': '#7dd3fc',
    '400': '#38bdf8',
    '500': '#0ea5e9',
    '600': '#0284c7',
    '700': '#0369a1',
    '800': '#075985',
    '900': '#0c4a6e',
    '950': '#082f49'
  },
  cyan: {
    '50': '#ecfeff',
    '100': '#cffafe',
    '200': '#a5f3fc',
    '300': '#67e8f9',
    '400': '#22d3ee',
    '500': '#06b6d4',
    '600': '#0891b2',
    '700': '#0e7490',
    '800': '#155e75',
    '900': '#164e63',
    '950': '#083344'
  },
  teal: {
    '50': '#f0fdfa',
    '100': '#ccfbf1',
    '200': '#99f6e4',
    '300': '#5eead4',
    '400': '#2dd4bf',
    '500': '#14b8a6',
    '600': '#0d9488',
    '700': '#0f766e',
    '800': '#115e59',
    '900': '#134e4a',
    '950': '#042f2e'
  },
  emerald: {
    '50': '#ecfdf5',
    '100': '#d1fae5',
    '200': '#a7f3d0',
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#10b981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065f46',
    '900': '#064e3b',
    '950': '#022c22'
  },
  green: {
    '50': '#f0fdf4',
    '100': '#dcfce7',
    '200': '#bbf7d0',
    '300': '#86efac',
    '400': '#4ade80',
    '500': '#22c55e',
    '600': '#16a34a',
    '700': '#15803d',
    '800': '#166534',
    '900': '#14532d',
    '950': '#052e16'
  },
  lime: {
    '50': '#f7fee7',
    '100': '#ecfccb',
    '200': '#d9f99d',
    '300': '#bef264',
    '400': '#a3e635',
    '500': '#84cc16',
    '600': '#65a30d',
    '700': '#4d7c0f',
    '800': '#3f6212',
    '900': '#365314',
    '950': '#1a2e05'
  },
  yellow: {
    '50': '#fefce8',
    '100': '#fef9c3',
    '200': '#fef08a',
    '300': '#fde047',
    '400': '#facc15',
    '500': '#eab308',
    '600': '#ca8a04',
    '700': '#a16207',
    '800': '#854d0e',
    '900': '#713f12',
    '950': '#422006'
  },
  amber: {
    '50': '#fffbeb',
    '100': '#fef3c7',
    '200': '#fde68a',
    '300': '#fcd34d',
    '400': '#fbbf24',
    '500': '#f59e0b',
    '600': '#d97706',
    '700': '#b45309',
    '800': '#92400e',
    '900': '#78350f',
    '950': '#451a03'
  },
  orange: {
    '50': '#fff7ed',
    '100': '#ffedd5',
    '200': '#fed7aa',
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '700': '#c2410c',
    '800': '#9a3412',
    '900': '#7c2d12',
    '950': '#431407'
  },
  red: {
    '50': '#fef2f2',
    '100': '#fee2e2',
    '200': '#fecaca',
    '300': '#fca5a5',
    '400': '#f87171',
    '500': '#ef4444',
    '600': '#dc2626',
    '700': '#b91c1c',
    '800': '#991b1b',
    '900': '#7f1d1d',
    '950': '#450a0a'
  },
  stone: {
    '50': '#fafaf9',
    '100': '#f5f5f4',
    '200': '#e7e5e4',
    '300': '#d6d3d1',
    '400': '#a8a29e',
    '500': '#78716c',
    '600': '#57534e',
    '700': '#44403c',
    '800': '#292524',
    '900': '#1c1917',
    '950': '#0c0a09'
  },
  neutral: {
    '50': '#fafafa',
    '100': '#f5f5f5',
    '200': '#e5e5e5',
    '300': '#d4d4d4',
    '400': '#a3a3a3',
    '500': '#737373',
    '600': '#525252',
    '700': '#404040',
    '800': '#262626',
    '900': '#171717',
    '950': '#0a0a0a'
  },
  zinc: {
    '50': '#fafafa',
    '100': '#f4f4f5',
    '200': '#e4e4e7',
    '300': '#d4d4d8',
    '400': '#a1a1aa',
    '500': '#71717a',
    '600': '#52525b',
    '700': '#3f3f46',
    '800': '#27272a',
    '900': '#18181b',
    '950': '#09090b'
  },
  gray: {
    '50': '#f9fafb',
    '100': '#f3f4f6',
    '200': '#e5e7eb',
    '300': '#d1d5db',
    '400': '#9ca3af',
    '500': '#6b7280',
    '600': '#4b5563',
    '700': '#374151',
    '800': '#1f2937',
    '900': '#111827',
    '950': '#030712'
  },
  slate: {
    '50': '#f8fafc',
    '100': '#f1f5f9',
    '200': '#e2e8f0',
    '300': '#cbd5e1',
    '400': '#94a3b8',
    '500': '#64748b',
    '600': '#475569',
    '700': '#334155',
    '800': '#1e293b',
    '900': '#0f172a',
    '950': '#020617'
  },
  indigo: {
    '50': '#eef2ff',
    '100': '#e0e7ff',
    '200': '#c7d2fe',
    '300': '#a5b4fc',
    '400': '#818cf8',
    '500': '#6366f1',
    '600': '#4f46e5',
    '700': '#4338ca',
    '800': '#3730a3',
    '900': '#312e81',
    '950': '#1e1b4b'
  },
  violet: {
    '50': '#f5f3ff',
    '100': '#ede9fe',
    '200': '#ddd6fe',
    '300': '#c4b5fd',
    '400': '#a78bfa',
    '500': '#8b5cf6',
    '600': '#7c3aed',
    '700': '#6d28d9',
    '800': '#5b21b6',
    '900': '#4c1d95',
    '950': '#2e1065'
  },
  purple: {
    '50': '#faf5ff',
    '100': '#f3e8ff',
    '200': '#e9d5ff',
    '300': '#d8b4fe',
    '400': '#c084fc',
    '500': '#a855f7',
    '600': '#9333ea',
    '700': '#7e22ce',
    '800': '#6b21a8',
    '900': '#581c87',
    '950': '#3b0764'
  },
  fuchsia: {
    '50': '#fdf4ff',
    '100': '#fae8ff',
    '200': '#f5d0fe',
    '300': '#f0abfc',
    '400': '#e879f9',
    '500': '#d946ef',
    '600': '#c026d3',
    '700': '#a21caf',
    '800': '#86198f',
    '900': '#701a75',
    '950': '#4a044e'
  },
  rose: {
    '50': '#fff1f2',
    '100': '#ffe4e6',
    '200': '#fecdd3',
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    '600': '#e11d48',
    '700': '#be123c',
    '800': '#9f1239',
    '900': '#881337',
    '950': '#4c0519'
  },
  pink: {
    '50': '#fdf2f8',
    '100': '#fce7f3',
    '200': '#fbcfe8',
    '300': '#f9a8d4',
    '400': '#f472b6',
    '500': '#ec4899',
    '600': '#db2777',
    '700': '#be185d',
    '800': '#9d174d',
    '900': '#831843',
    '950': '#500724'
  }
}

export const myThemeDark = {
  // background: "#0d0507", // hsl(345, 40%, 2%)
  // foreground: "#fae6ea", // hsl(345, 24%, 98%)
  // muted: "#1e1013", // hsl(345, 24%, 9%)
  // mutedForeground: "#b6a4aa", // hsl(345, 9%, 71%)
  // popover: "#0d0507", // hsl(345, 40%, 2%)
  // popoverForeground: "#fae6ea", // hsl(345, 24%, 98%)
  // card: "#0d0507", // hsl(345, 40%, 2%)
  // cardForeground: "#fae6ea", // hsl(345, 24%, 98%)
  // border: "#25151a", // hsl(345, 9%, 13%)
  // input: "#25151a", // hsl(345, 9%, 13%)
  // primary: "#e62e68", // hsl(345, 82%, 69%)
  // primaryForeground: "#1a0207", // hsl(345, 82%, 9%)
  // secondary: "#2b181c", // hsl(345, 15%, 17%)
  // secondaryForeground: "#c699a5", // hsl(345, 15%, 77%)
  // accent: "#3a2028", // hsl(345, 22%, 23%)
  // accentForeground: "#d8aebc", // hsl(345, 22%, 83%)
  // destructive: "#c60000", // hsl(0, 90%, 48%)
  // destructiveForeground: "#ffffff", // hsl(0, 0%, 100%)
  // ring: "#e62e68", // hsl(345, 82%, 69%)
  background: '#080405' /* HSL: 345 40% 2% */,
  foreground: '#f8edf2' /* HSL: 345 24% 98% */,
  muted: '#180c10' /* HSL: 345 24% 9% */,
  mutedForeground: '#b7a4ac' /* HSL: 345 9% 71% */,
  popover: '#080405' /* HSL: 345 40% 2% */,
  popoverForeground: '#f8edf2' /* HSL: 345 24% 98% */,
  card: '#080405' /* HSL: 345 40% 2% */,
  cardForeground: '#f8edf2' /* HSL: 345 24% 98% */,
  border: '#221518' /* HSL: 345 9% 13% */,
  input: '#221518' /* HSL: 345 9% 13% */,
  primary: '#f96c9c' /* HSL: 345 82% 69% */,
  primaryForeground: '#51111e' /* HSL: 345 82% 9% */,
  secondary: '#2c1921' /* HSL: 345 15% 17% */,
  secondaryForeground: '#cd9eb0' /* HSL: 345 15% 77% */,
  accent: '#3d1f28' /* HSL: 345 22% 23% */,
  accentForeground: '#d7aeba' /* HSL: 345 22% 83% */,
  destructive: '#f20000' /* HSL: 0 90% 48% */,
  destructiveForeground: '#ffffff' /* HSL: 0 0% 100% */,
  ring: '#f96c9c' /* HSL: 345 82% 69% */
}

export const myDeviceHeight = {
  sm: 667.5,
  md: 914.5
}

export const myDeviceWidth = {
  sm: 375.5,
  md: 411.5
}

export enum WEEKDAY {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export enum SLOT_NUMBER {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4
}

export const height = Dimensions.get('screen').height
export const width = Dimensions.get('screen').width
export const errorMessage = {
  ERM033: 'Hệ thống của chúng tôi đang gặp sự cố. Vui lòng thử lại sau.',
  ERM003: 'Email hoặc mật khẩu không chính xác.',
  ERM002: '<> là bắt buộc.',
  ERM009: '<> không được vượt quá <> kí tự.',
  ERM018: 'Vui lòng nhập địa chỉ email hợp lệ.',
  ERM019: 'Email này đã được sử dụng. Vui lòng sử dụng email khác.',
  ERM020: '<> phải có ít nhất <> kí tự.',
  ERM021:
    'Mật khẩu phải bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.',
  ERM023: 'Số điện thoại phải có 10 ký tự và bắt đầu bằng số 0.',
  ERM025: 'Đã xảy ra lỗi khi <>. Vui lòng thử lại sau.',
  ERM029: 'Tài khoản chưa được xác thực. Vui lòng xác thực và thử lại.',
  ERM030: 'Mật khẩu không khớp.',
  ERM034: '<> không thành công. Vui lòng thử lại.'
}

export const successMessage = {
  SSM032: '<> thành công',
  SSM033: 'Đơn hàng của bạn đã được thanh toán'
}
