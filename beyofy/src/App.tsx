import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_EVENTS,
  DEFAULT_FEES,
  CALENDAR_EVENTS,
  EVENT_SOURCE_URL,
  OVERVIEW_SOURCE_URL,
  SCHEDULE_SLOTS,
} from './data';
import type { CalendarEvent, EventKind, FeeItem, PlanItem, SavedPlanner, ScheduleSlot, ServiceId } from './types';

const STORAGE_KEY = 'beyoplan-2026-7th-single-v2';

const serviceMeta: Record<ServiceId, { label: string; className: string }> = {
  fortune: { label: 'forTUNE music', className: 'fortune' },
  withlive: { label: 'WithLIVE', className: 'withlive' },
  release: { label: 'リリイベ', className: 'minilive' },
  live: { label: 'ライブ', className: 'live' },
  appearance: { label: 'イベント', className: 'appearance' },
};

const appName = 'BEYOOOOONDSの冬';

const yen = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

function cloneDefaults<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

const SAVE_CODE_PREFIX = 'BEYO1-';

function encodeSaveCode(data: SavedPlanner) {
  return `${SAVE_CODE_PREFIX}${btoa(encodeURIComponent(JSON.stringify(data)))}`;
}

function decodeSaveCode(code: string): SavedPlanner {
  const normalized = code.trim();
  if (!normalized.startsWith(SAVE_CODE_PREFIX)) throw new Error('保存コードの形式が違います。');
  const parsed = JSON.parse(decodeURIComponent(atob(normalized.slice(SAVE_CODE_PREFIX.length)))) as Partial<SavedPlanner>;
  if (!Array.isArray(parsed.events) || !Array.isArray(parsed.fees) || !Array.isArray(parsed.plans)) {
    throw new Error('保存コードの内容が正しくありません。');
  }
  return {
    events: mergeEventDefaults(parsed.events),
    fees: mergeFeeDefaults(parsed.fees),
    plans: parsed.plans.map(normalizePlan),
  } as SavedPlanner;
}

function parseNumber(value: string, fallback = 0) {
  const numeric = Number(value.replace(/,/g, ''));
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : fallback;
}

function formatInputAmount(value: number) {
  return value.toLocaleString('ja-JP');
}

function selectNumericInput(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.select();
}

function planStatus(plan: PlanItem): NonNullable<PlanItem['status']> {
  return plan.status ?? (plan.confirmed === true ? 'planned' : 'input');
}

function normalizePlan(plan: PlanItem): PlanItem {
  return { ...plan, status: planStatus(plan) };
}

function mergeEventDefaults(savedEvents: EventKind[]) {
  return DEFAULT_EVENTS.map((defaultEvent) => {
    const savedEvent = savedEvents.find((event) => event.id === defaultEvent.id);
    const releaseLimitMigration = defaultEvent.service === 'release' && savedEvent?.perSelectionLimit === 1
      ? { perSelectionLimit: defaultEvent.perSelectionLimit }
      : {};
    return savedEvent
      ? { ...cloneDefaults(defaultEvent), ...savedEvent, ...releaseLimitMigration, ticketOptions: defaultEvent.ticketOptions ?? savedEvent.ticketOptions, defaultOtherCost: savedEvent.defaultOtherCost ?? defaultEvent.defaultOtherCost }
      : cloneDefaults(defaultEvent);
  });
}

function mergeFeeDefaults(savedFees: FeeItem[]) {
  return DEFAULT_FEES.map((defaultFee) => {
    const savedFee = savedFees.find((fee) => fee.id === defaultFee.id);
    if (!savedFee) return cloneDefaults(defaultFee);
    const legacyWithlivePlaceholder = defaultFee.id === 'withlive-fee' && savedFee.amount === 0;
    const legacyFortuneShipping = defaultFee.id === 'fortune-shipping' && savedFee.amount === 700 && !savedFee.active;
    return {
      ...cloneDefaults(defaultFee),
      ...savedFee,
      ...(legacyWithlivePlaceholder || legacyFortuneShipping
        ? { amount: defaultFee.amount, active: true, label: defaultFee.label }
        : {}),
    };
  });
}

function readSaved(): SavedPlanner {
  const fallback = {
    events: cloneDefaults(DEFAULT_EVENTS),
    fees: cloneDefaults(DEFAULT_FEES),
    plans: [] as PlanItem[],
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Partial<SavedPlanner>;
    if (!Array.isArray(parsed.events) || !Array.isArray(parsed.fees) || !Array.isArray(parsed.plans)) return fallback;
    const plans = parsed.plans.filter((plan) =>
      DEFAULT_EVENTS.some((event) => event.id === plan.eventId) && SCHEDULE_SLOTS.some((slot) => slot.id === plan.scheduleId),
    ).map((plan) => {
      const slot = SCHEDULE_SLOTS.find((candidate) => candidate.id === plan.scheduleId);
      const normalized = normalizePlan(plan);
      return slot?.service === 'withlive' && normalized.member && !slot.memberOptions?.includes(normalized.member)
        ? { ...normalized, member: '' }
        : normalized;
    });
    const seenInputServices = new Set<ServiceId>();
    const dedupedPlans = plans.filter((plan) => {
      const event = DEFAULT_EVENTS.find((candidate) => candidate.id === plan.eventId);
      const isInput = plan.status === 'input' || (plan.status === undefined && !plan.confirmed);
      if (!event || !isInput) return true;
      if (seenInputServices.has(event.service)) return false;
      seenInputServices.add(event.service);
      return true;
    });
    return {
      events: mergeEventDefaults(parsed.events),
      fees: mergeFeeDefaults(parsed.fees),
      plans: dedupedPlans,
    };
  } catch {
    return fallback;
  }
}

type ResolvedSchedule = Pick<ScheduleSlot, 'date' | 'venue' | 'label' | 'time'>;

function timeValue(time: string) {
  const [hour = '99', minute = '99'] = time.match(/\d{1,2}:\d{2}/)?.[0]?.split(':') ?? [];
  return Number(hour) * 60 + Number(minute);
}

function resolveSchedule(plan: PlanItem, slot: ScheduleSlot): ResolvedSchedule {
  return {
    date: plan.scheduledDate ?? slot.date,
    time: plan.scheduledTime ?? slot.time,
    venue: plan.scheduledVenue ?? slot.venue,
    label: plan.scheduledPart ?? slot.label,
  };
}

function initialMember(slot: ScheduleSlot) {
  return slot.service === 'withlive' ? '' : slot.memberOptions?.[0] ?? slot.members ?? '';
}

const calendarCategories = ['WithLIVE', 'forTUNE', 'ミニライブ＆お見送り会', 'ライブ', '出演イベント'] as const;
const calendarCategoryMeta: Record<typeof calendarCategories[number], { label: string; className: string }> = {
  WithLIVE: { label: 'WithLIVE', className: 'withlive' },
  forTUNE: { label: 'forTUNE', className: 'fortune' },
  'ミニライブ＆お見送り会': { label: 'ミニライブ＆お見送り会', className: 'minilive' },
  ライブ: { label: 'ライブ', className: 'live' },
  出演イベント: { label: '出演イベント', className: 'appearance' },
};
const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

