export interface DataType {
  key: string;
  typeWork: string;
  executorName: string;
  unit: string;
  volume: number;
  date: string;
  comment: string;
}

export interface WorkTypeResponse {
  id: number;
  name: string;
  createdAt: string;
}

export interface JournalRecordResponse {
  id: number;
  date: string;
  volume: number;
  unit: string;
  executorName: string;
  comment: string | null;
  workTypeId: number;
  workType: WorkTypeResponse;
  createdAt: string;
  updatedAt: string;
}

export interface JournalRecordsResponse {
  items: JournalRecordResponse[];
  total: number;
  page: number;
}

export interface CreateJournalRecordPayload {
  workTypeId: number;
  executorName: string;
  unit: string;
  volume: number;
  date: string;
  comment?: string;
}
