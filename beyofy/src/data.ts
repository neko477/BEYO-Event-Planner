import type { CalendarEvent, EventKind, FeeItem, ScheduleSlot } from './types';

export const EVENT_SOURCE_URL =
  'https://helloproject.com/event/710ded9c97c27513e9e2b81b98478049c11b4ea3011b4fe45cda5f0c6c366f57/';
export const OVERVIEW_SOURCE_URL =
  'https://helloproject.com/beyooooonds/event/3fcee29d0c622f492781b1ca0deaec9428afb6acae9f3e8cede4f9c2b90f1f44/';

export const DEFAULT_EVENTS: EventKind[] = [
  {
    id: 'fortune-photo-group',
    service: 'fortune',
    label: '3ショット・4ショットチェキ会',
    shortLabel: '3/4ショット',
    price: 6780,
    cdPerSet: 4,
    maxTotal: 75,
    perSelectionLimit: 3,
    source: 'official',
    note: '4枚セット（初回盤A・B＋通常盤A・B）',
  },
  {
    id: 'fortune-photo-pair',
    service: 'fortune',
    label: '2ショットチェキ会',
    shortLabel: '2ショット',
    price: 6780,
    cdPerSet: 4,
    maxTotal: 165,
    perSelectionLimit: 3,
    source: 'official',
    note: '4枚セット（初回盤A・B＋通常盤A・B）',
  },
  {
    id: 'fortune-group-talk',
    service: 'fortune',
    label: 'グループお話し会',
    shortLabel: 'グループ',
    price: 1300,
    cdPerSet: 1,
    maxTotal: 150,
    perSelectionLimit: 3,
    source: 'official',
    note: '通常盤AまたはB・1枚',
  },
  {
    id: 'fortune-individual-talk',
    service: 'fortune',
    label: '個別お話し会',
    shortLabel: '個別お話し',
    price: 1300,
    cdPerSet: 1,
    maxTotal: 900,
    perSelectionLimit: 3,
    source: 'official',
    note: '通常盤AまたはB・1枚／対象メンバーは販売グループからランダム',
  },
  {
    id: 'fortune-sign',
    service: 'fortune',
    label: '個別サイン会',
    shortLabel: 'サイン会',
    price: 6780,
    cdPerSet: 4,
    maxTotal: 165,
    perSelectionLimit: 3,
    source: 'official',
    note: '4枚セット（初回盤A・B＋通常盤A・B）',
  },
  {
    id: 'fortune-drawing',
    service: 'fortune',
    label: '個別お絵描き会',
    shortLabel: 'お絵描き',
    price: 6780,
    cdPerSet: 4,
    maxTotal: 165,
    perSelectionLimit: 3,
    source: 'official',
    note: '4枚セット（初回盤A・B＋通常盤A・B）',
  },
  {
    id: 'withlive-talk',
    service: 'withlive',
    label: 'オンラインお話し会',
    shortLabel: 'オンライン',
    price: 2930,
    cdPerSet: 2,
    maxTotal: 15,
    perSelectionLimit: 15,
    source: 'official',
    note: '通常盤A・B 2枚セット（WithLIVEシリアル付き）',
  },
  {
    id: 'release-2026-11-22',
    service: 'release',
    label: 'ミニライブ＆お見送り会（アリオ橋本）',
    shortLabel: '11/22 リリイベ',
    price: 2600,
    cdPerSet: 2,
    maxTotal: 2,
    perSelectionLimit: 2,
    source: 'official',
    note: '通常盤A+B 2枚セット。ミニライブ観覧は無料、優先観覧・お見送り会付き。',
  },
  {
    id: 'release-2026-11-23',
    service: 'release',
    label: 'ミニライブ＆お見送り会（神戸ハーバーランド）',
    shortLabel: '11/23 リリイベ',
    price: 2600,
    cdPerSet: 2,
    maxTotal: 2,
    perSelectionLimit: 2,
    source: 'official',
    note: '通常盤A+B 2枚セット。ミニライブ観覧は無料、優先観覧・お見送り会付き。',
  },
  {
    id: 'release-2026-11-24',
    service: 'release',
    label: 'ミニライブ＆お見送り会（CLUB CITTA’）',
    shortLabel: '11/24 リリイベ',
    price: 2600,
    cdPerSet: 2,
    defaultOtherCost: 600,
    maxTotal: 2,
    perSelectionLimit: 2,
    source: 'official',
    note: '通常盤A+B 2枚セット。別途ドリンク代600円、オンライン予約は送料220円。',
  },
  {
    id: 'live-2026-11-11',
    service: 'live',
    label: 'BEYOOOOONDS CONCERT 2026 BUDOOOOOKAN！',
    shortLabel: '11/11 武道館',
    price: 9800,
    cdPerSet: 0,
    ticketOptions: [
      { id: 'fc', label: 'FC先行', price: 9000 },
      { id: 'general', label: '一般席', price: 9800 },
      { id: 'side', label: 'サイドスタンド席', price: 9300 },
    ],
    maxTotal: 1,
    perSelectionLimit: 1,
    source: 'official',
    note: '一般席等9,800円。サイドスタンドA席等は9,300円（設定で変更）。',
  },
  {
    id: 'live-2026-11-26',
    service: 'live',
    label: 'BEYOOOOONDS CONCERT 2026 府中公演',
    shortLabel: '11/26 府中',
    price: 9000,
    cdPerSet: 0,
    ticketOptions: [
      { id: 'fc', label: 'FC先行', price: 8200 },
      { id: 'general', label: '一般席・ファミリー席', price: 9000 },
      { id: 'side', label: 'サイドスタンド席', price: 9000 },
    ],
    maxTotal: 1,
    perSelectionLimit: 1,
    source: 'official',
    note: '一般席・ファミリー席9,000円。',
  },
  {
    id: 'live-2026-12-07',
    service: 'live',
    label: 'BEYOOOOONDS CONCERT 2026 NHK大阪公演',
    shortLabel: '12/7 NHK大阪',
    price: 9000,
    cdPerSet: 0,
    ticketOptions: [
      { id: 'fc', label: 'FC先行', price: 8200 },
      { id: 'general', label: '一般席・ファミリー席', price: 9000 },
      { id: 'side', label: 'サイドスタンド席', price: 9000 },
    ],
    maxTotal: 1,
    perSelectionLimit: 1,
    source: 'official',
    note: '一般席・ファミリー席9,000円。',
  },
  {
    id: 'appearance-2026-12-13-comiccon',
    service: 'appearance',
    label: '東京コミコン2026 BEYOOOOONDS スペシャルライブ',
    shortLabel: '12/13 東京コミコン',
    price: 5500,
    ticketOptions: [
      { id: 'advance-general', label: '前売 一般1日券', price: 5500 },
      { id: 'day-general', label: '当日 一般1日券', price: 5900 },
      { id: 'advance-u18', label: '前売 U-18 1日券', price: 1000 },
      { id: 'advance-u15', label: '前売 U-15 1日券', price: 500 },
      { id: '3day-pass', label: '3DAYPASS', price: 9900 },
    ],
    cdPerSet: 0,
    maxTotal: 1,
    perSelectionLimit: 1,
    source: 'official',
    note: '12月13日（日）10:00〜18:00、幕張メッセ。BEYOOOOONDSメンバー全員のスペシャルライブ。入場券が必要。',
  },
  {
    id: 'appearance-2026-10-31',
    service: 'appearance',
    label: 'Livejack 2026 SMASH BEAT SP',
    shortLabel: '10/31 Livejack',
    price: 11000,
    ticketOptions: [
      { id: '指定席', label: '指定席', price: 11000 },
      { id: '着席指定席', label: '着席指定席', price: 11000 },
    ],
    cdPerSet: 0,
    maxTotal: 1,
    perSelectionLimit: 1,
    source: 'official',
    note: '指定席・着席指定席11,000円。',
  },
  {
    id: 'appearance-2026-12-19',
    service: 'appearance',
    label: 'IWA ROCK presented by e-Broad',
    shortLabel: '12/19 IWA ROCK',
    price: 7500,
    ticketOptions: [
      { id: '1f-standing', label: '1Fスタンディング', price: 7500 },
      { id: '2f-reserved', label: '2F指定席', price: 8000 },
    ],
    cdPerSet: 0,
    defaultOtherCost: 600,
    maxTotal: 1,
    perSelectionLimit: 1,
    source: 'official',
    note: '1Fスタンディング7,500円／2F指定席8,000円。別途ドリンク代600円。',
  },
];

