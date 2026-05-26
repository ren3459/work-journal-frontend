import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export function TypesPage() {
  return (
    <Card>
      <Title level={1}>О проекте</Title>
      <Paragraph>
        Здесь можно описать назначение рабочего журнала, основные сценарии и
        правила ведения записей.
      </Paragraph>
    </Card>
  );
}

export default TypesPage;
