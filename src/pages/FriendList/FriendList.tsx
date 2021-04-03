import React, { FC, useCallback, useEffect, useState } from "react";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { useHistory as useRouter } from "react-router-dom";
import { FriendItem, FriendListType } from "../../types";
import http, { ResponseData } from "../../utils/http/http";
import { Button, Form, Input, message, Modal, Space, Image } from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";

type SearchValuesType = {
  keyword: string | null;
};

const searchInitialValues: SearchValuesType = {
  keyword: null,
};

const Table = TableWrapper<FriendItem, SearchValuesType>();
const { confirm } = Modal;

const FriendList: FC = () => {
  const router = useRouter();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [friendList, setFriendList] = useState<FriendListType>({
    page: {
      currentPage: 1,
      size: 5,
      count: 0,
    },
    list: [],
  });
  const [tableRowKeySuffix, setTableRowKeySuffix] = useState<unknown>(
    Date.now()
  );

  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

  const getAllFriends = useCallback<
    (
      searchValues?: SearchValuesType,
      limit?: number,
      page?: number
    ) => Promise<void>
  >(
    async (searchValues = searchInitialValues, limit = 5, page = 1) => {
      setIsTableLoading(true);
      const { keyword } = searchValues;
      const queryFields = {
        keyword,
      };
      try {
        const response = await http.get<ResponseData<FriendListType>>(
          `/friends?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setFriendList({ ...response.data.data });
          setTableRowKeySuffix(response.data.time);
          setIsTableLoading(false);
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        const statusCode = error?.response?.status;
        if (msg) {
          message.destroy();
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
      pageSize = pageSize ?? 5;
      getAllFriends(searchValues, pageSize, page);
    },
    [getAllFriends, searchValues]
  );

  const onSearchFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAllFriends(form);
    },
    [getAllFriends]
  );

  const onEditFriend: Callbacks<{
    name: string;
    url: string;
    avatar: string;
    intro: string;
  }>["onFinish"] = useCallback(
    async (form: {
      name: string;
      url: string;
      avatar: string;
      intro: string;
    }) => {
      if (!selectedFriend) {
        message.error("没有更新对象！");
        return;
      }
      try {
        const result = await http.put<ResponseData>(
          `/friends/${selectedFriend.id}`,
          form
        );
        if (result.status === 200 && result.data.code === 2000) {
          setSelectedFriend(null);
          setEditModalVisible(false);
          getAllFriends();
          message.destroy();
          message.success("修改成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.destroy();
          message.error(msg);
        }
      }
    },
    [selectedFriend, getAllFriends]
  );

  const onAddFriend: Callbacks<{
    name: string;
    url: string;
    avatar: string;
    intro: string;
  }>["onFinish"] = useCallback(
    async (form: {
      name: string;
      url: string;
      avatar: string;
      intro: string;
    }) => {
      try {
        const result = await http.post<ResponseData>(`/friends`, form);
        if (result.status === 201 && result.data.code === 2001) {
          message.destroy();
          setAddModalVisible(false);
          setSelectedFriend(null);
          getAllFriends();
          message.destroy();
          message.success("新增成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.destroy();
          message.error(msg);
        }
      }
    },
    [getAllFriends]
  );

  const onDelete = useCallback(
    (friend: FriendItem) => {
      confirm({
        title: "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: "确定要删除这个友链吗？谨慎操作，不可恢复！",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.delete<ResponseData>(
                `/friends/${friend.id}`
              );
              if (result.status === 200 && result.data.code === 2000) {
                message.success("删除成功！");
                // resolve to close
                resolve();
              }
            } catch (error) {
              const msg = error?.response?.data?.message;
              if (msg) {
                message.destroy();
                message.error(msg);
              }
              resolve();
            } finally {
              getAllFriends();
            }
          });
        },
        onCancel() {
          return Promise.resolve();
        },
      });
    },
    [getAllFriends]
  );

  useEffect(() => {
    getAllFriends();
  }, [getAllFriends]);

  const columns: ColumnsType<FriendItem> = [
    {
      title: "友链名",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "友链地址",
      dataIndex: "url",
      key: "url",
      align: "center",
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
      title: "简介",
      dataIndex: "intro",
      key: "intro",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            key="1"
            onClick={() => {
              setSelectedFriend(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="primary"
            size="small"
            key="2"
            danger
            onClick={() => onDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const searchFields: SearchItem[] = [
    {
      name: "keyword",
      label: false,
      render: () => {
        return <Input placeholder="请输入关键词" />;
      },
    },
  ];

  return (
    <AdminLayout>
      <div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginBottom: "20px" }}
          onClick={() => setAddModalVisible(true)}
        >
          新增
        </Button>
        <Table
          columns={columns}
          dataSource={friendList.list}
          page={friendList.page}
          scroll={{ x: 500 }}
          onPageChange={pageChangeHandler}
          isTableLoading={isTableLoading}
          searchFields={searchFields}
          onSearch={onSearchFinish}
          searchInitialValues={searchValues}
          rowKeyKey="id"
          rowKeySuffix={tableRowKeySuffix}
        />
        <Modal
          title={"编辑友链"}
          wrapClassName="edit-modal"
          visible={editModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedFriend(null);
            setEditModalVisible(false);
          }}
        >
          <Form
            initialValues={{
              name: selectedFriend?.name,
              url: selectedFriend?.url,
              avatar: selectedFriend?.avatar,
              intro: selectedFriend?.intro,
            }}
            onFinish={onEditFriend}
          >
            <Form.Item name="name" key="name" label="友链名">
              <Input placeholder="请输入友链名称" />
            </Form.Item>
            <Form.Item name="url" key="url" label="友链地址">
              <Input placeholder="请输入友链地址" />
            </Form.Item>
            <Form.Item name="avatar" key="avatar" label="友链头像">
              <Input placeholder="请输入友链头像" />
            </Form.Item>
            <Form.Item name="intro" key="intro" label="友链简介">
              <Input placeholder="请输入友链简介" />
            </Form.Item>
            <div style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                修改
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          title={"新增友链"}
          wrapClassName="edit-modal"
          visible={addModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedFriend(null);
            setAddModalVisible(false);
          }}
        >
          <Form
            initialValues={{
              name: "",
              url: "",
              avatar: "",
              intro: "",
            }}
            onFinish={onAddFriend}
          >
            <Form.Item name="name" key="name" label="友链名">
              <Input placeholder="请输入友链名称" />
            </Form.Item>
            <Form.Item name="url" key="url" label="友链地址">
              <Input placeholder="请输入友链地址" />
            </Form.Item>
            <Form.Item name="avatar" key="avatar" label="友链头像">
              <Input placeholder="请输入友链头像" />
            </Form.Item>
            <Form.Item name="intro" key="intro" label="友链简介">
              <Input placeholder="请输入友链简介" />
            </Form.Item>
            <div style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                新增
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default FriendList;