const fortuneTimes = [
  ['fortune-photo-group', '第①部 3ショット・4ショット', '11:00'],
  ['fortune-photo-pair', '第①部 2ショット', '11:40'],
  ['fortune-photo-pair', '第②部 2ショット', '12:00'],
  ['fortune-individual-talk', '第①部 個別お話し', '13:10'],
  ['fortune-individual-talk', '第②部 個別お話し', '13:40'],
  ['fortune-individual-talk', '第③部 個別お話し', '14:20'],
  ['fortune-individual-talk', '第④部 個別お話し', '14:50'],
  ['fortune-group-talk', '第①部 グループお話し', '15:35'],
  ['fortune-individual-talk', '第⑤部 個別お話し', '16:10'],
  ['fortune-individual-talk', '第⑥部 個別お話し', '16:40'],
  ['fortune-sign', '第①部 個別サイン', '17:50'],
  ['fortune-drawing', '第①部 個別お絵描き', '18:30'],
] as const;

const dateConfigs = [
  { date: '2026-11-28', venue: 'ベルサール飯田橋ファースト（東京）', shift: 0 },
  { date: '2026-11-29', venue: 'ベルサール飯田橋ファースト（東京）', shift: 0 },
  { date: '2026-12-06', venue: 'インテックス大阪 4号館（大阪）', shift: 60 },
  { date: '2026-12-12', venue: 'ベルサール汐留 B1F（東京）', shift: 0 },
  { date: '2027-02-06', venue: 'ベルサール飯田橋ファースト（東京）', shift: 0 },
];

