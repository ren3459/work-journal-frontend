import { Button, Form, Input } from "antd";

export interface CreateWorkTypeFormValues {
  name: string;
}

interface TypeWorkFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateWorkTypeFormValues) => Promise<void>;
}

export function TypeWorkForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: TypeWorkFormProps) {
  return (
    <Form layout="vertical" onFinish={onSubmit} disabled={isSubmitting}>
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
        <Input autoFocus placeholder="Тип работы" />
      </Form.Item>
      <div className="type-work-page__modal-actions">
        <Button onClick={onCancel}>Отмена</Button>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          Создать
        </Button>
      </div>
    </Form>
  );
}
