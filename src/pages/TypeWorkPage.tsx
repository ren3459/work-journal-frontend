import { Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export function TypeWorkPage() {
  return (
    <Card>
      <Title level={1}>О проекте</Title>
      <Button type="default" size="large" href="/">
        Журнал работ
      </Button>
      <Paragraph>
        Здесь можно описать назначение рабочего журнала, основные сценарии и
        правила ведения записей.
      </Paragraph>
    </Card>
  );
}

export default TypeWorkPage;