const members = ['西田汐里', '江口紗耶', '前田こころ', '岡村美波', '清野桃々姫', '平井美葉', '小林萌花', '里吉うたの', '小島はな', '大坪茉乃', '杉山結菜'];
const individualTalkGroups = ['A（西田汐里・杉山結菜）', 'B（江口紗耶・岡村美波・里吉うたの）', 'C（前田こころ・小島はな）', 'D（平井美葉・大坪茉乃）', 'E（清野桃々姫・小林萌花）'];
const photoGroups: Record<string, string[]> = {
  '2026-11-28': ['A（西田汐里・大坪茉乃）', 'B（江口紗耶・前田こころ）', 'C（岡村美波・里吉うたの・杉山結菜）', 'D（清野桃々姫・平井美葉）', 'E（小林萌花・小島はな）'],
  '2026-11-29': ['A（西田汐里・里吉うたの）', 'B（江口紗耶・平井美葉・小島はな）', 'C（前田こころ・岡村美波）', 'D（清野桃々姫・大坪茉乃）', 'E（小林萌花・杉山結菜）'],
  '2026-12-06': ['A（西田汐里・平井美葉）', 'B（江口紗耶・清野桃々姫）', 'C（前田こころ・小林萌花・大坪茉乃）', 'D（岡村美波・杉山結菜）', 'E（里吉うたの・小島はな）'],
  '2026-12-12': ['A（西田汐里・岡村美波）', 'B（江口紗耶・里吉うたの）', 'C（前田こころ・平井美葉）', 'D（清野桃々姫・小林萌花）', 'E（小島はな・大坪茉乃・杉山結菜）'],
  '2027-02-06': ['A（西田汐里・清野桃々姫・小林萌花）', 'B（江口紗耶・杉山結菜）', 'C（前田こころ・小島はな）', 'D（岡村美波・大坪茉乃）', 'E（平井美葉・里吉うたの）'],
};
const talkGroups: Record<string, string[]> = {
  '2026-11-28': ['A（西田汐里・前田こころ）', 'B（江口紗耶・杉山結菜）', 'C（岡村美波・平井美葉）', 'D（清野桃々姫・小林萌花・小島はな）', 'E（里吉うたの・大坪茉乃）'],
  '2026-11-29': ['A（西田汐里・平井美葉）', 'B（江口紗耶・小林萌花）', 'C（前田こころ・里吉うたの）', 'D（岡村美波・清野桃々姫）', 'E（小島はな・大坪茉乃・杉山結菜）'],
  '2026-12-06': ['A（西田汐里・小林萌花）', 'B（江口紗耶・平井美葉・杉山結菜）', 'C（前田こころ・大坪茉乃）', 'D（岡村美波・里吉うたの）', 'E（清野桃々姫・小島はな）'],
  '2026-12-12': ['A（西田汐里・江口紗耶・大坪茉乃）', 'B（前田こころ・清野桃々姫）', 'C（岡村美波・小林萌花）', 'D（平井美葉・小島はな）', 'E（里吉うたの・杉山結菜）'],
  '2027-02-06': ['A（西田汐里・杉山結菜）', 'B（江口紗耶・小島はな）', 'C（前田こころ・岡村美波・里吉うたの）', 'D（清野桃々姫・平井美葉）', 'E（小林萌花・大坪茉乃）'],
};

