import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { useHistory as useRouter } from "react-router-dom";
import { CategoryListType, CategoryType } from "../../types";
import http, { ResponseData } from "../../utils/http/http";
import { Button, Form, Input, message, Modal, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";
import { useChangeTitle } from "../../hooks/useChangeTitle";

type SearchValuesType = {
  id: string | null;
  keyword: string | null;
};

const searchInitialValues: SearchValuesType = {
  id: null,
  keyword: null,
};

const Table = TableWrapper<CategoryType, SearchValuesType>();
const { confirm } = Modal;

const CategoryList: FC = memo(() => {
  const router = useRouter();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [categoryList, setCategoryList] = useState<CategoryListType>({
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

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  const getAllCategories = useCallback<
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
        const response = await http.get<ResponseData<CategoryListType>>(
          `/categories?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setCategoryList({ ...response.data.data });
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
      getAllCategories(searchValues, pageSize, page);
    },
    [getAllCategories, searchValues]
  );

  const onSearchFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAllCategories(form);
    },
    [getAllCategories]
  );

  const onEditCategory: Callbacks<{
    name: string;
  }>["onFinish"] = useCallback(
    async (form: { name: string }) => {
      if (!selectedCategory) {
        message.destroy();
        message.error("没有更新对象！");
        return;
      }
      try {
        const result = await http.put<ResponseData>(
          `/categories/${selectedCategory.id}`,
          form
        );
        if (result.status === 200 && result.data.code === 2000) {
          setSelectedCategory(null);
          setEditModalVisible(false);
          getAllCategories();
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
    [selectedCategory, getAllCategories]
  );

  const onAddCategory: Callbacks<{
    name: string;
  }>["onFinish"] = useCallback(
    async (form: { name: string }) => {
      try {
        const result = await http.post<ResponseData>(`/categories`, form);
        if (result.status === 201 && result.data.code === 2001) {
          setSelectedCategory(null);
          getAllCategories();
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
    [getAllCategories]
  );

  const onDelete = useCallback(
    (category: CategoryType) => {
      confirm({
        title: "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: "确定要删除这个分类吗？谨慎操作，不可恢复！",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.delete<ResponseData>(
                `/categories/${category.id}`
              );
              if (result.status === 200 && result.data.code === 2000) {
                message.destroy();
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
              getAllCategories();
            }
          });
        },
        onCancel() {
          return Promise.resolve();
        },
      });
    },
    [getAllCategories]
  );

  useChangeTitle("分类列表");

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const columns: ColumnsType<CategoryType> = useMemo(
    () => [
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
                setSelectedCategory(record);
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
    ],
    [onDelete]
  );

  const searchFields: SearchItem[] = useMemo(
    () => [
      {
        name: "id",
        label: false,
        render: () => {
          return <Input placeholder="请输入分类的id" />;
        },
      },
      {
        name: "keyword",
        label: false,
        render: () => {
          return <Input placeholder="请输入分类关键词" />;
        },
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div>
        <div>
          <h4>新增分类</h4>
          <Form
            initialValues={{
              name: "",
            }}
            onFinish={onAddCategory}
          >
            <Space align="start">
              <Form.Item name="name" key="name">
                <Input placeholder="请输入分类名称" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                新增
              </Button>
            </Space>
          </Form>
        </div>
        <Table
          columns={columns}
          dataSource={categoryList.list}
          page={categoryList.page}
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
          title={"编辑分类"}
          wrapClassName="edit-modal"
          visible={editModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedCategory(null);
            setEditModalVisible(false);
          }}
        >
          <Form
            initialValues={{
              name: selectedCategory?.name,
            }}
            onFinish={onEditCategory}
          >
            <Form.Item name="name" key="name" label="名称">
              <Input placeholder="请输入分类名称" />
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
});

export default CategoryList;
