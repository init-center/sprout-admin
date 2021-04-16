import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import { Breadcrumb, Avatar, Dropdown, Menu, message } from "antd";
import { UserOutlined, CaretDownOutlined } from "@ant-design/icons";
import { Link, useHistory, useLocation } from "react-router-dom";
import combineClassNames from "../../utils/combineClassNames";
import styles from "./HeaderBar.module.scss";
import { findSubMenuOfPath, getRouteInfoOfPath } from "../../routes/routes";
import http, { ResponseData } from "../../utils/http/http";
import { BanStatus, Gender, User, UserGroup } from "../../types";

function HeaderBar() {
  const location = useLocation();
  const router = useHistory();
  const pathname = location.pathname;
  const openSubMenu = findSubMenuOfPath(pathname);
  const routeInfo = getRouteInfoOfPath(pathname);
  const [AdminInfo, setAdminInfo] = useState<User>({
    uid: "",
    name: "",
    avatar: "",
    email: "",
    gender: Gender.MALE,
    tel: "",
    birthday: "",
    group: UserGroup.DEFAULT,
    createTime: "",
    updateTime: "",
    deleteTime: "",
    banStartTime: "",
    banEndTime: "",
    isBaned: BanStatus.BANED,
  });

  const getAdminInfo = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<User>>("/users/private");
      if (
        response.status === 200 &&
        response.data.code === 2000 &&
        response.data.data
      ) {
        setAdminInfo(response.data.data);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.destroy();
        message.error(msg);
      }
    }
  }, []);

  useEffect(() => {
    getAdminInfo();
  }, [getAdminInfo]);

  const AvatarOverlayMenu = useMemo(() => {
    return (
      <Menu theme="light">
        <Menu.Item
          key="logout"
          onClick={() => {
            window.localStorage.removeItem("token");
            router.push("/login");
          }}
        >
          登出
        </Menu.Item>
      </Menu>
    );
  }, [router]);

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
              src={AdminInfo.avatar}
            />
            <CaretDownOutlined className={styles.caret} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default memo(HeaderBar);
