import type { GdReport, GdSessionRecord } from "@/lib/types";

// Hands a finished GD from the discussion room to the report page within the
// browser tab. Replaced by the database in the next phase; until then the
// session survives a refresh but not closing the tab.
const SESSION_KEY = (id: string) => `gd:session:${id}`;
const REPORT_KEY = (id: string) => `gd:report:${id}`;

function read<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const saveSession = (session: GdSessionRecord) => write(SESSION_KEY(session.id), session);
export const loadSession = (id: string) => read<GdSessionRecord>(SESSION_KEY(id));
export const saveReport = (report: GdReport) => write(REPORT_KEY(report.sessionId), report);
export const loadReport = (id: string) => read<GdReport>(REPORT_KEY(id));
