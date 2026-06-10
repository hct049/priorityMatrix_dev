// 순수 설정/데이터. 로직·렌더 없음.

export const APP_VERSION = 'v0.0';

export const QUADRANTS = [
  { id: 'Q1', label: '즉시 처리', sub: '긴급 + 중요', color: '#FF4444' },
  { id: 'Q2', label: '계획 수립', sub: '중요 + 여유', color: '#00D4AA' },
  { id: 'Q3', label: '위임 검토', sub: '긴급 + 덜 중요', color: '#FFB800' },
  { id: 'Q4', label: '보류 / 제거', sub: '여유 + 덜 중요', color: '#555566' },
];

export const REPEAT_OPTIONS = [
  { value: '', label: '반복 없음' }, { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' }, { value: 'biweekly', label: '격주' },
  { value: 'custom', label: 'N일 간격' }, { value: 'weekdays', label: '요일 지정' },
];

export const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export const qColor = (id) => QUADRANTS.find(q => q.id === id)?.color || '#666';

const LABEL_COLORS_DARK = {
  overdue: { bg: '#FF444422', color: '#FF6666', border: '#FF444455' },
  critical: { bg: '#FF444420', color: '#FF5555', border: '#FF444440' },
  urgent: { bg: '#FFB80022', color: '#FFB800', border: '#FFB80044' },
  warn: { bg: '#FFB80011', color: '#BB8800', border: '#FFB80022' },
  normal: { bg: '#ffffff09', color: '#555', border: '#ffffff12' },
};
const LABEL_COLORS_LIGHT = {
  overdue: { bg: '#FFE5E5', color: '#CC0000', border: '#FFAAAA' },
  critical: { bg: '#FFE8E8', color: '#DD2222', border: '#FFBBBB' },
  urgent: { bg: '#FFF4CC', color: '#996600', border: '#FFD966' },
  warn: { bg: '#FFFAE6', color: '#AA7700', border: '#FFE599' },
  normal: { bg: '#F0F0F0', color: '#888', border: '#DDDDDD' },
};

export const THEMES = {
  dark: {
    appBg: '#08090c', panelBg: '#0a0b0e', cardBg: '#0f1014',
    border: '#141418', border2: '#1e1e28', border3: '#1a1a22',
    text: '#e0e0e8', textSub: '#aaaabc', textMuted: '#555', textFaint: '#333',
    inputBg: '#0a0b0f', inputColor: '#dcdce8',
    rowHover: '#ffffff0d', rowSelected: '#ffffff0a',
    tabActive: '#00D4AA', tabActiveTxt: '#000', tabInact: '#141418', tabInactTxt: '#555',
    filterActive: '#00D4AA22', filterActiveTxt: '#00D4AA', filterActiveOutline: '#00D4AA44',
    filterInact: '#141418', filterInactTxt: '#444',
    qCardBg: { Q1: '#150808', Q2: '#001510', Q3: '#141000', Q4: '#0c0c10' },
    qCardBorder: { Q1: '#FF444430', Q2: '#00D4AA30', Q3: '#FFB80030', Q4: '#161618' },
    emptyTxt: '#1c1c26', memoBg: '#ffffff06', memoBorder: '#1e1e28', memoTxt: '#666', memoTs: '#333',
    chkBorder: '#2a2a38', legendBg: '#0c0c10', legendBorder: '#131318',
    scrollThumb: '#252530', colorScheme: 'dark', labelColors: LABEL_COLORS_DARK,
    completedStrike: '#444', completedTs: '#2a2a38', settingsBg: '#0f1014', settingsBorder: '#1e1e28',
    deletedBg: '#1a0a0a', deletedBorder: '#FF444420', deletedTxt: '#553333',
  },
  light: {
    appBg: '#F5F6FA', panelBg: '#FFFFFF', cardBg: '#FFFFFF',
    border: '#E5E7EF', border2: '#D8DAE8', border3: '#E0E2EC',
    text: '#1a1a2e', textSub: '#444466', textMuted: '#888', textFaint: '#BBBBCC',
    inputBg: '#F8F9FC', inputColor: '#1a1a2e',
    rowHover: '#00000008', rowSelected: '#00000006',
    tabActive: '#00B894', tabActiveTxt: '#fff', tabInact: '#EEF0F8', tabInactTxt: '#888',
    filterActive: '#00B89420', filterActiveTxt: '#007A63', filterActiveOutline: '#00B89440',
    filterInact: '#EEF0F8', filterInactTxt: '#999',
    qCardBg: { Q1: '#FFF5F5', Q2: '#F0FBF8', Q3: '#FFFBF0', Q4: '#F8F8FA' },
    qCardBorder: { Q1: '#FFBBBB', Q2: '#A0E8D8', Q3: '#FFE0A0', Q4: '#E0E0E8' },
    emptyTxt: '#CCCCDD', memoBg: '#F5F6FA', memoBorder: '#E0E2EC', memoTxt: '#555', memoTs: '#AAAACC',
    chkBorder: '#CCCCDC', legendBg: '#EEEEF8', legendBorder: '#E0E0EE',
    scrollThumb: '#CCCCDC', colorScheme: 'light', labelColors: LABEL_COLORS_LIGHT,
    completedStrike: '#AAAACC', completedTs: '#BBBBCC', settingsBg: '#FFFFFF', settingsBorder: '#E0E2EC',
    deletedBg: '#FFF0F0', deletedBorder: '#FFBBBB', deletedTxt: '#CCAAAA',
  },
};

export const EMPTY_FORM = {
  title: '', deadline: '', deadlineTime: '', importance: 5, note: '',
  repeat: '', repeatInterval: 2, repeatWeekdays: [], autoRepeat: true,
};

export const DELETE_GRACE_MS = 24 * 60 * 60 * 1000;
