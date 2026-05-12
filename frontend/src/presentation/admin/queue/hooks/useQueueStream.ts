import {useEffect} from "react";
import {useSession} from "next-auth/react";
import type {QueueEntryDTO} from "@/infrastructure/queue/dtos";
import {queueEntryToDomain} from "@/infrastructure/queue/mappers";
import {useQueueStore} from "@/presentation/stores/queueStore";

interface QueueStreamEvent {
  type: string;
  entry?: QueueEntryDTO;
}

export function useQueueStream(clinicId: string) {
  const {status} = useSession();
  const applyQueueEvent = useQueueStore((state) => state.applyQueueEvent);

  useEffect(() => {
    if (status !== "authenticated") return;

    const params = new URLSearchParams({clinicId});
    const eventSource = new EventSource(`/api/v1/events/queue?${params}`);

    eventSource.onmessage = (event) => {
      if (!event.data || event.data === ":heartbeat") return;

      try {
        const parsed = JSON.parse(event.data) as QueueStreamEvent;
        if (parsed.entry) {
          applyQueueEvent(queueEntryToDomain(parsed.entry));
        }
      } catch {
        // EventSource reconnects automatically; malformed messages are ignored.
      }
    };

    return () => eventSource.close();
  }, [applyQueueEvent, clinicId, status]);
}
