import { Button, Form } from "antd";
import Text from "antd/es/typography/Text";

interface ApproveDeleteProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

export function ApproveDelete({
  isSubmitting,
  onCancel,
  onSubmit,
}: ApproveDeleteProps) {
  return (
    <Form layout="vertical" onFinish={onSubmit} disabled={isSubmitting}>
      <Text>Вы уверены, что хотите удалить эту запись?</Text>
      <div className="type-work-page__modal-actions">
        <Button onClick={onCancel}>Отмена</Button>
        <Button
          color="danger"
          variant="solid"
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
        >
          Подтвердить удаление
        </Button>
      </div>
    </Form>
  );
}
