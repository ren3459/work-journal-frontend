import axios from "axios";
import type {
  CreateJournalRecordPayload,
  JournalRecordResponse,
  JournalRecordsResponse,
  WorkTypeResponse,
  WorkTypesResponse,
} from "./HomePage.types";

//TODO: переписать url на нормальный и дописать хвост
const workJournalApiUrl =
  import.meta.env.VITE_WORK_JOURNAL_API_URL ?? "/api/work-journal";
const workTypesApiUrl =
  import.meta.env.VITE_WORK_TYPES_API_URL ?? "/api/work-types";

export const fetchJournalRecords = (
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) =>
  axios.get<JournalRecordsResponse>(workJournalApiUrl, {
    params: {
      page,
      pageSize,
    },
    signal,
  });

export const createJournalRecord = (payload: CreateJournalRecordPayload) =>
  axios.post<JournalRecordResponse>(workJournalApiUrl, payload);

export const fetchWorkTypes = (signal?: AbortSignal) =>
  axios.get<WorkTypeResponse[] | WorkTypesResponse>(workTypesApiUrl, {
    signal,
  });