function calendarCells(year: number, month: number) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();
  return [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: lastDay }, (_, index) => index + 1)];
}

function calendarCompactTitle(category: CalendarEvent['category'], title: string) {
  if (category === 'WithLIVE') return 'オンラインお話し会';
  if (category === 'forTUNE') return 'forTUNE musicイベント';
  if (category === 'ライブ') return 'CONCERT 2026';
  if (category === 'ミニライブ＆お見送り会') return 'ミニライブ＆お見送り会';
  return title;
}

function selectionKey(plan: PlanItem) {
  return `${plan.eventId}::${plan.releaseMode ?? 'mini-live'}::${plan.scheduledDate ?? plan.scheduleId}::${plan.scheduledTime ?? ''}::${plan.member.trim()}::${plan.ticketType ?? ''}`;
}

function selectedTicketPrice(event: EventKind, plan: PlanItem) {
  if (event.service === 'release' && plan.releaseMode === 'sendoff') return Math.round(event.price / event.cdPerSet);
  return event.ticketOptions?.find((option) => option.id === plan.ticketType)?.price ?? event.price;
}

function isUnlimitedRelease(event: EventKind, plan: PlanItem) {
  return event.service === 'release' && plan.releaseMode === 'sendoff';
}

function planCdCount(event: EventKind, plan: PlanItem) {
  return isUnlimitedRelease(event, plan) ? 1 : event.cdPerSet;
}

function initialTicketType(event: EventKind) {
  return event.ticketOptions?.[0]?.id;
}

const RELEASE_SHIPPING_DEFAULT = 220;

function clampPlans(events: EventKind[], plans: PlanItem[]) {
  const used = new Map<string, number>();
  const usedBySelection = new Map<string, number>();
  return plans.map((plan) => {
    const event = events.find((candidate) => candidate.id === plan.eventId);
    if (!event) return { ...plan, quantity: 0 };
    const unlimited = isUnlimitedRelease(event, plan);
    const remaining = unlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, event.maxTotal - (used.get(event.id) ?? 0));
    const key = selectionKey(plan);
    const selectionRemaining = unlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, event.perSelectionLimit - (usedBySelection.get(key) ?? 0));
    const safeQuantity = Math.min(plan.quantity, selectionRemaining, remaining);
    if (!unlimited) {
      used.set(event.id, (used.get(event.id) ?? 0) + safeQuantity);
      usedBySelection.set(key, (usedBySelection.get(key) ?? 0) + safeQuantity);
    }
    return { ...plan, quantity: safeQuantity };
  });
}

