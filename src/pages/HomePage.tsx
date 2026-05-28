import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import {
  Alert,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  createJournalRecord,
  fetchJournalRecords,
  fetchWorkById,
} from "./HomePage.api";
import type {
  CreateJournalRecordPayload,
  DataType,
  JournalRecordResponse,
} from "./HomePage.types";
import { WorkJournalEntryForm } from "./WorkJournalEntryForm";
import "./HomePage.css";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoOutlined,
} from "@ant-design/icons";

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatDate = (date?: string | null) =>
  date ? dayjs(date).format("DD.MM.YYYY") : "";

const mapRecordToDataType = (record: JournalRecordResponse): DataType => ({
  key: String(record.id),
  typeWork: record.workType.name,
  executorName: record.executorName,
  unit: record.unit,
  volume: record.volume,
  date: formatDate(record.date),
  completedAt: formatDate(record.completedAt),
  isCompleted: Boolean(record.completedAt),
  comment: record.comment ?? "",
});

const getSortOrder = (
  sorter: Parameters<NonNullable<TableProps<DataType>["onChange"]>>[2],
) => {
  if (Array.isArray(sorter)) {
    return {
      sortField: sorter[0]?.field?.toString(),
      sortOrder: sorter[0]?.order ?? undefined,
    };
  }

  return {
    sortField: sorter.field?.toString(),
    sortOrder: sorter.order ?? undefined,
  };
};

export function HomePage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<JournalRecordResponse | undefined>();
  const [isLoadingWork, setIsLoadingWork] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const journalStats = useMemo(() => {
    const today = dayjs().format("DD.MM.YYYY");

    return {
      completedToday: dataSource.filter(
        (record) => record.completedAt === today,
      ).length,
      remaining: dataSource.filter((record) => !record.isCompleted).length,
    };
  }, [dataSource]);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Действия",
      dataIndex: "actions",
      key: "actions",
      render: (_: unknown, record: DataType) => (
        <Tooltip title="Открыть запись">
          <Button
            type="default"
            shape="circle"
            icon={<InfoOutlined />}
            onClick={() => handleEditWorkModal(record.key)}
          />
        </Tooltip>
      ),
    },
    {
      title: "Тип работы",
      dataIndex: "typeWork",
      key: "typeWork",
      sorter: true,
    },
    {
      title: "Исполнитель",
      dataIndex: "executorName",
      key: "executorName",
      sorter: true,
    },
    {
      title: "Объем",
      dataIndex: "volume",
      key: "volume",
      sorter: true,
      render: (volume: DataType["volume"], record) =>
        `${volume}${record.unit ? ` ${record.unit}` : ""}`,
    },
    {
      title: "Дата работы",
      dataIndex: "date",
      key: "date",
      sorter: true,
    },
    {
      title: "Дата выполнения",
      dataIndex: "completedAt",
      key: "completedAt",
      sorter: true,
      render: (completedAt: DataType["completedAt"]) => completedAt || "-",
    },
    {
      title: "Статус",
      dataIndex: "isCompleted",
      key: "status",
      sorter: true,
      render: (isCompleted: DataType["isCompleted"]) => (
        <Tag
          variant="solid"
          color={isCompleted ? "success" : "error"}
          icon={isCompleted ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isCompleted ? "Выполнено" : "Не выполнено"}
        </Tag>
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
    },
  ];

  const loadJournalRecords = useCallback(
    (signal?: AbortSignal) => {
      fetchJournalRecords(page, pageSize, sortField, sortOrder, signal)
        .then(({ data }) => {
          setDataSource(data.items.map(mapRecordToDataType));
          setTotal(data.total);
          setPage((currentPage) =>
            currentPage === data.page ? currentPage : data.page,
          );
          setError(null);
        })
        .catch((requestError) => {
          if (axios.isCancel(requestError)) {
            return;
          }

          setDataSource([]);
          setTotal(0);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Не удалось загрузить записи журнала",
          );
        })
        .finally(() => {
          if (!signal?.aborted) {
            setLoading(false);
          }
        });
    },
    [page, pageSize, sortField, sortOrder],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadJournalRecords(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadJournalRecords]);

  const handleEditWorkModal = async (id: string) => {
    setIsModalOpen(true);
    setIsLoadingWork(true);

    try {
      const { data: work } = await fetchWorkById(id);
      setEditData(work);
    } finally {
      setIsLoadingWork(false);
    }
  };

  const handleTableChange: TableProps<DataType>["onChange"] = (
    pagination,
    _filters,
    sorter,
  ) => {
    const nextSort = getSortOrder(sorter);

    setLoading(true);
    setError(null);
    setPage(pagination.current ?? 1);
    setSortField(nextSort.sortField);
    setSortOrder(nextSort.sortOrder);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setLoading(true);
    setError(null);
    setPage(1);
    setPageSize(nextPageSize);
  };

  const handleCreateRecord = async (payload: CreateJournalRecordPayload) => {
    setIsCreating(true);

    try {
      await createJournalRecord(payload);
      setIsModalOpen(false);
      setLoading(true);
      loadJournalRecords();
      messageApi.success("Запись создана");
    } catch (requestError) {
      messageApi.error(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось создать запись",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="home-page">
      {contextHolder}
      <Row gutter={[16, 16]} className="home-page__stats">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Выполнено сегодня"
              value={journalStats.completedToday}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Осталось выполнить задач"
              value={journalStats.remaining}
            />
          </Card>
        </Col>
      </Row>
      <div className="home-page__toolbar">
        <Space size={16}>
          <Button
            type="primary"
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Добавить запись
          </Button>
          <Button type="default" size="large" href="/typeWork">
            Справочник работ
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
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
        }}
      />
      <Modal
        title="Создание записи"
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(undefined);
        }}
        destroyOnHidden
      >
        <WorkJournalEntryForm
          editData={editData}
          isLoading={isLoadingWork}
          isSubmitting={isCreating}
          onCancel={() => {
            setIsModalOpen(false);
            setEditData(undefined);
          }}
          onSubmit={handleCreateRecord}
        />
      </Modal>
    </div>
  );
}

export default HomePage;
