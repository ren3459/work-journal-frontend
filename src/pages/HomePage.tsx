import { Button, Card, Col, Row, Space, Statistic, Typography } from "antd";
import "./HomePage.css";

const { Title, Paragraph, Text } = Typography;

const recentEntries = [
  {
    id: 1,
    title: "Планирование задач",
    description: "Собрать приоритеты на день и отметить ключевые блокеры.",
  },
  {
    id: 2,
    title: "Рабочие заметки",
    description: "Зафиксировать решения, идеи и важные договоренности.",
  },
  {
    id: 3,
    title: "Итоги дня",
    description: "Подвести результат и подготовить следующий шаг.",
  },
];

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-page__hero">
        <Space size={16}>
          <Text className="home-page__eyebrow">Work Journal</Text>
          <Title level={1} className="home-page__title">
            Главная страница рабочего журнала
          </Title>
          <Paragraph className="home-page__description">
            Быстрый обзор задач, заметок и прогресса за день.
          </Paragraph>
          <Space wrap>
            <Button type="primary" size="large">
              Добавить запись
            </Button>
            <Button size="large">Посмотреть журнал</Button>
          </Space>
        </Space>
      </section>

      <Row gutter={[16, 16]} className="home-page__stats">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Задачи сегодня" value={8} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Выполнено" value={5} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Заметки" value={12} />
          </Card>
        </Col>
      </Row>

      <section className="home-page__entries">
        <Title level={2}>Последние записи</Title>
        <Row gutter={[16, 16]}>
          {recentEntries.map((entry) => (
            <Col xs={24} md={8} key={entry.id}>
              <Card title={entry.title} className="home-page__entry-card">
                <Paragraph>{entry.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}

export default HomePage;
