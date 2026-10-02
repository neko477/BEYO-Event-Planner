export type ServiceId = 'fortune' | 'withlive' | 'release' | 'live' | 'appearance';

export type EventKind = {
  id: string;
  service: ServiceId;
  label: string;
  shortLabel: string;
  price: number;
  cdPerSet: number;
  defaultOtherCost?: number;
  ticketOptions?: { id: string; label: string; price: number }[];
  maxTotal: number;
  perSelectionLimit: number;
  source: 'official' | 'unconfirmed';
  note?: string;
};

export type ScheduleSlot = {
  id: string;
  eventId: string;
  service: ServiceId;
  date: string;
  venue: string;
  label: string;
  time: string;
  members?: string;
  memberOptions?: string[];
};

export type CalendarEvent = {
  id: string;
  date: string;
  endDate?: string;
  time?: string;
  title: string;
  venue: string;
  category: 'WithLIVE' | 'forTUNE' | 'ミニライブ＆お見送り会' | 'ライブ' | '出演イベント';
  detail?: string;
};

export type PlanItem = {
  id: string;
  status?: 'input' | 'planned' | 'confirmed';
  confirmed?: boolean;
  eventId: string;
  scheduleId: string;
  quantity: number;
  member: string;
  note: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledVenue?: string;
  scheduledPart?: string;
  transportCost?: number;
  lodgingCost?: number;
  shippingCost?: number;
  otherCost?: number;
  ticketType?: string;
  releaseMode?: 'mini-live' | 'sendoff';
};

export type FeeItem = {
  id: string;
  service: ServiceId | 'common';
  label: string;
  amount: number;
  count: number;
  active: boolean;
};

export type SavedPlanner = {
  events: EventKind[];
  fees: FeeItem[];
  plans: PlanItem[];
};
