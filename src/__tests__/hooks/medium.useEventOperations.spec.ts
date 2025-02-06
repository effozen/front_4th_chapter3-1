import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// toastFN은 토스트 함수의 호출 여부를 알기 위한 모킹입니다. (특별한 조건보다는 이게 잘 작성되었다고 가정하고, 실행 여부 체크를 위함)
const toastFn = vi.fn();

// chakra-ui는 이미 잘 만들어진 ui이기 때문에 굳이 테스트가 필요없습니다. 그에 따라서 이렇게 모킹해서 구현하는 것으로 이해하고 있습니다.
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  const newEvent = {
    id: '3',
    title: '테스트 이벤트5',
    date: '2024-10-02',
    startTime: '12:30',
    endTime: '13:30',
    description: '테스트용 이벤트 점심입니다.',
    location: '서울',
    category: '일정',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
  };

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    setupMockHandlerCreation(events);

    const { result } = renderHook(() => useEventOperations(false));

    act(() => {
      result.current.fetchEvents();
    });

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation(events);

    const { result } = renderHook(() => useEventOperations(false));

    act(() => {
      result.current.saveEvent(newEvent);
    });

    const expected = [...events, newEvent];

    await waitFor(() => {
      expect(result.current.events).toEqual(expected);
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const updatedEvent = {
      ...events[0],
      title: '수정된 이벤트',
      endTime: '14:00',
    };

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(result.current.events[0]).toEqual(updatedEvent);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent(events[1].id);
    });

    await waitFor(() => {
      expect(result.current.events).toEqual([]);
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(http.get('/api/events', () => HttpResponse.error()));

    const { result } = renderHook(() => useEventOperations(false));

    act(() => {
      result.current.fetchEvents();
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerCreation(events);

    const notExistedEvent = {
      ...events[0],
      id: '100',
      title: '수정된 이벤트',
      endTime: '14:00',
    };

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(notExistedEvent);
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    setupMockHandlerCreation(events);

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent('100');
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });
});
