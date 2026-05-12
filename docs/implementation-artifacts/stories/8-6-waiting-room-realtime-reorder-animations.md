# Story 8-6 — Waiting Room: Real-Time Updates, Animations & Manual Reorder

**Epic:** Appointment Service — Waiting Room  
**Status:** Ready for development

---

## Context

The waiting room page currently:

- Loads the queue **once** on mount via `loadQueue(clinicId)` in `useWaitingRoomPage`
- Uses `InMemoryQueueRepository` → now switched to `QueueHttpRepository`
- Has a **stubbed** SSE endpoint in the API Gateway (`GET /events/queue`) that returns `EMPTY` with the comment "NATS subscription wired in Story 8.5"
- The `appointment-service` already publishes `queue.checked_in`, `queue.status.updated`, and `queue.notes.updated` to NATS via the outbox relay (every ~2s)
- `framer-motion` v12 is already installed in the frontend
- No DnD library is installed yet

---

## Goals

1. **Real-time updates** — any change on any screen (check-in, status change, notes) must appear instantly on all waiting room screens without a manual refresh.
2. **Entrance & update animations** — new rows slide/fade in; rows that change status flash-highlight.
3. **Manual reorder** — the secretary can drag rows to override the automatic sort, within the same status group.
4. **Sort controls** — the secretary can switch between sort modes: `Policy` (default: status → priority → arrivedAt), `Walk-in time` (arrivedAt ascending), and `Appointment time` (scheduled start ascending — requires a new field, see below).

---

## Part 1 — Real-Time SSE (Backend: API Gateway)

### 1.1 Add NATS client to the gateway

Install the nats package if not already present in the api-gateway package:

```bash
# from services/
pnpm add nats --filter api-gateway
```

Create `services/api-gateway/src/infrastructure/nats/nats.module.ts`:

```ts
// Singleton module. Connects once on app init, exports the connection.
// Use nats (plain) not @nestjs/microservices NATS transport —
// we only need to SUBSCRIBE, not handle RPC.
import {Module, Global} from "@nestjs/common";
import {QueueEventBroadcaster} from "./queue-event-broadcaster.service";

@Global()
@Module({
  providers: [QueueEventBroadcaster],
  exports: [QueueEventBroadcaster],
})
export class NatsModule {}
```

### 1.2 Create `QueueEventBroadcaster`

File: `services/api-gateway/src/infrastructure/nats/queue-event-broadcaster.service.ts`

Responsibilities:

- On `onModuleInit`: connect to NATS (url from `NATS_URL` env var)
- Subscribe to `queue.checked_in`, `queue.status.updated`, `queue.notes.updated`
- Maintain a `Map<clinicId, Subject<MessageEvent>>` — one RxJS `Subject` per clinic
- On each NATS message: parse the payload, look up the clinic's subject, call `.next()`
- Expose `getStream(clinicId): Observable<MessageEvent>` — creates the subject lazily
- On `onModuleDestroy`: drain the NATS connection, complete all subjects

```ts
// Skeleton — implement fully:
import {Injectable, OnModuleInit, OnModuleDestroy} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Subject, Observable} from "rxjs";
import {MessageEvent} from "@nestjs/common";
import {connect, NatsConnection, Subscription} from "nats";
import {AppLogger} from "@lib";

const QUEUE_SUBJECTS = [
  "queue.checked_in",
  "queue.status.updated",
  "queue.notes.updated",
];

@Injectable()
export class QueueEventBroadcaster implements OnModuleInit, OnModuleDestroy {
  private connection?: NatsConnection;
  private subscriptions: Subscription[] = [];
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    const servers = this.config.get<string>("NATS_URL");
    if (!servers) {
      this.logger.warn(
        "NATS_URL not set; SSE queue events disabled",
        "QueueBroadcaster",
      );
      return;
    }
    try {
      this.connection = await connect({servers});
      for (const subject of QUEUE_SUBJECTS) {
        const sub = this.connection.subscribe(subject);
        this.subscriptions.push(sub);
        void this.drain(sub, subject);
      }
      this.logger.log("Subscribed to NATS queue subjects", "QueueBroadcaster");
    } catch (err) {
      this.logger.error(
        `NATS connect failed: ${(err as Error).message}`,
        undefined,
        "QueueBroadcaster",
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const sub of this.subscriptions) sub.unsubscribe();
    if (this.connection) await this.connection.drain();
    this.streams.forEach((s) => s.complete());
  }

  getStream(clinicId: string): Observable<MessageEvent> {
    if (!this.streams.has(clinicId)) {
      this.streams.set(clinicId, new Subject<MessageEvent>());
    }
    return this.streams.get(clinicId)!.asObservable();
  }

  private async drain(sub: Subscription, subject: string): Promise<void> {
    for await (const msg of sub) {
      try {
        const payload = JSON.parse(new TextDecoder().decode(msg.data)) as {
          clinic_id: string;
          [key: string]: unknown;
        };
        const clinicId = payload.clinic_id;
        if (!clinicId) continue;
        const stream = this.streams.get(clinicId);
        if (stream) {
          stream.next({data: JSON.stringify({type: subject, entry: payload})});
        }
      } catch (err) {
        this.logger.error(
          `Failed to parse NATS message on ${subject}`,
          undefined,
          "QueueBroadcaster",
        );
      }
    }
  }
}
```

