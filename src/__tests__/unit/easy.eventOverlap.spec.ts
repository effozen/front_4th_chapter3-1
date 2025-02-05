import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2024-07-01', '14:30')).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2024-07-01', '25:30').toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2024-07-01', '14:90').toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30').toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
    id: '1',
    title: 'Test Event',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Test Description',
    location: 'Test Location',
    category: 'Test Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2024-07-01T14:30'),
      end: new Date('2024-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, date: '2024-07-32' };
    expect(convertEventToDateRange(invalidEvent).start.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, startTime: '25:30' };
    expect(convertEventToDateRange(invalidEvent).start.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    title: 'Test Event',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Test Description',
    location: 'Test Location',
    category: 'Test Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  const event2: Event = {
    id: '2',
    title: 'Test Event 2',
    date: '2024-07-01',
    startTime: '15:00',
    endTime: '16:00',
    description: 'Test Description',
    location: 'Test Location',
    category: 'Test Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event3 = { ...event2, startTime: '16:00', endTime: '17:00' };
    expect(isOverlapping(event1, event3)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const Events: Event[] = [
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
      notificationTime: 0,
    },
    {
      id: '2',
      title: 'Test Event 2',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: 'Test Event 3',
      date: '2024-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '4',
      title: 'Test Event 4',
      date: '2024-07-01',
      startTime: '17:00',
      endTime: '18:00',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: 'Test Event 5',
      date: '2024-07-01',
      startTime: '15:30',
      endTime: '16:30',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    expect(findOverlappingEvents(newEvent, Events)).toEqual([Events[1], Events[2]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '6',
      title: 'Test Event 6',
      date: '2024-07-01',
      startTime: '13:30',
      endTime: '14:30',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    expect(findOverlappingEvents(newEvent, Events)).toEqual([]);
  });
});
