import { useCallback, useEffect, useState } from "react";
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
  deleteJournalRecord,
  editJournalRecord,
  fetchJournalRecords,
  fetchWorkById,
  fetchWorkJournalStat,
} from "./HomePage.api";
import type {
  CreateJournalRecordPayload,
  DataType,
  JournalRecordResponse,
  UpdateJournalRecordPayload,
} from "./HomePage.types";
import { WorkJournalEntryForm } from "./WorkJournalEntryForm";
import "./HomePage.css";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { ApproveDelete } from "./ApproveDelete";

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
  const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  return {
    sortField:
      activeSorter?.columnKey?.toString() ?? activeSorter?.field?.toString(),
    sortOrder: activeSorter?.order ?? undefined,
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
  const [errorStatistic, setErrorStatistic] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isStatisticLoading, setIsStatisticLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [editData, setEditData] = useState<JournalRecordResponse | undefined>();
  const [isLoadingWork, setIsLoadingWork] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [completedWorks, setCompletedWorks] = useState(0);
  const [notCompletedWorks, setNotCompletedWorks] = useState(0);

  const loadJournalStats = useCallback((signal?: AbortSignal) => {
    fetchWorkJournalStat(signal)
      .then(({ data }) => {
        setCompletedWorks(data.completedWorks);
        setNotCompletedWorks(data.notCompletedWorks);
        setErrorStatistic(null);
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) {
          return;
        }

        setErrorStatistic(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить статистику журнала",
        );
      })
      .finally(() => {
        if (!signal?.aborted) {
          setIsStatisticLoading(false);
        }
      });
  }, []);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Действия",
      dataIndex: "actions",
      key: "actions",
      render: (_: unknown, record: DataType) => (
        <>
          <Tooltip title="Открыть запись">
            <Button
              className="action-button"
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEditWorkModal(record.key)}
            />
          </Tooltip>
          <Tooltip title="Удалить запись">
            <Button
              type="default"
              shape="circle"
              variant="solid"
              color="danger"
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalDeleteOpen(true);
                setDeleteId(record.key);
              }}
            />
          </Tooltip>
        </>
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
    const controllerStatistic = new AbortController();

    loadJournalRecords(controller.signal);
    loadJournalStats(controllerStatistic.signal);

    return () => {
      controller.abort();
      controllerStatistic.abort();
    };
  }, [loadJournalRecords, loadJournalStats]);

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
      setIsStatisticLoading(true);
      loadJournalRecords();
      loadJournalStats();
      messageApi.success("Запись создана");
    } catch (requestError) {
      messageApi.error(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось создать запись",
      );
      throw requestError;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditRecord = async (payload: UpdateJournalRecordPayload) => {
    setIsCreating(true);
    try {
      await editJournalRecord(payload);
      setIsModalOpen(false);
      setLoading(true);
      setIsStatisticLoading(true);
      loadJournalRecords();
      loadJournalStats();
      messageApi.success("Запись изменена");
    } catch (requestError) {
      messageApi.error(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось изменить запись",
      );
      throw requestError;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setIsCreating(true);
    try {
      await deleteJournalRecord(id);
      setLoading(true);
      setIsStatisticLoading(true);
      loadJournalRecords();
      loadJournalStats();
      messageApi.success("Запись удалена");
    } catch (requestError) {
      messageApi.error(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось удалить запись",
      );
      throw requestError;
    } finally {
      setIsCreating(false);
    }
  };

  const handleApproveDelete = async () => {
    if (!deleteId) {
      return;
    }

    await handleDeleteRecord(deleteId);
    setIsModalDeleteOpen(false);
    setDeleteId(null);
  };

  return (
    <div className="home-page">
      {contextHolder}
      <Row gutter={[16, 16]} className="home-page__stats">
        {errorStatistic ? (
          <Col xs={24} sm={12}>
            <Alert
              type="error"
              title="Ошибка загрузки статистики"
              description={errorStatistic}
              showIcon
            />
          </Col>
        ) : (
          <>
            <Col xs={24} sm={12}>
              <Card loading={isStatisticLoading}>
                <Statistic title="Выполнено сегодня" value={completedWorks} />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card loading={isStatisticLoading}>
                <Statistic
                  title="Осталось выполнить задач"
                  value={notCompletedWorks}
                />
              </Card>
            </Col>
          </>
        )}
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
        scroll={{ x: 1080 }}
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
        title={editData ? "Редактирование записи" : "Создание записи"}
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        afterOpenChange={(open) => {
          if (!open) {
            setEditData(undefined);
          }
        }}
        destroyOnHidden
      >
        <WorkJournalEntryForm
          editData={editData}
          isLoading={isLoadingWork}
          isSubmitting={isCreating}
          onCancel={() => {
            setIsModalOpen(false);
          }}
          onSubmit={handleCreateRecord}
          onEdit={handleEditRecord}
        />
      </Modal>

      <Modal
        title="Подтвердите удаление"
        open={isModalDeleteOpen}
        footer={null}
        destroyOnHidden
      >
        <ApproveDelete
          isSubmitting={isCreating}
          onSubmit={handleApproveDelete}
          onCancel={() => {
            setIsModalDeleteOpen(false);
            setDeleteId(null);
          }}
        />
      </Modal>
    </div>
  );
}

export default HomePage;