function memberOptions(eventId: string, date: string) {
  if (eventId === 'fortune-photo-group') return photoGroups[date] ?? [];
  if (eventId === 'fortune-group-talk') return talkGroups[date] ?? [];
  if (eventId === 'fortune-individual-talk') return individualTalkGroups;
  if (eventId === 'fortune-photo-pair' || eventId === 'fortune-sign' || eventId === 'fortune-drawing') return members;
  return [];
}

function shiftTime(time: string, minutes: number) {
  const [hour, minute] = time.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const fortuneSlots: ScheduleSlot[] = dateConfigs.flatMap((config) =>
  fortuneTimes.map(([eventId, label, time]) => ({
    id: `fortune-${config.date}-${eventId}-${label.slice(1, 2)}`,
    eventId,
    service: 'fortune' as const,
    date: config.date,
    venue: config.venue,
    label,
    time: shiftTime(time, config.shift),
    members: '',
    memberOptions: memberOptions(eventId, config.date),
  })),
);

export const SCHEDULE_SLOTS: ScheduleSlot[] = [
  ...fortuneSlots,
  {
    id: 'withlive-2026-10-27',
    eventId: 'withlive-talk',
    service: 'withlive',
    date: '2026-10-27',
    venue: 'WithLIVE（オンライン）',
    label: 'オンラインお話し会',
    time: '18:00〜 順次開始予定',
    members: '',
    memberOptions: ['江口紗耶', '岡村美波', '杉山結菜'],
  },
  {
    id: 'withlive-2026-10-29',
    eventId: 'withlive-talk',
    service: 'withlive',
    date: '2026-10-29',
    venue: 'WithLIVE（オンライン）',
    label: 'オンラインお話し会',
    time: '18:00〜 順次開始予定',
    members: '',
    memberOptions: ['西田汐里', '平井美葉', '里吉うたの', '小島はな'],
  },
  {
    id: 'withlive-2026-10-30',
    eventId: 'withlive-talk',
    service: 'withlive',
    date: '2026-10-30',
    venue: 'WithLIVE（オンライン）',
    label: 'オンラインお話し会',
    time: '18:00〜 順次開始予定',
    members: '',
    memberOptions: ['前田こころ', '清野桃々姫', '小林萌花', '大坪茉乃'],
  },
  ...[
    ['release-2026-11-22', '2026-11-22', 'アリオ橋本 1F屋外イベント広場（神奈川）', '第1部 12:15〜', '第2部 15:30〜'],
    ['release-2026-11-23', '2026-11-23', '神戸ハーバーランド スペースシアター（兵庫）', '第1部 12:15〜', '第2部 15:30〜'],
    ['release-2026-11-24', '2026-11-24', 'CLUB CITTA’（神奈川）', '第1部 15:30〜', '第2部 18:15〜'],
  ].flatMap(([eventId, date, venue, part1, part2]) => [
    { id: `${eventId}-part1`, eventId, service: 'release' as const, date, venue, label: part1, time: part1.split(' ')[1] ?? '' },
    { id: `${eventId}-part2`, eventId, service: 'release' as const, date, venue, label: part2, time: part2.split(' ')[1] ?? '' },
  ]),
  {
    id: 'live-2026-11-11', eventId: 'live-2026-11-11', service: 'live', date: '2026-11-11', venue: '日本武道館（東京）', label: 'コンサート', time: '18:00',
  },
  {
    id: 'live-2026-11-26', eventId: 'live-2026-11-26', service: 'live', date: '2026-11-26', venue: '府中の森芸術劇場 どりーむホール（東京）', label: 'コンサート', time: '18:30',
  },
  {
    id: 'live-2026-12-07', eventId: 'live-2026-12-07', service: 'live', date: '2026-12-07', venue: 'NHK大阪ホール（大阪）', label: 'コンサート', time: '18:00',
  },
  {
    id: 'appearance-2026-12-13-comiccon', eventId: 'appearance-2026-12-13-comiccon', service: 'appearance', date: '2026-12-13', venue: '幕張メッセ（千葉）', label: 'スペシャルライブ', time: '10:00〜18:00',
  },
  {
    id: 'appearance-2026-10-31', eventId: 'appearance-2026-10-31', service: 'appearance', date: '2026-10-31', venue: '大阪城ホール（大阪）', label: '出演イベント', time: '15:30',
  },
  {
    id: 'appearance-2026-12-19', eventId: 'appearance-2026-12-19', service: 'appearance', date: '2026-12-19', venue: 'Zepp DiverCity(TOKYO)', label: '出演イベント', time: '17:00',
  },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  ...[
    ['2026-11-28', 'ベルサール飯田橋ファースト（東京）'],
    ['2026-11-29', 'ベルサール飯田橋ファースト（東京）'],
    ['2026-12-06', 'インテックス大阪 4号館（大阪）'],
    ['2026-12-12', 'ベルサール汐留 B1F（東京）'],
    ['2027-02-06', 'ベルサール飯田橋ファースト（東京）'],
  ].map(([date, venue]) => ({
    id: `fortune-calendar-${date}`,
    date,
    endDate: date,
    title: '7thシングル発売記念 forTUNE musicイベント',
    venue,
    category: 'forTUNE' as const,
    detail: '3ショット・4ショット／2ショット／個別お話し会／グループお話し会／個別サイン会／個別お絵描き会',
  })),
  {
    id: 'withlive-calendar-2026-10-27', date: '2026-10-27', endDate: '2026-10-27', time: '18:00〜順次開始予定',
    title: 'オンライン個別お話し会', venue: 'WithLIVE（オンライン）', category: 'WithLIVE', detail: '参加者を選択して購入（通常盤A・B 2枚セット）',
  },
  {
    id: 'withlive-calendar-2026-10-29', date: '2026-10-29', endDate: '2026-10-29', time: '18:00〜順次開始予定',
    title: 'オンライン個別お話し会', venue: 'WithLIVE（オンライン）', category: 'WithLIVE', detail: '参加者を選択して購入（通常盤A・B 2枚セット）',
  },
  {
    id: 'withlive-calendar-2026-10-30', date: '2026-10-30', endDate: '2026-10-30', time: '18:00〜順次開始予定',
    title: 'オンライン個別お話し会', venue: 'WithLIVE（オンライン）', category: 'WithLIVE', detail: '参加者を選択して購入（通常盤A・B 2枚セット）',
  },
  {
    id: 'release-2026-11-22', date: '2026-11-22', endDate: '2026-11-22', time: '第1部12:15／第2部15:30',
    title: 'ミニライブ＆お見送り会（アリオ橋本）', venue: 'アリオ橋本 1F屋外イベント広場（神奈川）', category: 'ミニライブ＆お見送り会', detail: '通常盤A+B 2枚セット 2,600円',
  },
  {
    id: 'release-2026-11-23', date: '2026-11-23', endDate: '2026-11-23', time: '第1部12:15／第2部15:30',
    title: 'ミニライブ＆お見送り会（神戸ハーバーランド）', venue: '神戸ハーバーランド スペースシアター（兵庫）', category: 'ミニライブ＆お見送り会', detail: '通常盤A+B 2枚セット 2,600円',
  },
  {
    id: 'release-2026-11-24', date: '2026-11-24', endDate: '2026-11-24', time: '第1部15:30／第2部18:15',
    title: 'ミニライブ＆お見送り会（CLUB CITTA’）', venue: 'CLUB CITTA’（神奈川）', category: 'ミニライブ＆お見送り会', detail: '通常盤A+B 2,600円＋ドリンク600円',
  },
  {
    id: 'live-2026-11-11', date: '2026-11-11', endDate: '2026-11-11', time: '開場17:00／開演18:00',
    title: 'BEYOOOOONDS CONCERT 2026 [IT\'S SHOOOOOWTIME BUDOOOOOKAN！]', venue: '日本武道館（東京）', category: 'ライブ', detail: '一般席9,800円',
  },
  {
    id: 'live-2026-11-26', date: '2026-11-26', endDate: '2026-11-26', time: '開場17:30／開演18:30',
    title: 'BEYOOOOONDS CONCERT 2026 [IT\'S SHOOOOOWTIME ENCOOOOORE！]', venue: '府中の森芸術劇場 どりーむホール（東京）', category: 'ライブ', detail: '出演：BEYOOOOONDS',
  },
  {
    id: 'live-2026-12-07', date: '2026-12-07', endDate: '2026-12-07', time: '開場17:00／開演18:00',
    title: 'BEYOOOOONDS CONCERT 2026 [IT\'S SHOOOOOWTIME ENCOOOOORE！]', venue: 'NHK大阪ホール（大阪）', category: 'ライブ', detail: '出演：BEYOOOOONDS',
  },
  {
    id: 'appearance-2026-12-13-comiccon', date: '2026-12-13', endDate: '2026-12-13', time: '10:00〜18:00',
    title: '東京コミコン2026 BEYOOOOONDS スペシャルライブ', venue: '幕張メッセ（千葉）', category: '出演イベント', detail: 'BEYOOOOONDSメンバー全員出演。前売一般1日券5,500円／当日一般1日券5,900円。',
  },
  {
    id: 'appearance-2026-10-31', date: '2026-10-31', endDate: '2026-10-31', time: '開場14:30／開演15:30',
    title: 'Livejack 2026 SMASH BEAT SP', venue: '大阪城ホール（大阪）', category: '出演イベント', detail: 'Juice=Juice・BEYOOOOONDS出演',
  },
  {
    id: 'appearance-2026-12-19', date: '2026-12-19', endDate: '2026-12-19', time: '16:00開場／17:00開演',
    title: 'IWA ROCK presented by e-Broad', venue: 'Zepp DiverCity(TOKYO)', category: '出演イベント', detail: '出演：ACIDMAN／BEYOOOOONDS／Dragon Ash／ROTTENGRAFFTY',
  },
];

export const DEFAULT_FEES: FeeItem[] = [
  {
    id: 'fortune-shipping',
    service: 'fortune',
    label: 'forTUNE 送料（お話し会等）',
    amount: 700,
    count: 1,
    active: true,
  },
  {
    id: 'fortune-payment',
    service: 'fortune',
    label: 'forTUNE 前払い手数料',
    amount: 187,
    count: 1,
    active: false,
  },
  {
    id: 'withlive-fee',
    service: 'withlive',
    label: 'WithLIVE 送料（1会計）※手数料は商品価格に含む',
    amount: 330,
    count: 1,
    active: true,
  },
];
