export interface DataType {
  key: string;
  typeWork: string;
  executorName: string;
  unit: string;
  volume: number;
  date: string;
  comment: string;
}

export interface JournalRecordResponse extends Partial<Omit<DataType, "key">> {
  id?: string | number;
  key?: string | number;
}

export interface JournalRecordsResponse {
  items: JournalRecordResponse[];
  total: number;
  page: number;
}

export interface CreateJournalRecordPayload {
  typeWork: string;
  executorName: string;
  unit: string;
  volume: number;
  date: string;
  comment: string;
}

export interface WorkTypeResponse {
  id?: string | number;
  key?: string | number;
  name?: string;
  title?: string;
  typeWork?: string;
}

export interface WorkTypesResponse {
  items: WorkTypeResponse[];
}
