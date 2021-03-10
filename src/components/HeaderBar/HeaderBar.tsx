import React from "react";
import { Breadcrumb, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, CaretDownOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import combineClassNames from "../../utils/combineClassNames";
import styles from "./HeaderBar.module.scss";
import { findSubMenuOfPath, getRouteInfoOfPath } from "../../routes/routes";

const AvatarOverlayMenu = (
  <Menu theme="light">
    <Menu.Item key="logout">登出</Menu.Item>
  </Menu>
);

function HeaderBar() {
  const location = useLocation();
  const pathname = location.pathname;
  const openSubMenu = findSubMenuOfPath(pathname);
  const routeInfo = getRouteInfoOfPath(pathname);
  return (
    <div className={styles.header}>
      <div className={styles["left-panel"]}>
        <Breadcrumb className={styles.breadcrumb}>
          <Breadcrumb.Item key="/">
            <Link to="/">首页</Link>
          </Breadcrumb.Item>
          {openSubMenu && (
            <Breadcrumb.Item key={openSubMenu.key}>
              {openSubMenu.name}
            </Breadcrumb.Item>
          )}
          {routeInfo && routeInfo.path !== "/" && (
            <Breadcrumb.Item key={routeInfo.path}>
              <Link to={routeInfo.path}>{routeInfo.name}</Link>
            </Breadcrumb.Item>
          )}
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
