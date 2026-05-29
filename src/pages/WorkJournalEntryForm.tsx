import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { fetchWorkTypes } from "./HomePage.api";
import type {
  CreateJournalRecordPayload,
  JournalRecordResponse,
  UpdateJournalRecordPayload,
  WorkTypeResponse,
} from "./HomePage.types";
import "./WorkJournalEntryForm.css";

type WorkJournalEntryFormValues = Omit<
  CreateJournalRecordPayload,
  "workTypeId" | "date" | "completedAt"
> & {
  workTypeId: number | undefined;
  date: Dayjs | null;
  completedAt: Dayjs | null;
};

interface WorkJournalEntryFormProps {
  isSubmitting: boolean;
  editData?: JournalRecordResponse;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateJournalRecordPayload) => Promise<void>;
  onEdit: (payload: UpdateJournalRecordPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const initialValues: WorkJournalEntryFormValues = {
  workTypeId: undefined,
  executorName: "",
  unit: "",
  volume: 0,
  date: dayjs(),
  completedAt: null,
  comment: "",
};

const mapRecordToFormValues = (
  record: JournalRecordResponse,
): WorkJournalEntryFormValues => ({
  workTypeId: record.workTypeId,
  executorName: record.executorName,
  unit: record.unit,
  volume: record.volume,
  date: dayjs(record.date),
  completedAt: record.completedAt ? dayjs(record.completedAt) : null,
  comment: record.comment ?? "",
});

export function WorkJournalEntryForm({
  editData = undefined,
  isLoading = false,
  isSubmitting,
  onCancel,
  onSubmit,
  onEdit,
  onDelete,
}: WorkJournalEntryFormProps) {
  const [workTypes, setWorkTypes] = useState<WorkTypeResponse[]>([]);
  const [isWorkTypesLoading, setIsWorkTypesLoading] = useState(true);
  const [workTypesError, setWorkTypesError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    trigger,
    watch,
  } = useForm<WorkJournalEntryFormValues>({
    defaultValues: initialValues,
  });
  const workDate = watch("date");

  useEffect(() => {
    reset(editData ? mapRecordToFormValues(editData) : initialValues);
  }, [editData, reset]);

  useEffect(() => {
    void trigger("completedAt");
  }, [workDate, trigger]);

  useEffect(() => {
    const controller = new AbortController();

    fetchWorkTypes(controller.signal)
      .then(({ data }) => {
        setWorkTypes(data);
        setWorkTypesError(null);
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) {
          return;
        }

        setWorkTypes([]);
        setWorkTypesError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить справочник работ",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsWorkTypesLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const workTypeOptions = useMemo(
    () =>
      workTypes.map((workType) => ({
        value: workType.id,
        label: workType.name,
      })),
    [workTypes],
  );

  const submitForm = handleSubmit(async (values) => {
    if (!values.workTypeId) {
      return;
    }

    const payload: CreateJournalRecordPayload = {
      ...values,
      workTypeId: values.workTypeId,
      date: values.date?.format("YYYY-MM-DD") ?? "",
      completedAt: values.completedAt?.format("YYYY-MM-DD") || undefined,
      comment: values.comment || undefined,
    };

    if (editData)
      await onEdit({
        ...payload,
        id: editData.id,
      });
    else await onSubmit(payload);
  });

  if (isLoading) {
    return (
      <div className="work-journal-entry-form__loader">
        <Spin />
      </div>
    );
  }

  return (
    <form className="work-journal-entry-form" onSubmit={submitForm}>
      {workTypesError && (
        <Alert
          type="error"
          title="Ошибка загрузки справочника работ"
          description={workTypesError}
          showIcon
        />
      )}
      <Controller
        name="workTypeId"
        control={control}
        rules={{
          validate: (value) => Boolean(value) || "Укажите тип работы",
        }}
        render={({ field }) => (
          <Select
            {...field}
            showSearch={{ optionFilterProp: "label" }}
            loading={isWorkTypesLoading}
            disabled={isWorkTypesLoading || Boolean(workTypesError)}
            status={errors.workTypeId ? "error" : ""}
            placeholder="Тип работы"
            options={workTypeOptions}
          />
        )}
      />
      <Controller
        name="executorName"
        control={control}
        rules={{ required: "Укажите исполнителя" }}
        render={({ field }) => (
          <Input
            {...field}
            status={errors.executorName ? "error" : ""}
            placeholder="Исполнитель"
          />
        )}
      />
      <Space.Compact block>
        <Controller
          name="volume"
          control={control}
          rules={{ min: 0 }}
          render={({ field }) => (
            <InputNumber
              {...field}
              className="work-journal-entry-form__volume"
              min={0}
              placeholder="Объем"
            />
          )}
        />
        <Controller
          name="unit"
          control={control}
          rules={{ required: "Укажите единицу" }}
          render={({ field }) => (
            <Input
              {...field}
              status={errors.unit ? "error" : ""}
              placeholder="Ед. изм."
            />
          )}
        />
      </Space.Compact>
      <div className="work-journal-entry-form__dates">
        <Controller
          name="date"
          control={control}
          rules={{ required: "Укажите дату работы" }}
          render={({ field }) => (
            <DatePicker
              {...field}
              className="work-journal-entry-form__date"
              status={errors.date ? "error" : ""}
              format="DD.MM.YYYY"
              placeholder="Дата работы"
            />
          )}
        />
        <Controller
          name="completedAt"
          control={control}
          rules={{
            validate: (value) => {
              const date = getValues("date");
              if (!value || !date) {
                return true;
              }

              return (
                value.isSame(date, "day") ||
                value.isAfter(date, "day") ||
                "Дата выполнения не может быть раньше даты работы"
              );
            },
          }}
          render={({ field }) => (
            <div>
              <DatePicker
              {...field}
              className="work-journal-entry-form__date"
              status={errors.completedAt ? "error" : ""}
              format="DD.MM.YYYY"
              placeholder="Дата выполнения"
              />
              {errors.completedAt?.message && (
                <div className="work-journal-entry-form__error">
                  {errors.completedAt.message}
                </div>
              )}
            </div>
          )}
        />
      </div>
      <Controller
        name="comment"
        control={control}
        render={({ field }) => (
          <Input.TextArea {...field} placeholder="Комментарий" rows={3} />
        )}
      />
      <div className="work-journal-entry-form__actions">
        <Button onClick={onCancel}>Отмена</Button>
        {editData ? (
          <>
            <Button
              color="orange"
              variant="solid"
              loading={isSubmitting}
              htmlType="submit"
            >
              Сохранить изменения
            </Button>
            <Button
              color="danger"
              variant="solid"
              loading={isSubmitting}
              onClick={async () => {
                await onDelete(editData.id.toString());
              }}
            >
              Удалить
            </Button>
          </>
        ) : (
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Создать
          </Button>
        )}
      </div>
    </form>
  );
}
