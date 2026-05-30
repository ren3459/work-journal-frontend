import { Outlet } from "react-router-dom";
import { ConfigProvider, Layout, theme } from "antd";
import "./MainLayout.css";
import { Typography } from "antd";

const { Title } = Typography;

export function MainLayout() {
  const { Header, Footer, Content } = Layout;
  const configProps = { theme: { algorithm: theme.defaultAlgorithm } };
  return (
    <ConfigProvider {...configProps}>
      <Layout className="layoutStyle">
        <Header className="headerStyle">
          <Title> Журнал работ</Title>
        </Header>
        <Layout className="mainLayoutBody">
          <Content className="contentStyle">
            <Outlet />
          </Content>
        </Layout>
        <Footer className="footerStyle">© 2026</Footer>
      </Layout>
    </ConfigProvider>
  );
}
