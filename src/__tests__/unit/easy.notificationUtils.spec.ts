import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: '1',
    title: 'Test Event',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Test Description',
    location: 'Test Location',
    category: 'Test Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-07-01T14:00');
    const notifiedEvents: string[] = [];

    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual(events);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-07-01T14:00');
    const notifiedEvents: string[] = ['1'];

    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-07-01T13:00');
    const notifiedEvents: string[] = [];

    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-07-01T15:00');
    const notifiedEvents: string[] = [];

    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(events[0])).toBe('30분 후 Test Event 일정이 시작됩니다.');
  });
});
