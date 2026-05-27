import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  message,
} from "antd";
import Title from "antd/es/typography/Title";
import { createWorkType, fetchWorkTypes } from "./HomePage.api";
import type { WorkTypeResponse } from "./HomePage.types";
import "./HomePage.css";

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface WorkTypeTableData {
  key: string;
  id: number;
  name: string;
  createdAt: string;
}

interface CreateWorkTypeFormValues {
  name: string;
}

const columns: TableProps<WorkTypeTableData>["columns"] = [
  {
    title: "Название",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Дата создания",
    dataIndex: "createdAt",
    key: "createdAt",
  },
];

const mapWorkTypeToTableData = (
  workType: WorkTypeResponse,
): WorkTypeTableData => ({
  key: String(workType.id),
  id: workType.id,
  name: workType.name,
  createdAt: dayjs(workType.createdAt).format("DD.MM.YYYY"),
});

export function TypeWorkPage() {
  const [form] = Form.useForm<CreateWorkTypeFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [dataSource, setDataSource] = useState<WorkTypeTableData[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadWorkTypes = useCallback((signal?: AbortSignal) => {
    fetchWorkTypes(signal)
      .then(({ data }) => {
        setDataSource(data.map(mapWorkTypeToTableData));
        setError(null);
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) {
          return;
        }

        setDataSource([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить справочник работ",
        );
      })
      .finally(() => {
        if (!signal?.aborted) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadWorkTypes(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadWorkTypes]);

  const pagedDataSource = useMemo(() => {
    const start = (page - 1) * pageSize;

    return dataSource.slice(start, start + pageSize);
  }, [dataSource, page, pageSize]);

  const handleTableChange: TableProps<WorkTypeTableData>["onChange"] = (
    pagination,
  ) => {
    setPage(pagination.current ?? 1);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPage(1);
    setPageSize(nextPageSize);
  };

  const handleCreateWorkType = async (values: CreateWorkTypeFormValues) => {
    setIsCreating(true);

    try {
      await createWorkType(values.name.trim());
      form.resetFields();
      setIsCreateModalOpen(false);
      setLoading(true);
      loadWorkTypes();
      messageApi.success("Тип работы создан");
    } catch (requestError) {
      messageApi.error(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось создать тип работы",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="home-page">
      {contextHolder}
      <Title level={2} className="home-page__title">
        Справочник типов работ
      </Title>
      <div className="home-page__toolbar">
        <Space size={16}>
          <Button
            type="primary"
            size="large"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Добавить тип работы
          </Button>
          <Button type="default" size="large" href="/">
            Журнал работ
          </Button>
        </Space>
        <Space size={8}>
          <span>На странице</span>
          <Select
            value={pageSize}
            options={PAGE_SIZE_OPTIONS.map((value) => ({
              value,
              label: value,
            }))}
            onChange={handlePageSizeChange}
          />
        </Space>
      </div>
      {error && (
        <Alert
          type="error"
          title="Ошибка загрузки данных"
          description={error}
          showIcon
        />
      )}
      <Table
        dataSource={pagedDataSource}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total: dataSource.length,
          showSizeChanger: false,
        }}
      />
      <Modal
        title="Создание типа работы"
        open={isCreateModalOpen}
        footer={null}
        onCancel={() => setIsCreateModalOpen(false)}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateWorkType}
          disabled={isCreating}
        >
          <Form.Item
            label="Название"
            name="name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Введите название типа работы",
              },
            ]}
          >
            <Input placeholder="Тип работы" />
          </Form.Item>
          <div className="work-journal-entry-form__actions">
            <Button onClick={() => setIsCreateModalOpen(false)}>Отмена</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Создать
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default TypeWorkPage;
