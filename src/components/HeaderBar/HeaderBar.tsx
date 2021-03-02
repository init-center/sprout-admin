import React from "react";
import { Breadcrumb, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, CaretDownOutlined } from "@ant-design/icons";
import combineClassNames from "../../utils/combineClassNames";
import styles from "./HeaderBar.module.scss";

const AvatarOverlayMenu = (
  <Menu theme="light">
    <Menu.Item key="1">登出</Menu.Item>
  </Menu>
);

function HeaderBar() {
  return (
    <div className={styles.header}>
      <div className={styles["left-panel"]}>
        <Breadcrumb className={styles.breadcrumb}>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="/">文章管理</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="/">文章列表</a>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className={styles["right-panel"]}>
        <Dropdown overlay={AvatarOverlayMenu}>
          <div
            className={combineClassNames(
              styles["panel-action-item"],
              styles["avatar-box"]
            )}
          >
            <Avatar
              size="default"
              alt="avatar"
              icon={<UserOutlined />}
              src="https://img-static.mihoyo.com/avatar/avatar30007.png"
            />
            <CaretDownOutlined className={styles.caret} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default HeaderBar;
