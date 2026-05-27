import axios from "axios";
import type {
  CreateJournalRecordPayload,
  JournalRecordResponse,
  JournalRecordsResponse,
  WorkTypeResponse,
} from "./HomePage.types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
const workJournalApiUrl = `${apiBaseUrl}/work-journal`;
const workTypesApiUrl = `${apiBaseUrl}/work-types`;

export const fetchJournalRecords = (
  page: number,
  pageSize: number,
  sortField?: string,
  sortOrder?: string,
  signal?: AbortSignal,
) =>
  axios.get<JournalRecordsResponse>(workJournalApiUrl, {
    params: {
      page,
      pageSize,
      sortField,
      sortOrder,
    },
    signal,
  });

export const createJournalRecord = (payload: CreateJournalRecordPayload) =>
  axios.post<JournalRecordResponse>(workJournalApiUrl, payload);

export const fetchWorkTypes = (signal?: AbortSignal) =>
  axios.get<WorkTypeResponse[]>(workTypesApiUrl, {
    signal,
  });

export const createWorkType = (name: string) =>
  axios.post<WorkTypeResponse>(workTypesApiUrl, { name });
