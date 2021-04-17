import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { useHistory as useRouter } from "react-router-dom";
import { ConfigItem, ConfigListType } from "../../types";
import http, { ResponseData } from "../../utils/http/http";
import { Button, Form, Input, message, Modal, Space } from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";
import md2html from "../../utils/md2html/md2html";
import mdStyles from "../../styles/mdStyle.module.scss";
import Editor, { EditorRef } from "../../components/Editor/Editor";
import { useChangeTitle } from "../../hooks/useChangeTitle";

type SearchValuesType = {
  key: string | null;
  value: string | null;
  explain: string | null;
};

const searchInitialValues: SearchValuesType = {
  key: null,
  value: null,
  explain: null,
};

const Table = TableWrapper<ConfigItem, SearchValuesType>();
const { confirm } = Modal;

const ConfigList: FC = memo(() => {
  const router = useRouter();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [configList, setConfigList] = useState<ConfigListType>({
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

  const [selectedConfig, setSelectedConfig] = useState<ConfigItem | null>(null);

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [valueModalVisible, setValueModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const editorRef = useRef<EditorRef>(null);
  const editorRef2 = useRef<EditorRef>(null);

  const getAllConfigs = useCallback<
    (
      searchValues?: SearchValuesType,
      limit?: number,
      page?: number
    ) => Promise<void>
  >(
    async (searchValues = searchInitialValues, limit = 5, page = 1) => {
      setIsTableLoading(true);
      const { key, value, explain } = searchValues;
      const queryFields = {
        key,
        value,
        explain,
      };
      try {
        const response = await http.get<ResponseData<ConfigListType>>(
          `/configs?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setConfigList({ ...response.data.data });
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

        if (statusCode === 401 || statusCode === 403) {
          router.push("/login");
        }
      }
    },
    [router]
  );

  const pageChangeHandler = useCallback(
    (page: number, pageSize?: number | undefined) => {
      pageSize = pageSize ?? 5;
      getAllConfigs(searchValues, pageSize, page);
    },
    [getAllConfigs, searchValues]
  );

  const onSearchFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAllConfigs(form);
    },
    [getAllConfigs]
  );

  const onEditConfig: Callbacks<{
    key: string;
    explain: string;
  }>["onFinish"] = useCallback(
    async (form: { key: string; explain: string }) => {
      if (!selectedConfig) {
        message.destroy();
        message.error("没有更新对象！");
        return;
      }
      const editor = editorRef2.current;
      if (!editor) {
        message.destroy();
        message.error("未能取得配置值输入框的引用！");
        setEditModalVisible(false);
        return;
      }
      const content = editor.getContent();
      const value = content[1];
      if (value.trim().length < 1) {
        message.destroy();
        message.error("配置值长度必须大于等于 1 ！");
        return;
      }
      try {
        // the key is the new key
        // and the selectedConfig.key is the old key
        const { key, explain } = form;
        const result = await http.put<ResponseData>(
          `/configs/${selectedConfig.key}`,
          {
            key,
            value,
            explain,
          }
        );
        if (result.status === 200 && result.data.code === 2000) {
          setSelectedConfig(null);
          setEditModalVisible(false);
          getAllConfigs();
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
    [selectedConfig, getAllConfigs]
  );

  const onAddConfig: Callbacks<{
    key: string;
    explain: string;
  }>["onFinish"] = useCallback(
    async (form: { key: string; explain: string }) => {
      const editor = editorRef.current;
      if (!editor) {
        message.error("未能取得配置值输入框的引用！");
        setAddModalVisible(false);
        return;
      }
      const content = editor.getContent();
      const value = content[1];
      if (value.trim().length < 1) {
        message.destroy();
        message.error("配置值长度必须大于等于 1 ！");
        return;
      }
      try {
        const { key, explain } = form;
        const result = await http.post<ResponseData>(`/configs`, {
          key,
          explain,
          value,
        });
        if (result.status === 201 && result.data.code === 2001) {
          message.destroy();
          setAddModalVisible(false);
          setSelectedConfig(null);
          getAllConfigs();
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
    [getAllConfigs]
  );

  const onDelete = useCallback(
    (config: ConfigItem) => {
      confirm({
        title: "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: "确定要删除这个配置项吗？谨慎操作，不可恢复！",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.delete<ResponseData>(
                `/configs/${config.key}`
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
              getAllConfigs();
            }
          });
        },
        onCancel() {
          return Promise.resolve();
        },
      });
    },
    [getAllConfigs]
  );

  useChangeTitle("配置列表");

  useEffect(() => {
    getAllConfigs();
  }, [getAllConfigs]);

  const columns: ColumnsType<ConfigItem> = useMemo(
    () => [
      {
        title: "配置名",
        dataIndex: "key",
        key: "key",
        align: "center",
      },
      {
        title: "配置值",
        dataIndex: "value",
        key: "value",
        align: "center",
        width: 120,
        render: (_content: string, record: ConfigItem) => (
          <Button
            type="link"
            onClick={() => {
              setSelectedConfig(record);
              setValueModalVisible(true);
            }}
          >
            点击查看
          </Button>
        ),
      },
      {
        title: "配置说明",
        dataIndex: "explain",
        key: "explain",
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
                setSelectedConfig(record);
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
        name: "key",
        label: false,
        render: () => {
          return <Input placeholder="请输入配置名" />;
        },
      },
      {
        name: "value",
        label: false,
        render: () => {
          return <Input placeholder="请输入配置值关键词" />;
        },
      },
      {
        name: "explain",
        label: false,
        render: () => {
          return <Input placeholder="请输入描述关键词" />;
        },
      },
    ],
    []
  );

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
          dataSource={configList.list}
          page={configList.page}
          scroll={{ x: 500 }}
          onPageChange={pageChangeHandler}
          isTableLoading={isTableLoading}
          searchFields={searchFields}
          onSearch={onSearchFinish}
          searchInitialValues={searchValues}
          rowKeyKey="key"
          rowKeySuffix={tableRowKeySuffix}
        />
        <Modal
          title={"编辑配置项"}
          wrapClassName="edit-modal"
          visible={editModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedConfig(null);
            setEditModalVisible(false);
          }}
        >
          <Form
            initialValues={{
              key: selectedConfig?.key,
              explain: selectedConfig?.explain,
            }}
            onFinish={onEditConfig}
          >
            <Form.Item name="key" key="key" label="配置名">
              <Input placeholder="请输入配置名称" />
            </Form.Item>
            <Form.Item name="explain" key="explain" label="配置说明">
              <Input placeholder="请输入配置说明" />
            </Form.Item>
            <Editor
              ref={editorRef2}
              showSubmitButton={false}
              content={selectedConfig?.value}
              placeholder="请输入配置值......"
            />
            <div style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                修改
              </Button>
            </div>
          </Form>
        </Modal>
        <Modal
          title={"配置值"}
          destroyOnClose
          wrapClassName="value-modal"
          visible={valueModalVisible}
          width="80%"
          footer={null}
          onCancel={() => {
            setSelectedConfig(null);
            setValueModalVisible(false);
          }}
        >
          {selectedConfig?.value ? (
            <div
              className={mdStyles["md-box"]}
              dangerouslySetInnerHTML={{
                __html: md2html(selectedConfig.value).htmlContent,
              }}
            ></div>
          ) : null}
        </Modal>

        <Modal
          title={"新增配置项"}
          wrapClassName="edit-modal"
          visible={addModalVisible}
          width="80%"
          footer={null}
          destroyOnClose
          onCancel={() => {
            setSelectedConfig(null);
            setAddModalVisible(false);
          }}
        >
          <Form
            initialValues={{
              key: "",
              explain: "",
            }}
            onFinish={onAddConfig}
          >
            <Form.Item name="key" key="key" label="配置名">
              <Input placeholder="请输入配置名称" />
            </Form.Item>
            <Form.Item name="explain" key="explain" label="配置说明">
              <Input placeholder="请输入配置说明" />
            </Form.Item>
            <Editor
              ref={editorRef}
              showSubmitButton={false}
              placeholder="请输入配置值......"
            />
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
});

export default ConfigList;
