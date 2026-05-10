from __future__ import annotations

import time
from dataclasses import dataclass, field
from threading import Lock
from typing import Any

SESSION_TTL_SEC = 30 * 60
MAX_TURNS_PER_SESSION = 20


@dataclass
class Session:
    history: list[Any] = field(default_factory=list)
    last_seen: float = field(default_factory=time.time)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}
        self._lock = Lock()

    def get(self, session_id: str) -> Session:
        with self._lock:
            self._gc()
            sess = self._sessions.get(session_id)
            if sess is None:
                sess = Session()
                self._sessions[session_id] = sess
            sess.last_seen = time.time()
            return sess

    def update(self, session_id: str, history: list[Any]) -> None:
        with self._lock:
            sess = self._sessions.setdefault(session_id, Session())
            sess.history = history[-(MAX_TURNS_PER_SESSION * 2):]
            sess.last_seen = time.time()

    def _gc(self) -> None:
        now = time.time()
        expired = [sid for sid, s in self._sessions.items() if now - s.last_seen > SESSION_TTL_SEC]
        for sid in expired:
            del self._sessions[sid]


store = SessionStore()
