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
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { fetchWorkTypes } from "./HomePage.api";
import type {
  CreateJournalRecordPayload,
  WorkTypeResponse,
  WorkTypesResponse,
} from "./HomePage.types";

type WorkJournalEntryFormValues = Omit<CreateJournalRecordPayload, "date"> & {
  date: Dayjs | null;
};

interface WorkJournalEntryFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateJournalRecordPayload) => Promise<void>;
}

const initialValues: WorkJournalEntryFormValues = {
  typeWork: "",
  executorName: "",
  unit: "",
  volume: 0,
  date: dayjs(),
  comment: "",
};

const getWorkTypeName = (workType: WorkTypeResponse) =>
  workType.name ?? workType.typeWork ?? workType.title ?? "";

const getWorkTypesItems = (
  response: WorkTypeResponse[] | WorkTypesResponse,
) => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? [];
};

export function WorkJournalEntryForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: WorkJournalEntryFormProps) {
  const [workTypes, setWorkTypes] = useState<WorkTypeResponse[]>([]);
  const [isWorkTypesLoading, setIsWorkTypesLoading] = useState(true);
  const [workTypesError, setWorkTypesError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkJournalEntryFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchWorkTypes(controller.signal)
      .then(({ data }) => {
        setWorkTypes(getWorkTypesItems(data));
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
      workTypes
        .map((workType) => {
          const name = getWorkTypeName(workType);

          return {
            value: name,
            label: name,
            key: String(workType.key ?? workType.id ?? name),
          };
        })
        .filter((option) => option.value),
    [workTypes],
  );

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      date: values.date?.format("YYYY-MM-DD") ?? "",
    });
    reset(initialValues);
  });

  return (
    <form className="work-journal-entry-form" onSubmit={submitForm}>
      {workTypesError && (
        <Alert
          type="error"
          message="Ошибка загрузки справочника работ"
          description={workTypesError}
          showIcon
        />
      )}
      <Controller
        name="typeWork"
        control={control}
        rules={{ required: "Укажите тип работы" }}
        render={({ field }) => (
          <Select
            {...field}
            showSearch
            loading={isWorkTypesLoading}
            disabled={isWorkTypesLoading || Boolean(workTypesError)}
            status={errors.typeWork ? "error" : ""}
            placeholder="Тип работы"
            optionFilterProp="label"
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
      <Controller
        name="date"
        control={control}
        rules={{ required: "Укажите дату" }}
        render={({ field }) => (
          <DatePicker
            {...field}
            className="work-journal-entry-form__date"
            status={errors.date ? "error" : ""}
            format="DD.MM.YYYY"
          />
        )}
      />
      <Controller
        name="comment"
        control={control}
        render={({ field }) => (
          <Input.TextArea {...field} placeholder="Комментарий" rows={3} />
        )}
      />
      <div className="work-journal-entry-form__actions">
        <Button onClick={onCancel}>Отмена</Button>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          Создать
        </Button>
      </div>
    </form>
  );
}
