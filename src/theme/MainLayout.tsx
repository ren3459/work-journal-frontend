// layouts/MainLayout.tsx
import glassTheme from "./glassTheme";
import { Outlet, Link } from "react-router-dom";
import { ConfigProvider, Layout } from "antd";
import "./MainLayout.css";
import { Typography } from "antd";

const { Title } = Typography;

export function MainLayout() {
  const { Header, Footer, Sider, Content } = Layout;
  const configProps = glassTheme();
  return (
    <ConfigProvider {...configProps}>
      <Layout className="layoutStyle">
        <Header className="headerStyle">
          <Title> Журнал работ</Title>
        </Header>
        <Layout className="mainLayoutBody">
          <Sider width="15vw" className="siderStyle">
            <Link to="/">Главная</Link>
            <Link to="/about">О нас</Link>
          </Sider>
          <Content className="contentStyle">
            <Outlet />
          </Content>
        </Layout>
        <Footer className="footerStyle">© 2026</Footer>
      </Layout>
    </ConfigProvider>
  );
}
