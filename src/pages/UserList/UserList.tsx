import React, { FC, useCallback, useEffect, useState } from "react";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { useHistory as useRouter } from "react-router-dom";
import {
  BanStatus,
  Gender,
  UpdateUserType,
  User,
  UserGroup,
  UserListType,
} from "../../types";
import styles from "./UserList.module.scss";
import http, { ResponseData } from "../../utils/http/http";
import {
  Button,
  Image,
  Input,
  message,
  Modal,
  Space,
  Select,
  Badge,
  Form,
  Switch,
} from "antd";
import DatePicker from "../../components/DatePicker/DatePicker";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { formatTime } from "../../utils/formatTime";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";
import { telRegexp, urlRegexp } from "../../utils/constants";
import { validEmail, validName } from "../../utils/valid/valid_rules";

type SearchValuesType = {
  uid: string | null;
  name: string | null;
  email: string | null;
  isBaned: number | null;
  isDelete: number | null;
  group: UserGroup | null;
  createRangeDate: null | [Date | string | null, Date | string | null];
  banRangeDate: null | [Date | string | null, Date | string | null];
  gender: Gender | null;
  tel: string | null;
};

const searchInitialValues: SearchValuesType = {
  uid: null,
  name: null,
  email: null,
  isBaned: null,
  isDelete: null,
  group: null,
  createRangeDate: [null, null],
  banRangeDate: [null, null],
  gender: null,
  tel: null,
};

const Table = TableWrapper<User, SearchValuesType>();
const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