### 1.3 Wire `NatsModule` into the gateway app module

In `services/api-gateway/src/app.module.ts`, add `NatsModule` to `imports`.

### 1.4 Update `SseController` and `SseModule`

Replace the stub in `sse.controller.ts`:

```ts
// Remove: return EMPTY;
// Replace with:
return this.broadcaster
  .getStream(clinicId)
  .pipe
  // keep connection alive with a heartbeat every 25s
  // (browsers disconnect after ~30s of no data)
  // use RxJS merge with interval that emits a comment event
  ();
```

Inject `QueueEventBroadcaster` into `SseController`. Add it to `SseModule` providers/imports.

**Heartbeat detail:** SSE connections are dropped by proxies after ~30s of silence. Use `merge(stream, interval(25_000).pipe(map(() => ({data: ":heartbeat"}))))` to keep the connection alive.

**Note on the event payload shape:** The NATS outbox payload from `manage-queue.use-case.ts` uses the `queuePayload()` helper — verify that `clinic_id` is a top-level key in the payload so the broadcaster can route by clinic. If it is nested, adjust accordingly.

---

## Part 2 — Real-Time SSE (Frontend)

### 2.1 Add `applyQueueEvent` to the Zustand store

In `queueStore.ts`, add to the interface:

```ts
applyQueueEvent: (entry: QueueEntry) => void;
```

Implementation (inside `create`):

```ts
applyQueueEvent: (entry) => {
  set((state) => {
    const exists = state.entries.some((e) => e.id === entry.id);
    const updated = exists
      ? state.entries.map((e) => (e.id === entry.id ? entry : e))
      : [...state.entries, entry];
    return {entries: sortQueueEntries(updated), lastUpdatedAt: new Date()};
  });
},
```

This handles both new check-ins (append) and status/notes updates (replace), then re-sorts.

### 2.2 Create `useQueueStream` hook

File: `frontend/src/presentation/admin/queue/hooks/useQueueStream.ts`

```ts
import {useEffect} from "react";
import {useSession} from "next-auth/react";
import {useQueueStore} from "@/presentation/stores/queueStore";
import {queueEntryToDomain} from "@/infrastructure/queue/mappers";
import type {QueueEntryDTO} from "@/infrastructure/queue/dtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useQueueStream(clinicId: string) {
  const {data: session} = useSession();
  const applyQueueEvent = useQueueStore((s) => s.applyQueueEvent);

  useEffect(() => {
    if (!session?.accessToken) return;

    // EventSource does not support custom headers.
    // Pass the token as a query param — the SSE endpoint validates it.
    // The gateway must accept ?token= as an alternative to Authorization header
    // OR use a cookie-based auth for SSE (see note below).
    const url = `${API_URL}/api/v1/events/queue?clinicId=${clinicId}&token=${session.accessToken}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as {
          type: string;
          entry: QueueEntryDTO;
        };
        if (parsed.entry) {
          applyQueueEvent(queueEntryToDomain(parsed.entry));
        }
      } catch {
        // ignore malformed messages / heartbeats
      }
    };

    es.onerror = () => {
      // EventSource reconnects automatically; no manual action needed
    };

    return () => es.close();
  }, [clinicId, session?.accessToken, applyQueueEvent]);
}
```

**Auth note for SSE:** `EventSource` cannot send `Authorization: Bearer` headers. Two options:

- **Option A (simpler):** Accept `?token=` query param in `JwtAuthGuard` for SSE-only routes. Extract token from `req.query.token` when `Authorization` header is absent.
- **Option B (cleaner):** Use `httpOnly` session cookies — the browser sends them automatically. This is the approach used in production dental systems.

For now, implement Option A and document it for later upgrade.

### 2.3 Call `useQueueStream` from `useWaitingRoomPage`

Add one line after the `loadQueue` effect:

```ts
useQueueStream(QUEUE_CLINIC_ID);
```

The initial full load stays. SSE applies incremental patches on top.

---

## Part 3 — Animations (Frontend only)

Use `framer-motion` v12 (already installed). No new dependency needed.

### 3.1 Row entrance animation in `ActiveQueueTable`

Wrap the table body in `AnimatePresence` and each row in `motion.tr`:

```tsx
import {AnimatePresence, motion} from "framer-motion";