export default function App() {
  const saved = readSaved();
  const [events, setEvents] = useState<EventKind[]>(saved.events);
  const [fees, setFees] = useState<FeeItem[]>(saved.fees);
  const [plans, setPlans] = useState<PlanItem[]>(saved.plans);
  const [filter, setFilter] = useState<'all' | ServiceId>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [calendarPage, setCalendarPage] = useState(0);
  const [saveCode, setSaveCode] = useState('');
  const [saveCodeMessage, setSaveCodeMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, fees, plans }));
  }, [events, fees, plans]);

  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);
  const slotById = useMemo(() => new Map(SCHEDULE_SLOTS.map((slot) => [slot.id, slot])), []);

  const usedByEvent = useMemo(() => {
    const used = new Map<string, number>();
    plans.filter((plan) => planStatus(plan) !== 'input').forEach((plan) => {
      const event = eventById.get(plan.eventId);
      if (event && !isUnlimitedRelease(event, plan)) used.set(plan.eventId, (used.get(plan.eventId) ?? 0) + plan.quantity);
    });
    return used;
  }, [plans, eventById]);

  const plansWithDetail = useMemo(
    () =>
      plans
        .map((plan) => {
          const event = eventById.get(plan.eventId);
          const slot = slotById.get(plan.scheduleId);
          return { plan, event, slot, schedule: slot ? resolveSchedule(plan, slot) : undefined };
        })
        .filter((detail): detail is { plan: PlanItem; event: EventKind; slot: ScheduleSlot; schedule: ResolvedSchedule } => Boolean(detail.event && detail.slot && detail.schedule))
        .sort((left, right) => {
          const dateDiff = left.schedule.date.localeCompare(right.schedule.date);
          return dateDiff || timeValue(left.schedule.time) - timeValue(right.schedule.time);
        }),
    [plans, eventById, slotById],
  );
  const inputPlansWithDetail = plansWithDetail.filter(({ plan }) => planStatus(plan) === 'input');
  const plannedPlansWithDetail = plansWithDetail.filter(({ plan }) => planStatus(plan) === 'planned');
  const confirmedPlansWithDetail = plansWithDetail.filter(({ plan }) => planStatus(plan) === 'confirmed');
  const confirmedGroups = useMemo(() => {
    const groups = new Map<string, typeof confirmedPlansWithDetail>();
    confirmedPlansWithDetail.forEach((detail) => {
      const key = detail.event.id;
      groups.set(key, [...(groups.get(key) ?? []), detail]);
    });
    return [...groups.entries()];
  }, [confirmedPlansWithDetail]);

  const planProductTotal = (plan: PlanItem) => {
    const event = eventById.get(plan.eventId);
    return plan.quantity * (event ? selectedTicketPrice(event, plan) : 0);
  };
  const planExpenseTotal = (plan: PlanItem) => (plan.transportCost ?? 0) + (plan.lodgingCost ?? 0) + (plan.shippingCost ?? 0) + (plan.otherCost ?? 0);
  const planLineTotal = (plan: PlanItem) => planProductTotal(plan) + planExpenseTotal(plan);
  const planCdTotal = (plan: PlanItem) => {
    const event = eventById.get(plan.eventId);
    return plan.quantity * (event ? planCdCount(event, plan) : 0);
  };
  const activeFees = fees.filter((fee) => fee.active);
  const feesTotal = activeFees.reduce((sum, fee) => sum + fee.amount * fee.count, 0);
  const plannedTicketTotal = plannedPlansWithDetail.reduce((sum, { plan }) => sum + planProductTotal(plan), 0);
  const confirmedTicketTotal = confirmedPlansWithDetail.reduce((sum, { plan }) => sum + planProductTotal(plan), 0);
  const plannedExpenseTotal = plannedPlansWithDetail.reduce((sum, { plan }) => sum + planExpenseTotal(plan), 0);
  const confirmedExpenseTotal = confirmedPlansWithDetail.reduce((sum, { plan }) => sum + planExpenseTotal(plan), 0);
  const ticketTotal = plannedTicketTotal + confirmedTicketTotal;
  const expenseTotal = plannedExpenseTotal + confirmedExpenseTotal;
  const total = ticketTotal + expenseTotal + feesTotal;
  const activePlansWithDetail = plansWithDetail.filter(({ plan }) => planStatus(plan) !== 'input');
  const attendanceDays = new Set(activePlansWithDetail.map(({ schedule }) => schedule.date)).size;
  const attendanceByDate = [...activePlansWithDetail.reduce((groups, detail) => {
    const key = detail.schedule.date;
    groups.set(key, [...(groups.get(key) ?? []), detail]);
    return groups;
  }, new Map<string, typeof activePlansWithDetail>()).entries()].sort(([a], [b]) => a.localeCompare(b));
  const cdTotal = activePlansWithDetail.reduce((sum, { plan }) => sum + planCdTotal(plan), 0);
  const plannedSets = activePlansWithDetail.reduce((sum, { plan }) => sum + plan.quantity, 0);
  const transportTotal = activePlansWithDetail.reduce((sum, { plan }) => sum + (plan.transportCost ?? 0), 0);
  const lodgingTotal = activePlansWithDetail.reduce((sum, { plan }) => sum + (plan.lodgingCost ?? 0), 0);
  const otherExpenseTotal = activePlansWithDetail.reduce((sum, { plan }) => sum + (plan.otherCost ?? 0), 0);

  const totalForService = (service: FeeItem['service']) => {
    const products = service === 'common' ? 0 : activePlansWithDetail.reduce((sum, { plan }) => {
      const event = eventById.get(plan.eventId);
      return event?.service === service ? sum + planLineTotal(plan) : sum;
    }, 0);
    const feeTotal = activeFees
      .filter((fee) => fee.service === service)
      .reduce((sum, fee) => sum + fee.amount * fee.count, 0);
    return products + feeTotal;
  };

  const addPlan = (service: ServiceId = 'fortune') => {
    const event = events.find((candidate) => candidate.service === service) ?? events[0];
    if (!event) return;
    const slot = SCHEDULE_SLOTS.find((candidate) => candidate.eventId === event.id);
    if (!slot) return;
    setPlans((current) => [
      ...current,
      {
        id: createId('plan'),
        status: 'input',
        eventId: event.id,
        scheduleId: slot.id,
        quantity: 0,
        ticketType: initialTicketType(event),
        member: initialMember(slot),
        note: '',
        scheduledDate: slot.date,
        scheduledTime: slot.time,
        scheduledVenue: slot.venue,
        scheduledPart: slot.label,
        transportCost: 0,
        lodgingCost: 0,
        shippingCost: 0,
        otherCost: event.defaultOtherCost ?? 0,
      },
    ]);
  };

  const selectCategory = (service: ServiceId) => {
    setFilter(service);
    setPlans((current) => {
      const matchingInputs = current.filter((plan) => planStatus(plan) === 'input' && eventById.get(plan.eventId)?.service === service);
      const keepId = matchingInputs[0]?.id;
      const withoutDuplicates = current.filter((plan) => !matchingInputs.slice(1).some((duplicate) => duplicate.id === plan.id));
      return withoutDuplicates;
    });
    if (!inputPlansWithDetail.some(({ event }) => event.service === service)) addPlan(service);
  };

  const createSaveCode = async () => {
    const code = encodeSaveCode({ events, fees, plans });
    setSaveCode(code);
    setSaveCodeMessage('保存コードを作成しました。コピーして保管してください。');
    try {
      await navigator.clipboard.writeText(code);
      setSaveCodeMessage('保存コードを作成してクリップボードにコピーしました。');
    } catch {
      // Clipboard permission is optional; the code remains visible for manual copying.
    }
  };

  const loadSaveCode = () => {
    try {
      const restored = decodeSaveCode(saveCode);
      setEvents(restored.events);
      setFees(restored.fees);
      setPlans(restored.plans);
      setSaveCodeMessage('保存コードから予定を復元しました。');
    } catch (error) {
      setSaveCodeMessage(error instanceof Error ? error.message : '保存コードを読み込めませんでした。');
    }
  };

  const confirmPlan = (planId: string) => {
    const plan = plans.find((candidate) => candidate.id === planId);
    const slot = plan ? slotById.get(plan.scheduleId) : undefined;
    if (slot?.service === 'withlive' && !plan?.member) {
      window.alert('WithLIVEの参加者を選択してください。');
      return;
    }
    if (!plan) return;
    setPlans((current) => [
      ...current.map((candidate) => candidate.id === planId ? { ...candidate, status: 'planned' as const, confirmed: false } : candidate),
      {
        ...plan,
        id: createId('plan'),
        status: 'input' as const,
        confirmed: false,
        transportCost: 0,
        lodgingCost: 0,
        shippingCost: 0,
        otherCost: 0,
      },
    ]);
  };

  const confirmPlannedPlan = (planId: string) => {
    setPlans((current) => current.map((plan) => plan.id === planId ? { ...plan, status: 'confirmed' as const, confirmed: true } : plan));
  };

  const editPlan = (planId: string) => {
    const target = plans.find((plan) => plan.id === planId);
    if (!target) return;
    const retainedInput = plans.find((plan) => planStatus(plan) === 'input' && plan.id !== planId);
    setPlans((current) => current.flatMap((plan) => {
      if (plan.id === planId) return [{ ...plan, status: 'input' as const, confirmed: false }];
      if (retainedInput && target.status !== 'input' && plan.id === retainedInput.id) return [];
      return [plan];
    }));
  };

  const changePlanEvent = (planId: string, eventId: string) => {
    const event = eventById.get(eventId);
    const currentPlan = plans.find((plan) => plan.id === planId);
    const eventSlots = SCHEDULE_SLOTS.filter((candidate) => candidate.eventId === event?.id);
    const slot = eventSlots.find((candidate) => candidate.date === currentPlan?.scheduledDate) ?? eventSlots[0];
    if (!event || !slot) return;
    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
            ...plan,
            eventId,
            scheduleId: slot.id,
            quantity: 0,
            ticketType: initialTicketType(event),
            member: initialMember(slot),
            scheduledDate: slot.date,
            scheduledTime: slot.time,
            scheduledVenue: slot.venue,
            scheduledPart: slot.label,
          }
          : plan,
      ),
    );
  };

  const changePlanSlot = (planId: string, scheduleId: string) => {
    const slot = slotById.get(scheduleId);
    setPlans((current) => {
      const nextPlans = current.map((plan) =>
        plan.id === planId && slot
          ? {
            ...plan,
            scheduleId,
            member: (slot.memberOptions?.[0] ?? slot.members) || plan.member,
            scheduledDate: slot.date,
            scheduledTime: slot.time,
            scheduledVenue: slot.venue,
            scheduledPart: slot.label,
          }
          : plan,
      );
      return clampPlans(events, nextPlans);
    });
  };

  const changePlanDate = (planId: string, date: string) => {
    setPlans((current) => current.map((plan) => {
      if (plan.id !== planId) return plan;
      const slot = SCHEDULE_SLOTS.find((candidate) => candidate.eventId === plan.eventId && candidate.date === date);
      if (!slot) return plan;
      return {
        ...plan,
        scheduleId: slot.id,
        member: initialMember(slot),
        scheduledDate: slot.date,
        scheduledTime: slot.time,
        scheduledVenue: slot.venue,
        scheduledPart: slot.label,
      };
    }));
  };

  const changePlanPart = (planId: string, scheduleId: string) => {
    const slot = slotById.get(scheduleId);
    if (!slot) return;
    setPlans((current) => current.map((plan) => plan.id === planId ? {
      ...plan,
      scheduleId,
      member: initialMember(slot),
      scheduledDate: slot.date,
      scheduledTime: slot.time,
      scheduledVenue: slot.venue,
      scheduledPart: slot.label,
    } : plan));
  };

  const updatePlan = (planId: string, patch: Partial<PlanItem>) => {
    setPlans((current) => {
      const nextPlans = current.map((plan) => (plan.id === planId ? { ...plan, ...patch } : plan));
      return clampPlans(events, nextPlans);
    });
  };

  const updatePlanQuantity = (planId: string, rawValue: string) => {
    setPlans((current) => {
      const currentPlan = current.find((plan) => plan.id === planId);
      if (!currentPlan) return current;
      const event = eventById.get(currentPlan.eventId);
      if (!event) return current;
      const unlimited = isUnlimitedRelease(event, currentPlan);
      const usedElsewhere = current
        .filter((plan) => plan.id !== planId && plan.eventId === event.id && !isUnlimitedRelease(event, plan))
        .reduce((sum, plan) => sum + plan.quantity, 0);
      const usedSameSelection = current
        .filter((plan) => plan.id !== planId && selectionKey(plan) === selectionKey(currentPlan))
        .reduce((sum, plan) => sum + plan.quantity, 0);
      const maxForRow = Math.min(
        unlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, event.perSelectionLimit - usedSameSelection),
        unlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, event.maxTotal - usedElsewhere),
      );
      const quantity = Math.min(parseNumber(rawValue), maxForRow);
      return current.map((plan) => (plan.id === planId ? { ...plan, quantity } : plan));
    });
  };

  const removePlan = (planId: string) => setPlans((current) => current.filter((plan) => plan.id !== planId));

  const updateEvent = (eventId: string, key: keyof Pick<EventKind, 'price' | 'cdPerSet' | 'maxTotal' | 'perSelectionLimit'>, value: string) => {
    const nextEvents = events.map((event) => (event.id === eventId ? { ...event, [key]: parseNumber(value) } : event));
    setEvents(nextEvents);
    setPlans((current) => clampPlans(nextEvents, current));
  };

  const updateFee = (feeId: string, patch: Partial<FeeItem>) => {
    setFees((current) => current.map((fee) => (fee.id === feeId ? { ...fee, ...patch } : fee)));
  };

  const resetAll = () => {
    if (!window.confirm('予定・金額設定をすべて初期状態に戻します。よろしいですか？')) return;
    setEvents(cloneDefaults(DEFAULT_EVENTS));
    setFees(cloneDefaults(DEFAULT_FEES));
    setPlans([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const copySummary = async () => {
    const lines = [
      `${appName} — 参加希望・参加決定・費用`,
      `総額: ${yen.format(total)} / CD合計: ${cdTotal}枚 / 参加券・セット: ${plannedSets}`,
      '',
      '【参加予定イベント】',
      ...plannedPlansWithDetail.map(({ plan, event, schedule }) =>
        `${schedule.date} ${schedule.time}｜${event.label}｜${schedule.venue}｜${plan.member || 'メンバー未入力'}｜${plan.quantity}セット（${yen.format(planLineTotal(plan))}）`,
      ),
      '',
      '【参加決定（支払い確定）】',
      ...confirmedPlansWithDetail.map(({ plan, event, schedule }) =>
        `${schedule.date} ${schedule.time}｜${event.label}｜${schedule.venue}｜${plan.member || 'メンバー未入力'}｜${plan.quantity}セット（${yen.format(planLineTotal(plan))}）`,
      ),
      '',
      '【追加費用】',
      ...activeFees.map((fee) => `${fee.label}: ${yen.format(fee.amount)} × ${fee.count} = ${yen.format(fee.amount * fee.count)}`),
      '',
      '※公式の販売条件・日程は変更される場合があります。申込前に必ず公式情報をご確認ください。',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('以下をコピーしてください', lines.join('\n'));
    }
  };

  const displayedPlans = inputPlansWithDetail.filter(({ event }) => filter === 'all' || event.service === filter);
  const displayedPlannedPlans = plannedPlansWithDetail.filter(({ event }) => filter === 'all' || event.service === filter);
  const withLiveNeedsSetup = events.find((event) => event.service === 'withlive')?.maxTotal === 0;
  const calendarMonthKeys = useMemo(() => ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02'], []);
  const visibleCalendarMonths = calendarMonthKeys.slice(calendarPage, calendarPage + 2);

  return (
    <main className="app-shell">
      <header className="masthead">
        <div className="wordmark" aria-label="BEYOOOOONDS">
          <span>BEYOOOOONDS</span>
        </div>
        <div className="masthead-actions">
          <span className="saved-state">端末に自動保存</span>
          <button className="text-button" onClick={copySummary}>{copied ? 'コピー済み' : '一覧をコピー'}</button>
          <button className="outline-button" onClick={() => setSettingsOpen(true)}>設定を開く</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">7th SINGLE EVENT LEDGER</p>
          <h1>{appName}</h1>
          <p>『笑止千万／勝利のセンタク』発売記念イベント用の、個人向け予定・費用台帳です。</p>
        </div>
        <div className="hero-total ticket-edge">
          <span>現在の合計</span>
          <strong>{yen.format(ticketTotal)}</strong>
          <small className="hero-total-caption">CD代・チケット代</small>
          <div className="total-subline"><b>{cdTotal}</b> CD枚&nbsp;&nbsp;·&nbsp;&nbsp;<b>{plannedSets}</b> 参加券・セット</div>
          <div className="total-breakdown">
            <span>forTUNE <b>{yen.format(totalForService('fortune'))}</b></span>
            <span>WithLIVE <b>{yen.format(totalForService('withlive'))}</b></span>
            <span>リリイベ <b>{yen.format(totalForService('release'))}</b></span>
            <span>ライブ <b>{yen.format(totalForService('live'))}</b></span>
            <span>イベント <b>{yen.format(totalForService('appearance'))}</b></span>
            {totalForService('common') > 0 && <span>共通費用 <b>{yen.format(totalForService('common'))}</b></span>}
          </div>
          <div className="hero-expense-summary"><span>交通費 <b>{yen.format(transportTotal)}</b></span><span>宿泊費 <b>{yen.format(lodgingTotal)}</b></span><span>その他・手数料 <b>{yen.format(otherExpenseTotal + feesTotal)}</b></span></div>
          <div className="hero-grand-total">トータル <b>{yen.format(total)}</b></div>
        </div>
      </section>

      <section className="notice-bar">
        <span className="notice-mark">!</span>
        <p><b>公式情報を初期値に登録済み。</b> 商品価格・上限・送料は「設定」でいつでも変更できます。日程や販売条件は申込前に公式ページで再確認してください。</p>
        <a href={EVENT_SOURCE_URL} target="_blank" rel="noreferrer">forTUNE公式詳細 ↗</a>
      </section>

      {withLiveNeedsSetup && (
        <section className="withlive-alert">
          <div><b>WithLIVEの購入上限は未設定です。</b><span>販売詳細公開後に「設定」から公式の上限を登録すると、購入数を入力できます。</span></div>
          <button onClick={() => setSettingsOpen(true)}>WithLIVEを設定</button>
        </section>
      )}

      <section className="dashboard">
        <div className="ledger-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MY SCHEDULE</p>
              <h2>入力中のイベント</h2>
            </div>
            <div className="heading-actions">
              <div className="filter-switch" aria-label="表示するサービス">
                <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>すべて</button>
                <button className={filter === 'fortune' ? 'is-active' : ''} onClick={() => selectCategory('fortune')}>forTUNE</button>
                <button className={filter === 'withlive' ? 'is-active' : ''} onClick={() => selectCategory('withlive')}>WithLIVE</button>
                <button className={filter === 'release' ? 'is-active' : ''} onClick={() => selectCategory('release')}>リリイベ</button>
                <button className={filter === 'live' ? 'is-active' : ''} onClick={() => selectCategory('live')}>ライブ</button>
                <button className={filter === 'appearance' ? 'is-active' : ''} onClick={() => selectCategory('appearance')}>イベント</button>
              </div>
            </div>
          </div>

          {displayedPlans.length === 0 ? (
            <div className="empty-state ticket-edge">
              <div><h3>入力中のイベントはありません</h3><p>上のカテゴリを選ぶと、そのカテゴリの入力欄が自動で開きます。</p></div>
            </div>
          ) : (
            <div className="plans-list">
              {displayedPlans.map(({ plan, event, slot, schedule }) => {
                const unlimitedRelease = isUnlimitedRelease(event, plan);
                const usedOther = unlimitedRelease ? 0 : (usedByEvent.get(event.id) ?? 0) - plan.quantity;
                const usedSameSelection = plans
                  .filter((candidate) => candidate.id !== plan.id && selectionKey(candidate) === selectionKey(plan))
                  .reduce((sum, candidate) => sum + candidate.quantity, 0);
                const availableForRow = unlimitedRelease ? Number.MAX_SAFE_INTEGER : Math.min(
                  Math.max(0, event.perSelectionLimit - usedSameSelection),
                  Math.max(0, event.maxTotal - usedOther),
                );
                const eventSlots = SCHEDULE_SLOTS.filter((candidate) => candidate.eventId === event.id);
                const eventDates = [...new Set(eventSlots.map((candidate) => candidate.date))];
                const partsForDate = eventSlots.filter((candidate) => candidate.date === schedule.date);
                const eventFirst = event.service === 'release' || event.service === 'live' || event.service === 'appearance';
                return (
                  <article className={`plan-card ${serviceMeta[event.service].className}`} key={plan.id}>
                    <div className="plan-main">
                      <div className="plan-topline">
                        <span className={`service-stamp ${serviceMeta[event.service].className}`}>{serviceMeta[event.service].label}</span>
                        {event.source === 'unconfirmed' && <span className="unconfirmed-stamp">販売条件を確認</span>}
                        <button className="delete-button" aria-label="予定を削除" onClick={() => removePlan(plan.id)}>×</button>
                      </div>
                      <div className="plan-grid">
                        {eventFirst ? <>
                          <label className="field field-wide"><span>イベント種別</span>
                            <select value={plan.eventId} onChange={(e) => changePlanEvent(plan.id, e.target.value)}>
                              {events.filter((candidate) => filter === 'all' || candidate.service === filter).map((candidate) => <option key={candidate.id} value={candidate.id}>{serviceMeta[candidate.service].label}｜{candidate.label}</option>)}
                            </select>
                          </label>
                          <label className="field"><span>公式の日程</span>
                            <select value={schedule.date} onChange={(e) => changePlanDate(plan.id, e.target.value)}>
                              {eventDates.map((date) => <option key={date} value={date}>{date}｜{eventSlots.find((candidate) => candidate.date === date)?.venue}</option>)}
                            </select>
                          </label>
                        </> : <>
                          <label className="field"><span>公式の日程</span>
                            <select value={schedule.date} onChange={(e) => changePlanDate(plan.id, e.target.value)}>
                              {eventDates.map((date) => <option key={date} value={date}>{date}｜{eventSlots.find((candidate) => candidate.date === date)?.venue}</option>)}
                            </select>
                          </label>
                          <label className="field field-wide"><span>イベント種別</span>
                            <select value={plan.eventId} onChange={(e) => changePlanEvent(plan.id, e.target.value)}>
                              {events.filter((candidate) => filter === 'all' || candidate.service === filter).map((candidate) => <option key={candidate.id} value={candidate.id}>{serviceMeta[candidate.service].label}｜{candidate.label}</option>)}
                            </select>
                          </label>
                        </>}
                        {event.service === 'release' && <label className="field field-wide"><span>参加券の種類</span>
                          <select value={plan.releaseMode ?? 'mini-live'} onChange={(e) => updatePlan(plan.id, { releaseMode: e.target.value as PlanItem['releaseMode'], quantity: 0 })}>
                            <option value="mini-live">ミニライブ＆お見送り会（2枚セット・￥2,600）</option>
                            <option value="sendoff">お見送り会参加券（通常盤・1枚￥1,300）</option>
                          </select>
                        </label>}
                        {event.ticketOptions && event.ticketOptions.length > 0 && <label className="field"><span>チケット種別</span>
                          <select value={plan.ticketType ?? event.ticketOptions[0].id} onChange={(e) => updatePlan(plan.id, { ticketType: e.target.value })}>
                            {event.ticketOptions.map((option) => <option key={option.id} value={option.id}>{option.label}｜{yen.format(option.price)}</option>)}
                          </select>
                        </label>}
                        {(event.service === 'fortune' || event.service === 'release') && partsForDate.length > 0 && (
                          <label className="field"><span>公式の部</span>
                            <select value={plan.scheduleId} onChange={(e) => changePlanPart(plan.id, e.target.value)}>
                              {partsForDate.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}｜{candidate.time}</option>)}
                            </select>
                          </label>
                        )}
                        <label className="field"><span>開始時間（個別に編集可）</span>
                          <input value={schedule.time} onChange={(e) => updatePlan(plan.id, { scheduledTime: e.target.value })} placeholder="例：13:10" />
                        </label>
                        <label className="field"><span>会場・接続先（個別に編集可）</span>
                          <input value={schedule.venue} onChange={(e) => updatePlan(plan.id, { scheduledVenue: e.target.value })} placeholder="会場・接続先" />
                        </label>
                        {(event.service === 'fortune' || event.service === 'withlive') && <label className="field"><span>{event.service === 'withlive' ? '参加者を選択' : '対象メンバー・グループ'}</span>
                          {slot.memberOptions && slot.memberOptions.length > 0 ? (
                            <select value={plan.member} onChange={(e) => updatePlan(plan.id, { member: e.target.value })}>
                              {event.service === 'withlive' && <option value="" disabled>参加者を選択</option>}
                              {slot.memberOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          ) : (
                            <input value={plan.member} onChange={(e) => updatePlan(plan.id, { member: e.target.value })} placeholder="名前・グループを入力" />
                          )}
                        </label>}
                        <label className="field"><span>メモ</span>
                          <input value={plan.note} onChange={(e) => updatePlan(plan.id, { note: e.target.value })} placeholder="例：第1希望" />
                        </label>
                      </div>
                      <div className="expense-fields">
                        {event.service !== 'withlive' && <>
                          <label className="field"><span>交通費（往復）</span><input type="text" inputMode="numeric" onFocus={selectNumericInput} value={formatInputAmount(plan.transportCost ?? 0)} onChange={(e) => updatePlan(plan.id, { transportCost: parseNumber(e.target.value) })} placeholder="0" /></label>
                          <label className="field"><span>宿泊費（合計）</span><input type="text" inputMode="numeric" onFocus={selectNumericInput} value={formatInputAmount(plan.lodgingCost ?? 0)} onChange={(e) => updatePlan(plan.id, { lodgingCost: parseNumber(e.target.value) })} placeholder="0" /></label>
                        </>}
                        <label className="field"><span>その他費用</span><input type="text" inputMode="numeric" onFocus={selectNumericInput} value={formatInputAmount(plan.otherCost ?? 0)} onChange={(e) => updatePlan(plan.id, { otherCost: parseNumber(e.target.value) })} placeholder="0" /></label>
                        {event.service === 'release' && <button type="button" className={`shipping-toggle ${plan.shippingCost ? 'is-selected' : ''}`} onClick={() => updatePlan(plan.id, { shippingCost: plan.shippingCost ? 0 : RELEASE_SHIPPING_DEFAULT })} aria-pressed={Boolean(plan.shippingCost)}>
                          {plan.shippingCost ? `送料を外す（${yen.format(plan.shippingCost)}）` : `送料を加算（${yen.format(RELEASE_SHIPPING_DEFAULT)}）`}
                        </button>}
                      </div>
                      <div className="plan-footer">
                        <div className="location-line"><span>{schedule.date}</span><b>{schedule.time}</b><span>{schedule.venue}</span></div>
                        <p>{event.note}</p>
                      </div>
                    </div>
                    <div className="quantity-panel">
                      <label>{event.service === 'release' && plan.releaseMode === 'sendoff' ? '通常盤枚数' : event.service === 'live' || event.service === 'appearance' ? 'チケット枚数' : '購入セット数'}</label>
                      <div className="quantity-control">
                        <button type="button" className="quantity-stepper" aria-label="数量を1減らす" disabled={plan.quantity <= 0} onClick={() => updatePlanQuantity(plan.id, String(plan.quantity - 1))}>−</button>
                        <input type="text" inputMode="numeric" onFocus={selectNumericInput} maxLength={8} value={plan.quantity} onChange={(e) => updatePlanQuantity(plan.id, e.target.value)} />
                        <button type="button" className="quantity-stepper" aria-label="数量を1増やす" disabled={plan.quantity >= availableForRow} onClick={() => updatePlanQuantity(plan.id, String(plan.quantity + 1))}>＋</button>
                        <span>{event.service === 'release' && plan.releaseMode === 'sendoff' || event.service === 'live' || event.service === 'appearance' ? '枚' : 'セット'}</span>
                      </div>
                      <button className="confirm-button quantity-confirm" onClick={() => confirmPlan(plan.id)}>決定</button>
                      <small>{unlimitedRelease ? '通常盤の購入制限なし' : `この枠: 0〜${availableForRow} / カテゴリ残り ${Math.max(0, event.maxTotal - usedOther)}`}</small>
                      <strong>{yen.format(planLineTotal(plan))}</strong>
                      <span className="cd-caption">CD {planCdTotal(plan)}枚</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <p className="privacy-note">入力内容はこのブラウザ内にのみ保存されます。外部には送信されません。</p>
        </div>

        <aside className="summary-rail">
          <section className="planned-events-section">
            <div className="planned-events-heading"><div><p className="eyebrow">WISHLIST</p><h2>参加予定イベント</h2></div><span>参加希望として登録済み</span></div>
            {displayedPlannedPlans.length === 0 ? <p className="muted-row planned-empty">入力欄で「決定」したイベントがここに表示されます。</p> : <div className="planned-events-list">
              {displayedPlannedPlans.map(({ plan, event, schedule }) => <article className={`planned-event-row ${serviceMeta[event.service].className}`} key={plan.id}>
                <span className="mini-dot"></span>
                <div className="planned-event-main"><strong>{schedule.date} {schedule.label}</strong><span>{serviceMeta[event.service].label}｜{event.label}｜{plan.member || 'メンバー未入力'}｜{plan.quantity}{event.service === 'release' && plan.releaseMode === 'sendoff' ? '枚' : 'セット'}</span></div>
                <div className="event-cost-stack"><b>チケット {yen.format(planProductTotal(plan))}</b>{(plan.transportCost ?? 0) > 0 && <span>交通費 {yen.format(plan.transportCost ?? 0)}</span>}{(plan.lodgingCost ?? 0) > 0 && <span>宿泊費 {yen.format(plan.lodgingCost ?? 0)}</span>}{(plan.shippingCost ?? 0) > 0 && <span>送料 {yen.format(plan.shippingCost ?? 0)}</span>}{(plan.otherCost ?? 0) > 0 && <span>その他 {yen.format(plan.otherCost ?? 0)}</span>}<strong>合計 {yen.format(planLineTotal(plan))}</strong></div>
                <div className="confirmed-actions"><button className="text-button" onClick={() => editPlan(plan.id)}>編集</button><button className="confirm-button planned-confirm" onClick={() => confirmPlannedPlan(plan.id)}>決定</button><button className="delete-button" aria-label="参加予定イベントを削除" onClick={() => removePlan(plan.id)}>×</button></div>
              </article>)}
            </div>}
          </section>
          <section className="rail-card confirmed-card">
            <div className="rail-heading"><span>CONFIRMED</span><h2>決定済みイベント</h2></div>
            {confirmedGroups.length === 0 ? <p className="muted-row">決定したイベントはまだありません</p> : confirmedGroups.map(([eventId, details]) => {
              const groupEvent = details[0].event;
              return <div className="confirmed-group" key={eventId}>
                <div className="confirmed-group-title"><span className={`mini-dot ${groupEvent.service}`}></span><b>{serviceMeta[groupEvent.service].label}｜{groupEvent.label}</b></div>
                {details.map(({ plan, schedule }) => <div className="confirmed-item" key={plan.id}>
                  <div><strong>{schedule.date} {schedule.label}</strong><span>{plan.member || '参加者未選択'}｜{plan.quantity}{groupEvent.service === 'release' && plan.releaseMode === 'sendoff' ? '枚' : 'セット'}</span><div className="event-cost-stack"><b>チケット {yen.format(planProductTotal(plan))}</b>{(plan.transportCost ?? 0) > 0 && <span>交通費 {yen.format(plan.transportCost ?? 0)}</span>}{(plan.lodgingCost ?? 0) > 0 && <span>宿泊費 {yen.format(plan.lodgingCost ?? 0)}</span>}{(plan.shippingCost ?? 0) > 0 && <span>送料 {yen.format(plan.shippingCost ?? 0)}</span>}{(plan.otherCost ?? 0) > 0 && <span>その他 {yen.format(plan.otherCost ?? 0)}</span>}<strong>合計 {yen.format(planLineTotal(plan))}</strong></div></div>
                  <div className="confirmed-actions"><button className="text-button" onClick={() => editPlan(plan.id)}>編集</button><button className="delete-button" aria-label="決定済みイベントを削除" onClick={() => removePlan(plan.id)}>×</button></div>
                </div>)}
              </div>;
            })}
          </section>
          <section className="rail-card">
            <div className="rail-heading"><span>SUM</span><h2>費用内訳</h2></div>
            <div className="cost-row"><span>参加予定｜CD・チケット代</span><b>{yen.format(plannedTicketTotal)}</b></div>
            <div className="cost-row expense-row"><span>参加予定｜交通・宿泊・その他</span><b>{yen.format(plannedExpenseTotal)}</b></div>
            <div className="cost-row"><span>決定済み｜CD・チケット代</span><b>{yen.format(confirmedTicketTotal)}</b></div>
            <div className="cost-row expense-row"><span>決定済み｜交通・宿泊・その他</span><b>{yen.format(confirmedExpenseTotal)}</b></div>
            {activeFees.map((fee) => <div className="cost-row fee" key={fee.id}><span>{fee.label}<em>×{fee.count}</em></span><b>{yen.format(fee.amount * fee.count)}</b></div>)}
            {activeFees.length === 0 && <p className="muted-row">追加費用は未計上です</p>}
            <div className="grand-row"><span>総額</span><strong>{yen.format(total)}</strong></div>
            <button className="text-button rail-link" onClick={() => setSettingsOpen(true)}>送料・手数料を編集 →</button>
          </section>

          <section className="rail-card caps-card">
            <div className="rail-heading"><span>LIMIT</span><h2>上限メーター</h2></div>
            <p className="rail-intro">カテゴリ合計で公式上限を管理します。1つの選択枠の上限も設定できます。</p>
            <div className="caps-list">
              {events.map((event) => {
                const used = usedByEvent.get(event.id) ?? 0;
                const percent = event.maxTotal ? Math.min(100, Math.round((used / event.maxTotal) * 100)) : 0;
                return <div className="cap-row" key={event.id}>
                  <div><span className={`mini-dot ${event.service}`}></span><b>{event.shortLabel}</b><em>{event.source === 'unconfirmed' ? '要設定' : `${used}/${event.maxTotal}`}</em></div>
                  <div className="meter"><i style={{ width: `${percent}%` }}></i></div>
                </div>;
              })}
            </div>
            <button className="outline-button full-width" onClick={() => setSettingsOpen(true)}>上限・単価を編集</button>
          </section>

          <section className="source-card">
            <b>公式情報の基準日</b>
            <p>2026.10.1 時点で確認できた内容を初期登録しています。</p>
            <a href={OVERVIEW_SOURCE_URL} target="_blank" rel="noreferrer">公式イベント一覧を確認 ↗</a>
          </section>
        </aside>
      </section>

      <section className="attendance-section" aria-labelledby="attendance-title">
        <div className="attendance-heading">
          <div><p className="eyebrow">MY WINTER</p><h2 id="attendance-title">私の参加予定</h2><p>入力欄で「決定」したイベントだけを、参加日数と種別で見える化します。</p></div>
          <div className="attendance-stats"><strong>{attendanceDays}<small>参加日</small></strong><strong>{activePlansWithDetail.length}<small>イベント</small></strong><strong>{activePlansWithDetail.reduce((sum, { plan }) => sum + plan.quantity, 0)}<small>枚・セット</small></strong></div>
        </div>
        {attendanceByDate.length === 0 ? <p className="muted-row attendance-empty">まだ参加予定はありません。入力欄でイベントを選び、「決定」するとここに表示されます。</p> : <div className="attendance-timeline">
          {attendanceByDate.map(([date, details]) => <article className="attendance-day" key={date}>
            <div className="attendance-date"><b>{date.slice(5).replace('-', '/')}</b><span>{details[0].schedule.venue}</span></div>
            <div className="attendance-day-events">{details.map(({ plan, event, schedule }) => <div className="attendance-event" key={plan.id}><i className={serviceMeta[event.service].className}></i><div><strong>{event.label}</strong><span>{schedule.label}｜{planStatus(plan) === 'confirmed' ? '参加決定' : '参加予定'}</span></div></div>)}</div>
          </article>)}
        </div>}
      </section>

      <section className="calendar-section" aria-labelledby="event-calendar-title">
        <div className="calendar-heading">
          <div>
            <p className="eyebrow">EVENT CALENDAR</p>
            <h2 id="event-calendar-title">イベント日程</h2>
            <p>WithLIVE・forTUNE・ミニライブ＆お見送り会・ライブ・出演イベントをまとめています。</p>
          </div>
          <div className="calendar-tools">
            <div className="calendar-nav"><button className="outline-button" disabled={calendarPage === 0} onClick={() => setCalendarPage((page) => Math.max(0, page - 1))}>← 前の月</button><button className="outline-button" disabled={calendarPage >= calendarMonthKeys.length - 2} onClick={() => setCalendarPage((page) => Math.min(calendarMonthKeys.length - 2, page + 1))}>次の月 →</button></div>
            <div className="calendar-legend">
            {calendarCategories.map((category) => <span key={category} className={`calendar-legend-item ${calendarCategoryMeta[category].className}`}><i></i>{calendarCategoryMeta[category].label}</span>)}
            </div>
          </div>
        </div>
        <div className="calendar-months">
          {visibleCalendarMonths.map((monthKey) => {
            const [year, month] = monthKey.split('-').map(Number);
            const monthCells = calendarCells(year, month);
            return (
              <article className="calendar-month" key={monthKey}>
                <h3>{year}年{month}月</h3>
                <div className="calendar-weekdays">{weekdayLabels.map((weekday) => <span key={weekday}>{weekday}</span>)}</div>
                <div className="calendar-days">
                  {monthCells.map((day, index) => {
                    const date = day ? `${monthKey}-${String(day).padStart(2, '0')}` : '';
                    const dayEvents = date ? CALENDAR_EVENTS.filter((event) => event.date === date) : [];
                    return <div className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''}`} key={`${monthKey}-${index}`}>
                      {day && <span className="calendar-day-number">{day}</span>}
                      <div className="calendar-day-events">
                        {dayEvents.map((event) => <div className={`calendar-event ${calendarCategoryMeta[event.category].className}`} key={event.id} title={`${event.title}｜${event.venue}｜${event.time ?? ''}`}>
                          <b>{calendarCategoryMeta[event.category].label}</b><span>{calendarCompactTitle(event.category, event.title)}</span>
                        </div>)}
                      </div>
                    </div>;
                  })}
                </div>
              </article>
            );
          })}
        </div>
        <div className="calendar-details">
          {[...CALENDAR_EVENTS].sort((a, b) => a.date.localeCompare(b.date)).map((event) => <article className={`calendar-detail ${calendarCategoryMeta[event.category].className}`} key={event.id}>
            <div className="calendar-detail-date"><b>{event.date.split('-').join('.')}</b>{event.time && <span>{event.time}</span>}</div>
            <div><strong>{event.title}</strong><p>{event.venue}｜{event.detail}</p></div>
          </article>)}
        </div>
      </section>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="settings-modal" role="dialog" aria-modal="true" aria-label="商品と費用の設定">
            <header className="settings-header"><div><p className="eyebrow">CUSTOMIZE</p><h2>商品・費用の設定</h2><p>変更内容はこの端末に保存されます。上限を下げた場合、超過する予定は自動で上限値まで調整されます。</p></div><button className="delete-button close-button" onClick={() => setSettingsOpen(false)}>×</button></header>
            <div className="settings-content">
              <section className="save-code-section">
                <div className="settings-section-heading"><div><h3>保存コード</h3><span className="settings-help">別のブラウザ・端末へ予定を持ち運べます</span></div><button className="outline-button" onClick={createSaveCode}>保存コードを作成</button></div>
                <p className="save-code-note">現在の予定・商品設定・追加費用をコード化します。コードはこの画面でのみ作成され、サーバーには送信されません。個人情報を含む場合は他人に共有しないでください。</p>
                <textarea className="save-code-input" value={saveCode} onChange={(e) => { setSaveCode(e.target.value); setSaveCodeMessage(''); }} placeholder="保存コードをここに貼り付けてください" rows={3} spellCheck={false} />
                <div className="save-code-actions"><button className="primary-button" onClick={loadSaveCode} disabled={!saveCode.trim()}>このコードを読み込む</button>{saveCodeMessage && <span className="save-code-message" role="status">{saveCodeMessage}</span>}</div>
              </section>
              <section><div className="settings-section-heading"><h3>商品・購入上限</h3><span>価格は税込・1セットあたり</span></div>
                <div className="settings-table-wrap"><table className="settings-table"><thead><tr><th>サービス / 種別</th><th>単価</th><th>CD枚数</th><th>カテゴリ上限</th><th>1選択枠の上限</th></tr></thead><tbody>
                  {events.map((event) => <tr key={event.id}><td><b>{event.label}</b><small className={event.source === 'unconfirmed' ? 'warning-copy' : ''}>{event.source === 'unconfirmed' ? '販売詳細未確認・仮の価格' : '公式初期値'}</small></td>
                    <td><label className="number-input">¥<input type="text" inputMode="numeric" onFocus={selectNumericInput} value={formatInputAmount(event.price)} onChange={(e) => updateEvent(event.id, 'price', e.target.value)} /></label></td>
                    <td><label className="number-input"><input type="text" inputMode="numeric" onFocus={selectNumericInput} value={event.cdPerSet} onChange={(e) => updateEvent(event.id, 'cdPerSet', e.target.value)} />枚</label></td>
                    <td><label className="number-input"><input type="text" inputMode="numeric" onFocus={selectNumericInput} value={event.maxTotal} onChange={(e) => updateEvent(event.id, 'maxTotal', e.target.value)} />セット</label></td>
                    <td><label className="number-input"><input type="text" inputMode="numeric" onFocus={selectNumericInput} value={event.perSelectionLimit} onChange={(e) => updateEvent(event.id, 'perSelectionLimit', e.target.value)} />セット</label></td>
                  </tr>)}
                </tbody></table></div>
              </section>
              <section><div className="settings-section-heading"><h3>送料・手数料など</h3><button className="text-button" onClick={() => setFees((current) => [...current, { id: createId('fee'), service: 'common', label: '追加費用', amount: 0, count: 1, active: true }])}>＋ 費用を追加</button></div>
                <div className="fee-editor-list">{fees.map((fee) => <div className="fee-editor" key={fee.id}>
                  <label className="toggle"><input type="checkbox" checked={fee.active} onChange={(e) => updateFee(fee.id, { active: e.target.checked })} /><span></span></label>
                  <select value={fee.service} onChange={(e) => updateFee(fee.id, { service: e.target.value as FeeItem['service'] })}><option value="fortune">forTUNE</option><option value="withlive">WithLIVE</option><option value="common">共通</option></select>
                  <input value={fee.label} onChange={(e) => updateFee(fee.id, { label: e.target.value })} aria-label="費用名" />
                  <label className="number-input">¥<input type="text" inputMode="numeric" onFocus={selectNumericInput} value={formatInputAmount(fee.amount)} onChange={(e) => updateFee(fee.id, { amount: parseNumber(e.target.value) })} /></label>
                  <label className="number-input">×<input type="text" inputMode="numeric" onFocus={selectNumericInput} value={fee.count} onChange={(e) => updateFee(fee.id, { count: parseNumber(e.target.value) })} /></label>
                  <button className="delete-button" aria-label="費用を削除" onClick={() => setFees((current) => current.filter((item) => item.id !== fee.id))}>×</button>
                </div>)}</div>
              </section>
            </div>
            <footer className="settings-footer"><button className="text-button danger-button" onClick={resetAll}>すべて初期化</button><button className="primary-button" onClick={() => setSettingsOpen(false)}>設定を保存して閉じる</button></footer>
          </section>
        </div>
      )}
    </main>
  );
}