const UserList: FC = () => {
  const router = useRouter();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [userList, setUserList] = useState<UserListType>({
    page: {
      currentPage: 1,
      size: 7,
      count: 0,
    },
    list: [],
  });

  const [tableRowKeySuffix, setTableRowKeySuffix] = useState<unknown>(
    Date.now()
  );

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [banRangeDate, setBanRangeDate] = useState<
    [Date | string | null, Date | string | null]
  >([null, null]);

  const [banModalVisible, setBanModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);

  const getAllUsers = useCallback<
    (
      searchValues?: SearchValuesType,
      limit?: number,
      page?: number
    ) => Promise<void>
  >(
    async (searchValues = searchInitialValues, limit = 7, page = 1) => {
      setIsTableLoading(true);
      const {
        uid,
        isDelete,
        createRangeDate,
        banRangeDate,
        name,
        email,
        isBaned,
        gender,
        tel,
        group,
      } = searchValues;
      const queryFields = {
        uid,
        isDelete,
        name,
        email,
        isBaned,
        gender,
        tel,
        group,
        createTimeStart: createRangeDate
          ? formatTime(createRangeDate[0])
          : null,
        createTimeEnd: createRangeDate ? formatTime(createRangeDate[1]) : null,
        banTimeStart: banRangeDate ? formatTime(banRangeDate[0]) : null,
        banTimeEnd: banRangeDate ? formatTime(banRangeDate[1]) : null,
      };
      try {
        const response = await http.get<ResponseData<UserListType>>(
          `/admin/users?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setUserList({ ...response.data.data });
          setTableRowKeySuffix(response.data.time);
          setIsTableLoading(false);
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        const statusCode = error?.response?.status;
        if (msg) {
          message.error(msg);
        }

        if (statusCode === 401) {
          router.push("/login");
        }
      }
    },
    [router]
  );

  const pageChangeHandler = useCallback(
    (page: number, pageSize?: number | undefined) => {
      pageSize = pageSize ?? 7;
      getAllUsers(searchValues, pageSize, page);
    },
    [getAllUsers, searchValues]
  );

  const onSearchFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAllUsers(form);
    },
    [getAllUsers]
  );

  const banUserHandler = useCallback(async () => {
    if (!banRangeDate[0] || !banRangeDate[1]) {
      message.error("未选择封禁时间！");
      return;
    }
    if (!selectedUser) {
      message.error("未选择用户！");
      return;
    }

    try {
      const response = await http.post<ResponseData>(
        `/admin/users/${selectedUser.uid}/ban`,
        {
          banStartTime: banRangeDate[0],
          banEndTime: banRangeDate[1],
        }
      );
      if (response.status === 200 && response.data.code === 2000) {
        message.success("封禁用户成功！");
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    } finally {
      setBanModalVisible(false);
      setSelectedUser(null);
      getAllUsers();
    }
  }, [banRangeDate, selectedUser, getAllUsers]);

  const unblockUser = useCallback(
    async (uid: string, name: string) => {
      confirm({
        title: "正在解禁用户！",
        icon: <ExclamationCircleOutlined />,
        content: `确定要解禁id为“${uid}”，用户名为“${name}”的用户吗？`,
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.delete<ResponseData>(
                `admin/users/${uid}/ban`
              );
              if (result.status === 200 && result.data.code === 2000) {
                message.success(`解禁用户${uid}成功！`);

                resolve();
              }
            } catch (error) {
              const msg = error?.response?.data?.message;
              if (msg) {
                message.error(msg);
              }
              resolve();
            } finally {
              getAllUsers();
            }
          });
        },
      });
    },
    [getAllUsers]
  );

  const onUpdateUser: Callbacks<UpdateUserType>["onFinish"] = useCallback(
    async (form: UpdateUserType) => {
      if (!selectedUser) {
        message.error("未选中用户！");
        return;
      }
      if (form.birthday) {
        form.birthday = formatTime(form.birthday, "YYYY-MM-DD");
      }
      if (!form.tel) {
        form.tel = null;
      }
      try {
        const result = await http.put<ResponseData>(
          `admin/users/${selectedUser.uid}`,
          form
        );
        if (result.status === 200 && result.data.code === 2000) {
          message.success(`修改成功`);
          setSelectedUser(null);
          setUpdateModalVisible(false);
          getAllUsers();
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.error(msg);
        }
      }
    },
    [selectedUser, getAllUsers]
  );

  const toggleDelete = useCallback(
    (user: User) => {
      const deleteTime = user.deleteTime;
      confirm({
        title: deleteTime ? "正在进行恢复操作！" : "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: deleteTime
          ? "确定要恢复这个用户吗？"
          : "确定要删除这个用户吗？非物理删除，你可以随时恢复。",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.put<ResponseData>(
                `/admin/users/${user.uid}`,
                {
                  isDelete: deleteTime ? 0 : 1,
                }
              );
              if (result.status === 200 && result.data.code === 2000) {
                message.success(deleteTime ? "恢复成功！" : "删除成功！");
                // resolve to close
                resolve();
              }
            } catch (error) {
              const msg = error?.response?.data?.message;
              if (msg) {
                message.error(msg);
              }
              resolve();
            } finally {
              getAllUsers();
            }
          });
        },
        onCancel() {
          return Promise.resolve();
        },
      });
    },
    [getAllUsers]
  );

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const columns: ColumnsType<User> = [
    {
      title: "id",
      dataIndex: "uid",
      key: "uid",
      width: 150,
      align: "center",
    },
    {
      title: "用户名",
      dataIndex: "name",
      key: "name",
      width: 150,
      align: "center",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 150,
      align: "center",
    },
    {
      title: "性别",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      width: 40,
      render: (gender: Gender) =>
        gender === Gender.FEMALE
          ? "女"
          : gender === Gender.MALE
          ? "男"
          : "未知",
    },
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      align: "center",
      width: 80,
      render: (url: string) => (
        <Image src={url} placeholder={true} width={40} alt="avatar" />
      ),
    },
    {
      title: "电话",
      dataIndex: "tel",
      key: "tel",
      align: "center",
      width: 120,
      render: (tel: string) => tel ?? "未设置",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      align: "center",
      width: 120,
      render: (createTime: string) => formatTime(createTime),
    },
    {
      title: "用户组",
      dataIndex: "group",
      key: "group",
      align: "center",
      width: 60,
      render: (group: UserGroup) =>
        group === UserGroup.ADMIN
          ? "管理员"
          : group === UserGroup.DEFAULT
          ? "普通用户"
          : "未知身份",
    },
    {
      title: "封禁状态",
      key: "isBaned",
      dataIndex: "isBaned",
      align: "center",
      width: 100,
      render: (isBaned: BanStatus, record) => {
        return (
          <>
            <div>
              <Badge status={!isBaned ? "success" : "error"} />
              {!isBaned ? "未封禁" : "封禁中"}
            </div>
            {isBaned ? (
              <p>
                {formatTime(record.banStartTime as string)} 至{" "}
                {formatTime(record.banEndTime as string)}
              </p>
            ) : null}
          </>
        );
      },
    },
    {
      title: "生日",
      dataIndex: "birthday",
      key: "birthday",
      align: "center",
      width: 120,
      render: (birthday: string) =>
        birthday ? formatTime(birthday, "YYYY-MM-DD") : "未设置",
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      align: "center",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            key="1"
            onClick={() => {
              setSelectedUser(record);
              setUpdateModalVisible(true);
            }}
          >
            编辑
          </Button>
          {record.isBaned ? (
            <Button
              type="primary"
              size="small"
              key="2"
              onClick={() => {
                unblockUser(record.uid, record.name);
              }}
            >
              解禁
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              key="2"
              onClick={() => {
                setSelectedUser(record);
                setBanModalVisible(true);
              }}
            >
              封禁
            </Button>
          )}
          {record.deleteTime ? (
            <Button
              type="primary"
              size="small"
              key="3"
              onClick={() => toggleDelete(record)}
            >
              恢复
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              key="3"
              danger
              onClick={() => toggleDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const searchFields: SearchItem[] = [
    {
      name: "isBaned",
      label: "封禁状态",
      render: () => {
        return (
          <Select style={{ width: 120 }} placeholder="未选择">
            <Option value={2}>所有</Option>
            <Option value={0}>未封禁</Option>
            <Option value={1}>封禁</Option>
          </Select>
        );
      },
    },
    {
      name: "isDelete",
      label: "删除状态",
      render: () => {
        return (
          <Select style={{ width: 120 }} placeholder="未选择">
            <Option value={2}>所有</Option>
            <Option value={1}>删除</Option>
            <Option value={0}>未删除</Option>
          </Select>
        );
      },
    },
    {
      name: "group",
      label: "用户组",
      render: () => {
        return (
          <Select style={{ width: 120 }} placeholder="未选择">
            <Option value={0}>所有</Option>
            <Option value={1}>管理员</Option>
            <Option value={2}>普通用户</Option>
          </Select>
        );
      },
    },
    {
      name: "gender",
      label: "性别",
      render: () => {
        return (
          <Select style={{ width: 120 }} placeholder="未选择">
            <Option value={2}>所有</Option>
            <Option value={0}>男</Option>
            <Option value={1}>女</Option>
          </Select>
        );
      },
    },
    {
      name: "createRangeDate",
      label: "创建时间",
      render: () => {
        return <RangePicker />;
      },
    },
    {
      name: "banRangeDate",
      label: "封禁时间",
      render: () => {
        return <RangePicker showTime />;
      },
    },
    {
      name: "name",
      label: false,
      render: () => {
        return <Input placeholder="请输入用户名" />;
      },
    },
    {
      name: "uid",
      label: false,
      render: () => {
        return <Input placeholder="请输入用户id" />;
      },
    },
    {
      name: "email",
      label: false,
      render: () => {
        return <Input placeholder="请输入用户邮箱" />;
      },
    },
    {
      name: "tel",
      label: false,
      render: () => {
        return <Input placeholder="请输入用户电话" />;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className={styles["userlist-box"]}>
        <Table
          columns={columns}
          dataSource={userList.list}
          page={userList.page}
          scroll={{ x: 1200 }}
          onPageChange={pageChangeHandler}
          isTableLoading={isTableLoading}
          searchFields={searchFields}
          onSearch={onSearchFinish}
          searchInitialValues={searchValues}
          rowKeyKey="uid"
          rowKeySuffix={tableRowKeySuffix}
        />
        <Modal
          title={"封禁用户"}
          wrapClassName="ban-modal"
          visible={banModalVisible}
          width="60%"
          cancelText={"取消"}
          okText={"封禁"}
          onOk={banUserHandler}
          onCancel={() => {
            setSelectedUser(null);
            setBanModalVisible(false);
          }}
        >
          <div>
            <p>
              <strong>id: {selectedUser?.uid}</strong>
            </p>
            <p>
              <strong>用户名：{selectedUser?.name}</strong>
            </p>
            <p>请选择封禁时间段：</p>
            <RangePicker
              showTime
              onChange={(_dates, dateStrings) => {
                setBanRangeDate(dateStrings);
              }}
            />
          </div>
        </Modal>
        <Modal
          title={"编辑用户信息"}
          wrapClassName="update-user-modal"
          visible={updateModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedUser(null);
            setUpdateModalVisible(false);
          }}
        >
          <Form
            onFinish={onUpdateUser}
            initialValues={{
              name: selectedUser?.name,
              avatar: selectedUser?.avatar,
              tel: selectedUser?.tel,
              email: selectedUser?.email,
              gender: selectedUser?.gender ?? 0,
              birthday: selectedUser?.birthday
                ? new Date(selectedUser?.birthday)
                : null,
              group: selectedUser?.group ?? 2,
              isDelete: selectedUser?.deleteTime ? 1 : 0,
            }}
          >
            <Form.Item
              name="name"
              key="name"
              label="用户名"
              rules={[
                { required: true, message: "请输入用户名！" },
                {
                  validator: validName,
                },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="email"
              key="email"
              label="邮箱"
              rules={[
                { required: true, message: "请输入邮箱！" },
                {
                  validator: validEmail,
                },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item
              name="avatar"
              key="avatar"
              label="头像链接"
              rules={[
                {
                  required: true,
                  message: "请输入封面图片链接",
                },
                {
                  pattern: urlRegexp,
                  message: "请输入符合规范的链接地址",
                },
              ]}
            >
              <Input placeholder="请输入头像链接" />
            </Form.Item>
            <Form.Item
              name="tel"
              key="tel"
              label="电话"
              rules={[
                {
                  pattern: telRegexp,
                  message: "请输入符合规范的电话号码",
                },
              ]}
            >
              <Input type="number" placeholder="请输入电话号码" />
            </Form.Item>
            <Form.Item name="birthday" key="birthday" label="生日">
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="group"
              key="group"
              label="用户组"
              rules={[
                {
                  required: true,
                  message: "必须属于一个用户组",
                },
              ]}
            >
              <Select placeholder="未选择">
                <Option value={1}>管理员</Option>
                <Option value={2}>普通用户</Option>
              </Select>
            </Form.Item>
            <Form.Item name="gender" key="gender" label="性别">
              <Select placeholder="未选择">
                <Option value={0}>男</Option>
                <Option value={1}>女</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="isDelete"
              key="isDelete"
              label="是否删除"
              valuePropName="checked"
              normalize={(value) => (value ? 1 : 0)}
            >
              <Switch />
            </Form.Item>

            <div style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                修改
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserList;
