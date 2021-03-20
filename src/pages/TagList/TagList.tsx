import React, { FC, useCallback, useEffect, useState } from "react";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { useHistory as useRouter } from "react-router-dom";
import { TagListType, TagType } from "../../types";
import http, { ResponseData } from "../../utils/http/http";
import { Button, Form, Input, message, Modal, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";

type SearchValuesType = {
  id: string | null;
  keyword: string | null;
};

const searchInitialValues: SearchValuesType = {
  id: null,
  keyword: null,
};

const Table = TableWrapper<TagType, SearchValuesType>();
const { confirm } = Modal;

const TagList: FC = () => {
  const router = useRouter();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [tagList, setTagList] = useState<TagListType>({
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

  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  const getAllTags = useCallback<
    (
      searchValues?: SearchValuesType,
      limit?: number,
      page?: number
    ) => Promise<void>
  >(
    async (searchValues = searchInitialValues, limit = 5, page = 1) => {
      setIsTableLoading(true);
      const { id, keyword } = searchValues;
      const queryFields = {
        id,
        keyword,
      };
      try {
        const response = await http.get<ResponseData<TagListType>>(
          `/tags?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setTagList({ ...response.data.data });
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
      pageSize = pageSize ?? 5;
      getAllTags(searchValues, pageSize, page);
    },
    [getAllTags, searchValues]
  );

  const onSearchFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAllTags(form);
    },
    [getAllTags]
  );

  const onEditTag: Callbacks<{
    name: string;
  }>["onFinish"] = useCallback(
    async (form: { name: string }) => {
      if (!selectedTag) {
        message.error("没有更新对象！");
        return;
      }
      try {
        const result = await http.put<ResponseData>(
          `/tags/${selectedTag.id}`,
          form
        );
        if (result.status === 200 && result.data.code === 2000) {
          setSelectedTag(null);
          setEditModalVisible(false);
          getAllTags();
          message.success("修改成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.error(msg);
        }
      }
    },
    [selectedTag, getAllTags]
  );

  const onAddTag: Callbacks<{
    name: string;
  }>["onFinish"] = useCallback(
    async (form: { name: string }) => {
      try {
        const result = await http.post<ResponseData>(`/tags`, form);
        if (result.status === 201 && result.data.code === 2001) {
          setSelectedTag(null);
          getAllTags();
          message.success("新增成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.error(msg);
        }
      }
    },
    [getAllTags]
  );

  const onDelete = useCallback(
    (tag: TagType) => {
      confirm({
        title: "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: "确定要删除这个标签吗？谨慎操作，不可恢复！",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.delete<ResponseData>(`/tags/${tag.id}`);
              if (result.status === 200 && result.data.code === 2000) {
                message.success("删除成功！");
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
              getAllTags();
            }
          });
        },
        onCancel() {
          return Promise.resolve();
        },
      });
    },
    [getAllTags]
  );

  useEffect(() => {
    getAllTags();
  }, [getAllTags]);

  const columns: ColumnsType<TagType> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
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
              setSelectedTag(record);
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
      name: "id",
      label: false,
      render: () => {
        return <Input placeholder="请输入标签的id" />;
      },
    },
    {
      name: "keyword",
      label: false,
      render: () => {
        return <Input placeholder="请输入标签关键词" />;
      },
    },
  ];

  return (
    <AdminLayout>
      <div>
        <div>
          <h4>新增标签</h4>
          <Form
            initialValues={{
              name: "",
            }}
            onFinish={onAddTag}
          >
            <Space align="start">
              <Form.Item name="name" key="name">
                <Input placeholder="请输入标签名称" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                新增
              </Button>
            </Space>
          </Form>
        </div>
        <Table
          columns={columns}
          dataSource={tagList.list}
          page={tagList.page}
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
          title={"编辑标签"}
          wrapClassName="edit-modal"
          visible={editModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedTag(null);
            setEditModalVisible(false);
          }}
        >
          <Form
            initialValues={{
              name: selectedTag?.name,
            }}
            onFinish={onEditTag}
          >
            <Form.Item name="name" key="name" label="名称">
              <Input placeholder="请输入标签名称" />
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

export default TagList;