// Replace the plain <tr> with:
<AnimatePresence initial={false}>
  {entries.map((entry) => (
    <motion.tr
      key={entry.id}
      layout                          // smooth positional reorder
      initial={{opacity: 0, y: -12}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, x: 40}}
      transition={{duration: 0.25, ease: "easeOut"}}
      // ... existing props
    >
```

`layout` prop is the key: framer-motion automatically animates the row moving up/down when the sort order changes (e.g. a patient moves from ARRIVED to WAITING and jumps to a different position).

### 3.2 Flash highlight on status change

Track the last-updated entry ID in the store (`lastUpdatedId: string | null`). Set it inside `applyQueueEvent`, clear it after 1500ms.

In the row: add a `data-updated` attribute and use a CSS keyframe animation:

```css
@keyframes queue-flash {
  0% {
    background-color: rgba(16, 185, 129, 0.18);
  }
  100% {
    background-color: transparent;
  }
}
tr[data-updated="true"] {
  animation: queue-flash 1.5s ease-out forwards;
}
```

Or use `motion.tr`'s `animate` prop with a `backgroundColor` keyframe directly — framer-motion handles this without extra CSS.

### 3.3 Summary cards count animation

Wrap count numbers in `motion.span` with `key={count}` so the number flips when the count changes:

```tsx
<motion.span
  key={count}
  initial={{opacity: 0, scale: 0.7}}
  animate={{opacity: 1, scale: 1}}
  transition={{type: "spring", stiffness: 400, damping: 20}}
>
  {count}
</motion.span>
```

---

## Part 4 — Manual Reorder

### 4.1 Library

Install `@dnd-kit/core` and `@dnd-kit/sortable` — the lightest, accessibility-first DnD library for React:

```bash
# from frontend/
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Do **not** use `react-beautiful-dnd` (unmaintained) or `react-dnd` (heavier).

### 4.2 Scope of reorder

Reordering is **client-side only and per-session**. The server's sort order (status → priority → arrivedAt) is the ground truth. The manual order is an overlay that:

- Only applies within the **active** queue section (ARRIVED, WAITING, IN_CHAIR patients)
- Resets to policy order whenever a real-time SSE event arrives (since the new state is authoritative) — OR we can keep the manual order and only append/remove entries. Pick one:
  - **Option A (recommended):** Manual order resets on any SSE event. Simple and safe — avoids stale positions.
  - **Option B:** Manual order persists, SSE events insert/remove without reordering existing items. More complex, more "pro feel".

For the first implementation, use **Option A** and add a `resetOrder` button.

### 4.3 Store changes

Add to `queueStore`:

```ts
manualOrder: string[] | null;   // null = use policy sort
setManualOrder: (ids: string[]) => void;
resetManualOrder: () => void;
```

In `applyQueueEvent`, call `resetManualOrder()` automatically (Option A).

Add a derived selector `displayEntries` that returns:

- If `manualOrder` is null: `entries` (already policy-sorted)
- If `manualOrder` is set: re-order `activeQueue` entries to match, then append completed entries at the end

### 4.4 UI changes to `ActiveQueueTable`

Wrap the table body with `@dnd-kit/sortable`'s `SortableContext`. Make each row a `useSortable` item. The drag handle should be a dedicated grip column on the left (`GripVertical` icon from lucide-react).

Only show the drag handle when:

- The user's role is `SECRETARY` or `ADMIN`
- The current sort mode is `Policy` (dragging while sorted by time doesn't make sense)

```tsx
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
```

On `DragEndEvent`: call `setManualOrder(arrayMove(currentIds, oldIndex, newIndex))`.

---

## Part 5 — Sort Controls

### 5.1 Sort modes available NOW (no schema change)

The `QueueEntry` domain entity has `arrivedAt`. That covers two sort modes immediately:

| Mode         | Label           | Sort key                      |
| ------------ | --------------- | ----------------------------- |
| `POLICY`     | Smart (default) | status → priority → arrivedAt |
| `ARRIVED_AT` | Walk-in time    | arrivedAt ascending           |

These can be implemented today with a `SortMode` enum in the store and a modified `displayEntries` selector.

### 5.2 Sort by appointment time (requires schema change)

The `QueueEntry` domain entity currently has NO `appointmentStartAt` field. The `queue_entries` DB table has a FK to `appointments` via `appointment_id`, and the `AppointmentTypeOrmEntity` has `start_at`.

To support sorting by scheduled appointment time, the following chain must be updated:

1. **`QueueEntryTypeOrmEntity`** — eager-load the appointment relation, or add a denormalized `appointment_start_at` column (recommended for query performance)
2. **`QueueEntry` domain entity** (appointment-service) — add `appointmentStartAt: Date | null`
3. **`QueueEntryMapper.toDomain()`** — map the new field
4. **`appointment.proto`** — add `appointment_start_at` to `QueueEntryReply` message
5. **`AppointmentGrpcMapper.toQueueEntryReply()`** — include the field
6. **`queueEntryToHttp()` in api-gateway** — map to `appointment_start_at`
7. **`QueueEntryDTO`** (frontend) — add `appointment_start_at?: string`
8. **`queueEntryToDomain()` mapper** (frontend) — parse to `appointmentStartAt?: Date`
9. **`QueueEntry` domain entity** (frontend) — add `appointmentStartAt?: Date`
10. **`sortQueueEntries` in `queuePolicy.ts`** — add `APPOINTMENT_TIME` case

**Recommendation:** Implement sort modes `POLICY` and `ARRIVED_AT` first (no schema change). Add `APPOINTMENT_TIME` as a follow-up after the proto and migration are done.

### 5.3 Sort control UI

Add a sort dropdown/toggle in the `ActiveQueueTable` header, next to the "Active Queue" title:

```tsx
// Example — adapt to existing design system tokens
<select
  value={sortMode}
  onChange={(e) => setSortMode(e.target.value as SortMode)}
>
  <option value="POLICY">Smart sort</option>
  <option value="ARRIVED_AT">Walk-in time</option>
  {/* <option value="APPOINTMENT_TIME">Appointment time</option> — add later */}
</select>
```

When sort mode changes to anything other than `POLICY`, disable drag-to-reorder (they are mutually exclusive).

---

## Implementation Order

1. **Backend first** — `QueueEventBroadcaster` + wire `SseController` → build & deploy gateway
2. **Store** — add `applyQueueEvent`, `manualOrder`, `setManualOrder`, `resetManualOrder`, `sortMode`
3. **`useQueueStream` hook** — wire SSE, verify in browser devtools (Network → EventStream tab)
4. **Animations** — `AnimatePresence` + `layout` on table rows, flash on update, count flip
5. **Sort controls** — `POLICY` + `ARRIVED_AT` (no schema change)
6. **Drag to reorder** — install `@dnd-kit`, add `SortableContext`, drag handle column
7. **Appointment time sort** — proto + migration follow-up

---

## Acceptance Criteria

- [ ] Check in a patient on screen A → the new row appears on screen B within ~3 seconds with a slide-in animation, no manual refresh
- [ ] Update a patient's status on screen A → the row flashes green on screen B and moves to the new position with a smooth animation
- [ ] SSE connection drops (e.g. network blip) → `EventSource` auto-reconnects, no user action required
- [ ] Dragging a row saves the manual order; other rows stay in place
- [ ] A new SSE event clears the manual order and shows a "Reverted to smart sort" toast (or a subtle chip reset)
- [ ] Walk-in time sort overrides the policy sort; drag handle is hidden in this mode
- [ ] Queue is empty → empty state renders without error (already fixed by `?? []` in gateway)
- [ ] Heartbeat events do not cause visible re-renders (filter `:heartbeat` data in the hook)
