import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from "react";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import {
  Tag,
  Space,
  Button,
  Select,
  Input,
  Switch,
  Image,
  Modal,
  message,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import DatePicker from "../../components/DatePicker/DatePicker";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { ColumnsType } from "antd/es/table";
import http, { ResponseData } from "../../utils/http/http";
import { getTagColor } from "../../utils/colorPicker/colorPicker";
import md2html from "../../utils/md2html/md2html";
import { useImgLazyLoad } from "../../utils/lazyLoad/lazyLoad";
import { useHistory as useRouter } from "react-router-dom";
import { formatTime } from "../../utils/formatTime";
import { Callbacks } from "rc-field-form/lib/interface";
import {
  PostDetail,
  PostListType,
  TagType,
  CategoryType,
  Post,
  CategoryListType,
  TagListType,
} from "../../types";
import styles from "./PostList.module.scss";
import mdStyles from "../../styles/mdStyle.module.scss";
import { useChangeTitle } from "../../hooks/useChangeTitle";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const Table = TableWrapper<PostDetail, SearchValuesType>();

type SearchValuesType = {
  pid: string | null;
  category: number | null;
  tag: number | null;
  isTop: number | null;
  isDelete: number | null;
  isDisplay: number | null;
  isCommentOpen: number | null;
  rangeDate: null | [Date | string | null, Date | string | null];
  keyword: string | null;
};

const searchInitialValues: SearchValuesType = {
  pid: null,
  isDisplay: null,
  isDelete: null,
  isTop: null,
  tag: null,
  category: null,
  isCommentOpen: null,
  keyword: null,
  rangeDate: [null, null],
};

const PostList: FC = memo(() => {
  const router = useRouter();
  const [postList, setPostList] = useState<PostListType>({
    page: {
      currentPage: 1,
      size: 7,
      count: 0,
    },
    list: [],
  });

  const [allTags, setAllTags] = useState<TagType[]>([]);

  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);

  const [tableRowKeySuffix, setTableRowKeySuffix] = useState<unknown>(
    Date.now()
  );

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);

  const [topPost, setTopPost] = useState<Post | null>(null);

  const [summaryModalVisible, setSummaryModalVisible] = useState<boolean>(
    false
  );

  const [contentModalVisible, setContentModalVisible] = useState<boolean>(
    false
  );

  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);

  const getAdminPosts = useCallback<
    (
      searchValues?: SearchValuesType,
      limit?: number,
      page?: number
    ) => Promise<void>
  >(
    async (searchValues = searchInitialValues, limit = 7, page = 1) => {
      setIsTableLoading(true);
      const {
        pid,
        isDisplay,
        isDelete,
        isTop,
        tag,
        category,
        isCommentOpen,
        keyword,
        rangeDate,
      } = searchValues;
      const queryFields = {
        pid,
        isDisplay,
        isDelete,
        isTop,
        tag,
        category,
        isCommentOpen,
        keyword,
        createTimeStart: rangeDate ? formatTime(rangeDate[0]) : null,
        createTimeEnd: rangeDate ? formatTime(rangeDate[1]) : null,
      };
      try {
        const response = await http.get<ResponseData<PostListType>>(
          `/admin/posts?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setPostList({ ...response.data.data });
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

  const fetchTopPost = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<Post>>(`/top/post`);
      if (
        response.status === 200 &&
        response.data.code === 2000 &&
        response.data.data
      ) {
        setTopPost(response.data.data);
      }
    } catch {}
  }, []);

  const getAllTags = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<TagListType>>(`/tags`);
      if (response.status === 200 && response.data.code === 2000) {
        setAllTags(response.data.data?.list ?? []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const getAllCategories = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<CategoryListType>>(
        `/categories`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setAllCategories(response.data.data?.list ?? []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const toggleCommentOpen = useCallback(
    async (post: PostDetail, checked: boolean) => {
      try {
        const result = await http.put<ResponseData>(`/posts/${post.pid}`, {
          isCommentOpen: checked ? 1 : 0,
        });
        if (result.status === 200 && result.data.code === 2000) {
          message.success(checked ? "开启成功！" : "关闭成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.error(msg);
        }
      } finally {
        getAdminPosts();
      }
    },
    [getAdminPosts]
  );

  const toggleDisplay = useCallback(
    async (post: PostDetail, checked: boolean) => {
      try {
        const result = await http.put<ResponseData>(`/posts/${post.pid}`, {
          isDisplay: checked ? 1 : 0,
        });
        if (result.status === 200 && result.data.code === 2000) {
          message.success(checked ? "显示成功！" : "隐藏成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.error(msg);
        }
      } finally {
        getAdminPosts();
      }
    },
    [getAdminPosts]
  );

  const toggleDelete = useCallback(
    (post: PostDetail) => {
      const deleteTime = post.deleteTime;
      confirm({
        title: deleteTime ? "正在进行恢复操作！" : "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: deleteTime
          ? "确定要恢复这篇文章吗？"
          : "确定要删除这篇文章吗？非物理删除，你可以随时恢复。",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.put<ResponseData>(
                `/posts/${post.pid}`,
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
              getAdminPosts();
            }
          });
        },
        onCancel() {
          getAdminPosts();
          return Promise.resolve();
        },
      });
    },
    [getAdminPosts]
  );

  const toggleTop = useCallback(
    (post: PostDetail, checked: boolean) => {
      confirm({
        title: checked ? "正在置顶！" : "正在取消置顶！",
        icon: <ExclamationCircleOutlined />,
        content: !checked
          ? "确定要取消置顶这篇文章吗？当没有置顶文章时，会默认置顶第一篇文章！"
          : `确定要置顶这篇文章吗？置顶时会取消其他文章的置顶，当前置顶文章《${
              topPost?.title ?? "无"
            }》`,
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.put<ResponseData>(
                `/posts/${post.pid}`,
                {
                  isTop: checked ? 1 : 0,
                }
              );
              if (result.status === 200 && result.data.code === 2000) {
                message.success(checked ? "置顶成功！" : "取消置顶成功！");

                resolve();
              }
            } catch (error) {
              const msg = error?.response?.data?.message;
              if (msg) {
                message.error(msg);
              }
              resolve();
            } finally {
              getAdminPosts();
            }
          });
        },
        onCancel() {
          getAdminPosts();
          return Promise.resolve();
        },
      });
    },
    [getAdminPosts, topPost]
  );

  const searchFields: SearchItem[] = useMemo(
    () => [
      {
        name: "category",
        label: "分类",
        render: () => {
          return (
            <Select style={{ width: 120 }} placeholder="未选择">
              <Option value={0}>所有</Option>
              <>
                {allCategories.map((category) => (
                  <Option value={category.id} key={category.id}>
                    {category.name}
                  </Option>
                ))}
              </>
            </Select>
          );
        },
      },
      {
        name: "tag",
        label: "标签",
        render: () => {
          return (
            <Select style={{ width: 120 }} placeholder="未选择">
              <Option value={0}>所有</Option>
              <>
                {allTags.map((tag) => (
                  <Option value={tag.id} key={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </>
            </Select>
          );
        },
      },
      {
        name: "isTop",
        label: "置顶状态",
        render: () => {
          return (
            <Select style={{ width: 120 }} placeholder="未选择">
              <Option value={2}>所有</Option>
              <Option value={1}>是</Option>
              <Option value={0}>否</Option>
            </Select>
          );
        },
      },
      {
        name: "isDisplay",
        label: "显示状态",
        render: () => {
          return (
            <Select style={{ width: 120 }} placeholder="未选择">
              <Option value={2}>所有</Option>
              <Option value={1}>是</Option>
              <Option value={0}>否</Option>
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
              <Option value={1}>是</Option>
              <Option value={0}>否</Option>
            </Select>
          );
        },
      },
      {
        name: "isCommentOpen",
        label: "评论开启状态",
        render: () => {
          return (
            <Select style={{ width: 120 }} placeholder="未选择">
              <Option value={2}>所有</Option>
              <Option value={1}>是</Option>
              <Option value={0}>否</Option>
            </Select>
          );
        },
      },
      {
        name: "rangeDate",
        label: "创建时间",
        render: () => {
          return <RangePicker />;
        },
      },
      {
        name: "keyword",
        label: false,
        render: () => {
          return <Input placeholder="请输入标题或内容关键词" />;
        },
      },
    ],
    [allCategories, allTags]
  );

  const pageChangeHandler = useCallback(
    (page: number, pageSize?: number | undefined) => {
      pageSize = pageSize ?? 7;
      getAdminPosts(searchValues, pageSize, page);
    },
    [getAdminPosts, searchValues]
  );

  const columns: ColumnsType<PostDetail> = useMemo(
    () => [
      {
        title: "标题",
        dataIndex: "title",
        key: "title",
        width: 150,
        align: "center",
        fixed: "left",
        render: (title: string, record: PostDetail) => {
          return (
            <a
              href={`https://init.center/posts/${record.pid}`}
              title={title}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                width: "100%",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {title}
            </a>
          );
        },
      },
      {
        title: "分类",
        dataIndex: "categoryName",
        key: "categoryName",
        align: "center",
        width: 80,
        render: (category: string, record) => (
          <Tag color={getTagColor(record.categoryId)} key={category}>
            {category}
          </Tag>
        ),
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
        title: "浏览量",
        dataIndex: "views",
        key: "views",
        align: "center",
        width: 80,
        ellipsis: true,
      },
      {
        title: "喜欢量",
        dataIndex: "favorites",
        key: "favorites",
        align: "center",
        width: 80,
        ellipsis: true,
      },
      {
        title: "封面",
        dataIndex: "cover",
        key: "cover",
        align: "center",
        width: 120,
        render: (url: string) => (
          <Image src={url} placeholder={true} width={100} alt="cover" />
        ),
      },
      {
        title: "摘要",
        dataIndex: "summary",
        key: "summary",
        align: "center",
        width: 120,
        render: (_summary: string, record: PostDetail) => (
          <Button
            type="link"
            onClick={() => {
              setSelectedPost(record);
              setSummaryModalVisible(true);
            }}
          >
            点击查看
          </Button>
        ),
      },
      {
        title: "内容",
        dataIndex: "content",
        key: "content",
        align: "center",
        width: 120,
        render: (_content: string, record: PostDetail) => (
          <Button
            type="link"
            onClick={() => {
              setSelectedPost(record);
              setContentModalVisible(true);
            }}
          >
            点击查看
          </Button>
        ),
      },
      {
        title: "标签",
        key: "tags",
        dataIndex: "tags",
        align: "center",
        width: 200,
        render: (tags: TagType[]) => (
          <>
            {tags.map((tag) => {
              const tagName =
                tag.name.slice(0, 1).toUpperCase() + tag.name.slice(1);
              return (
                <Tag color={getTagColor(tag.id)} key={tag.id}>
                  {tagName}
                </Tag>
              );
            })}
          </>
        ),
      },
      {
        title: "背景音乐",
        dataIndex: "bgm",
        key: "bgm",
        align: "center",
        width: 340,
        render: (url: string) => (
          <audio src={url} controls style={{ outline: 0 }}>
            您的浏览器不支持 audio 标签。
          </audio>
        ),
      },
      {
        title: "显示状态",
        key: "isDisplay",
        dataIndex: "isDisplay",
        align: "center",
        width: 100,
        render: (isDisplay: number, record) => (
          <Switch
            checkedChildren="显示"
            unCheckedChildren="隐藏"
            defaultChecked={Boolean(isDisplay)}
            onChange={(checked) => {
              toggleDisplay(record, checked);
            }}
          />
        ),
      },
      {
        title: "评论开启状态",
        key: "isCommentOpen",
        dataIndex: "isCommentOpen",
        align: "center",
        width: 100,
        render: (isCommentOpen: number, record) => (
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            defaultChecked={Boolean(isCommentOpen)}
            onChange={(checked) => {
              toggleCommentOpen(record, checked);
            }}
          />
        ),
      },
      {
        title: "置顶状态",
        key: "topTime",
        dataIndex: "topTime",
        align: "center",
        width: 100,
        render: (topTime: string | null, record) => (
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            defaultChecked={Boolean(topTime)}
            onChange={(checked) => {
              toggleTop(record, checked);
            }}
          />
        ),
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
        align: "center",
        width: 140,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              key="1"
              onClick={() => {
                router.push(`/write/${record.pid}`);
              }}
            >
              编辑
            </Button>
            {record.deleteTime ? (
              <Button
                type="primary"
                size="small"
                key="2"
                onClick={() => toggleDelete(record)}
              >
                恢复
              </Button>
            ) : (
              <Button
                type="primary"
                size="small"
                key="2"
                danger
                onClick={() => toggleDelete(record)}
              >
                删除
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [router, toggleCommentOpen, toggleDelete, toggleDisplay, toggleTop]
  );

  const onFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAdminPosts(form);
    },
    [getAdminPosts]
  );

  useChangeTitle("文章列表");

  useEffect(() => {
    getAdminPosts();
    fetchTopPost();
    getAllTags();
    getAllCategories();
  }, [getAdminPosts, getAllTags, getAllCategories, fetchTopPost]);

  const [bindLazyloadTriggerEvents] = useImgLazyLoad([
    document.querySelector(".content-modal"),
  ]);

  // Use a timer to ensure that events are bound to the modal
  useEffect(() => {
    if (contentModalVisible) {
      const timer = setInterval(() => {
        const triggerWrapper = document.querySelector(".content-modal");
        if (triggerWrapper) {
          bindLazyloadTriggerEvents([triggerWrapper]);
          clearInterval(timer);
        }
      }, 200);
    }
  }, [contentModalVisible, bindLazyloadTriggerEvents]);

  return (
    <AdminLayout>
      <div className={styles["postlist-box"]}>
        <Table
          searchInitialValues={searchValues}
          searchFields={searchFields}
          onSearch={onFinish}
          columns={columns}
          scroll={{ x: 1200 }}
          dataSource={postList.list}
          page={postList.page}
          isTableLoading={isTableLoading}
          onPageChange={pageChangeHandler}
          rowKeyKey="pid"
          rowKeySuffix={tableRowKeySuffix}
        />
        <Modal
          title={"摘要详情"}
          visible={summaryModalVisible}
          destroyOnClose
          footer={null}
          onCancel={() => {
            setSelectedPost(null);
            setSummaryModalVisible(false);
          }}
        >
          {selectedPost?.summary ? selectedPost.summary : null}
        </Modal>
        <Modal
          title={"文章详情"}
          destroyOnClose
          wrapClassName="content-modal"
          visible={contentModalVisible}
          width="80%"
          footer={null}
          onCancel={() => {
            setSelectedPost(null);
            setContentModalVisible(false);
          }}
        >
          {selectedPost?.content ? (
            <div
              className={mdStyles["md-box"]}
              dangerouslySetInnerHTML={{
                __html: md2html(selectedPost.content).htmlContent,
              }}
            ></div>
          ) : null}
        </Modal>
      </div>
    </AdminLayout>
  );
});

export default PostList;
