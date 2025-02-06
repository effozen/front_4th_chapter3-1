import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch 테스트', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-10-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '테스트용 이벤트 점심입니다.',
      location: '서울',
      category: '일정',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '테스트 이벤트2',
      date: '2024-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트용 이벤트 점심입니다.',
      location: '서울',
      category: '일정',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '테스트 이벤트3',
      date: '2024-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '테스트용 이벤트 점심입니다.',
      location: '서울',
      category: '일정',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '테스트 이벤트4',
      date: '2024-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '테스트용 이벤트 회의입니다.',
      location: '서울',
      category: '일정',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '테스트 이벤트5',
      date: '2024-11-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '테스트용 이벤트 회의입니다.',
      location: '서울',
      category: '일정',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
  ];

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.filteredEvents).toEqual(events.slice(0, 4));
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

    act(() => {
      result.current.setSearchTerm('테스트 이벤트2');
    });

    expect(result.current.filteredEvents).toEqual([events[1]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

    act(() => {
      result.current.setSearchTerm('서울');
    });

    expect(result.current.filteredEvents).toEqual(events.slice(0, 4));
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.filteredEvents).toEqual(events.slice(0, 4));
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual([events[3]]);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual(events.slice(0, 3));
  });
});
