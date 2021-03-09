import React, { useState, FC, useEffect } from "react";
import { Layout, Menu, ConfigProvider, message } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  CommentOutlined,
  FormOutlined,
  TagOutlined,
  GroupOutlined,
} from "@ant-design/icons";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
import { useHistory } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import styles from "./AdminLayout.module.scss";
import combineClassNames from "../../utils/combineClassNames";
import http, { ResponseData } from "../../utils/http/http";

moment.locale("zh-cn");

const { Sider, Header, Content } = Layout;
const { SubMenu } = Menu;

const AdminLayout: FC = ({ children }) => {
  const history = useHistory();
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await http.get<ResponseData>("/session/admin");
      } catch (error) {
        const msg = error?.response?.data?.message;
        const statusCode = error?.response?.status;
        if (msg) {
          message.error(msg);
        }

        if (statusCode === 401) {
          history.push("/login");
        }
      }
    })();
  }, [history]);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout hasSider={true} className={styles.layout}>
        <Sider
          className={styles.sider}
          defaultCollapsed={true}
          collapsible={true}
          collapsedWidth="58"
          onCollapse={(collapsed) => {
            setIsCollapsed(collapsed);
          }}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            zIndex: 100,
          }}
        >
          <Logo isTitleShow={!isCollapsed} />
          <Menu className={styles.menu} theme="dark" mode="inline">
            <Menu.Item
              key="home"
              icon={<HomeOutlined />}
              onClick={() => {
                history.push("/");
              }}
            >
              首页
            </Menu.Item>
            <SubMenu key="sub1" icon={<FormOutlined />} title="文章管理">
              <Menu.Item
                key="posts"
                onClick={() => {
                  history.push("/posts");
                }}
              >
                文章列表
              </Menu.Item>
              <Menu.Item
                key="write"
                onClick={() => {
                  history.push("/write");
                }}
              >
                写文章
              </Menu.Item>
            </SubMenu>
            <SubMenu
              key="comments-manage"
              icon={<CommentOutlined />}
              title="评论管理"
            >
              <Menu.Item
                key="comments"
                onClick={() => {
                  history.push("/comments");
                }}
              >
                评论列表
              </Menu.Item>
            </SubMenu>
            <SubMenu
              key="users-manage"
              icon={<UserOutlined />}
              title="用户管理"
            >
              <Menu.Item
                key="users"
                onClick={() => {
                  history.push("/users");
                }}
              >
                用户列表
              </Menu.Item>
            </SubMenu>
            <SubMenu
              key="categories-manage"
              icon={<GroupOutlined />}
              title="分类管理"
            >
              <Menu.Item
                key="categories"
                onClick={() => {
                  history.push("/categories");
                }}
              >
                分类列表
              </Menu.Item>
            </SubMenu>
            <SubMenu key="tags-manage" icon={<TagOutlined />} title="标签管理">
              <Menu.Item
                key="tags"
                onClick={() => {
                  history.push("/tags");
                }}
              >
                标签列表
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout className={styles["layout-has-sider"]}>
          <div
            className={combineClassNames(
              styles["padding-sider"],
              isCollapsed ? styles.collapsed : ""
            )}
          ></div>
          <Layout className={styles["content-box"]}>
            <Header className={styles.header}>
              <HeaderBar />
            </Header>
            <Content className={styles.content}>{children}</Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
