import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import TableWrapper from "../../components/TableWrapper/TableWrapper";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { useHistory as useRouter } from "react-router-dom";
import { useImgLazyLoad } from "../../utils/lazyLoad/lazyLoad";
import { CommentItem, CommentListType, ReviewStatus } from "../../types";
import styles from "./CommentList.module.scss";
import mdStyles from "../../styles/mdStyle.module.scss";
import http, { ResponseData } from "../../utils/http/http";
import {
  Button,
  Image,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Select,
  Badge,
} from "antd";
import DatePicker from "../../components/DatePicker/DatePicker";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { formatTime } from "../../utils/formatTime";
import md2html from "../../utils/md2html";
import { SearchItem } from "../../components/TableWrapper/TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";
import Editor, { EditorRef } from "../../components/Editor/Editor";

type SearchValuesType = {
  pid: string | null;
  uid: string | null;
  isDelete: number | null;
  rangeDate: null | [Date | string | null, Date | string | null];
  reviewStatus: ReviewStatus | null;
};

const searchInitialValues: SearchValuesType = {
  pid: null,
  uid: null,
  isDelete: null,
  rangeDate: [null, null],
  reviewStatus: null,
};

const Table = TableWrapper<CommentItem, SearchValuesType>();
const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

const CommentList: FC = () => {
  const router = useRouter();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [commentList, setCommentList] = useState<CommentListType>({
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

  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(
    null
  );

  const [searchValues, setSearchValues] = useState<SearchValuesType>(
    searchInitialValues
  );

  const [contentModalVisible, setContentModalVisible] = useState<boolean>(
    false
  );

  const [replyModalVisible, setReplyModalVisible] = useState<boolean>(false);
  const editorRef = useRef<EditorRef>(null);

  const getAllComments = useCallback<
    (
      searchValues?: SearchValuesType,
      limit?: number,
      page?: number
    ) => Promise<void>
  >(
    async (searchValues = searchInitialValues, limit = 7, page = 1) => {
      setIsTableLoading(true);
      const { pid, uid, isDelete, rangeDate, reviewStatus } = searchValues;
      const queryFields = {
        pid,
        uid,
        isDelete,
        reviewStatus,
        createTimeStart: rangeDate ? formatTime(rangeDate[0]) : null,
        createTimeEnd: rangeDate ? formatTime(rangeDate[1]) : null,
      };
      try {
        const response = await http.get<ResponseData<CommentListType>>(
          `/admin/comments/posts?page=${page}&limit=${limit}`,
          {
            params: queryFields,
          }
        );
        if (response.status === 200 && response.data.code === 2000) {
          if (!response.data.data) return;
          setCommentList({ ...response.data.data });
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
      getAllComments(searchValues, pageSize, page);
    },
    [getAllComments, searchValues]
  );

  const onSearchFinish: Callbacks<SearchValuesType>["onFinish"] = useCallback(
    (form: SearchValuesType) => {
      setSearchValues(form);
      getAllComments(form);
    },
    [getAllComments]
  );

  const toggleDelete = useCallback(
    (comment: CommentItem) => {
      const deleteTime = comment.deleteTime;
      confirm({
        title: deleteTime ? "正在进行恢复操作！" : "正在进行删除操作！",
        icon: <ExclamationCircleOutlined />,
        content: deleteTime
          ? "确定要恢复这个评论吗？"
          : "确定要删除这个评论吗？非物理删除，你可以随时恢复。",
        okText: "确定",
        cancelText: "取消",
        async onOk() {
          return new Promise<void>(async (resolve, _reject) => {
            try {
              const result = await http.put<ResponseData>(
                `/admin/comments/${comment.cid}`,
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
              getAllComments();
            }
          });
        },
        onCancel() {
          return Promise.resolve();
        },
      });
    },
    [getAllComments]
  );

  const toggleReviewStatus = useCallback(
    async (comment: CommentItem, checked: boolean) => {
      try {
        const result = await http.put<ResponseData>(
          `/admin/comments/${comment.cid}`,
          {
            reviewStatus: checked ? 1 : 2,
          }
        );
        if (result.status === 200 && result.data.code === 2000) {
          message.success("修改审核状态成功！");
        }
      } catch (error) {
        const msg = error?.response?.data?.message;
        if (msg) {
          message.error(msg);
        }
      } finally {
        getAllComments();
      }
    },
    [getAllComments]
  );

  const ReplyHandler = useCallback(async () => {
    if (!selectedComment) {
      message.error("没有回复对象，请退出重试！");
      setReplyModalVisible(false);
      return;
    }
    const editor = editorRef.current;
    if (!editor) {
      message.error("未能取得内容文本输入框的引用！");
      setReplyModalVisible(false);
      return;
    }
    const content = editor.getContent();
    const replyContent = content[1];
    if (replyContent.trim().length < 1 || replyContent.trim().length > 1024) {
      message.error("回复内容长度必须大于等于 1 小于等于 1024 ！");
      return;
    }

    try {
      const response = await http.post<ResponseData>(
        `/comments/posts/${selectedComment.pid}`,
        {
          targetCid: selectedComment.cid,
          content: replyContent,
        }
      );
      if (response.status === 201 && response.data.code === 2001) {
        message.success("回复成功！");
        setReplyModalVisible(false);
        getAllComments();
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, [selectedComment, editorRef, getAllComments]);

  useEffect(() => {
    getAllComments();
  }, [getAllComments]);

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

  const columns: ColumnsType<CommentItem> = [
    {
      title: "id",
      dataIndex: "cid",
      key: "cid",
      width: 150,
      align: "center",
    },
    {
      title: "文章id",
      dataIndex: "pid",
      key: "pid",
      width: 150,
      align: "center",
    },
    {
      title: "文章标题",
      dataIndex: "postTitle",
      key: "postTitle",
      width: 150,
      align: "center",
      render: (title: string, record) => {
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
      title: "用户id",
      dataIndex: "uid",
      key: "uid",
      width: 150,
      align: "center",
    },
    {
      title: "用户名",
      dataIndex: "userName",
      key: "userName",
      align: "center",
      width: 80,
    },
    {
      title: "用户头像",
      dataIndex: "avatar",
      key: "avatar",
      align: "center",
      width: 80,
      render: (url: string) => (
        <Image src={url} placeholder={true} width={40} alt="avatar" />
      ),
    },
    {
      title: "评论内容",
      dataIndex: "content",
      key: "content",
      align: "center",
      width: 120,
      render: (_content: string, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedComment(record);
            setContentModalVisible(true);
          }}
        >
          点击查看
        </Button>
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
      title: "父级评论id",
      dataIndex: "parentCid",
      key: "parentCid",
      width: 150,
      align: "center",
      render: (parentCid: string | null) => parentCid ?? "无",
    },
    {
      title: "父级评论用户id",
      dataIndex: "parentUid",
      key: "parentUid",
      width: 150,
      align: "center",
      render: (parentUid: string | null) => parentUid ?? "无",
    },
    {
      title: "评论对象评论id",
      dataIndex: "targetCid",
      key: "targetCid",
      width: 150,
      align: "center",
      render: (targetCid: string | null) => targetCid ?? "无",
    },
    {
      title: "评论对象用户id",
      dataIndex: "targetUid",
      key: "targetUid",
      width: 150,
      align: "center",
      render: (targetUid: string | null) => targetUid ?? "无",
    },
    {
      title: "评论对象用户名",
      dataIndex: "targetName",
      key: "targetName",
      width: 150,
      align: "center",
      render: (targetName: string | null) => targetName ?? "无",
    },
    {
      title: "审核状态",
      key: "reviewStatus",
      dataIndex: "reviewStatus",
      align: "center",
      width: 100,
      render: (reviewStatus: ReviewStatus, record) => (
        <div>
          <p>
            <Badge
              status={
                reviewStatus === ReviewStatus.PENDING
                  ? "warning"
                  : reviewStatus === ReviewStatus.RESOLVE
                  ? "success"
                  : "error"
              }
            />
            {reviewStatus === ReviewStatus.PENDING
              ? "未审核"
              : reviewStatus === ReviewStatus.RESOLVE
              ? "通过"
              : reviewStatus === ReviewStatus.REJECT
              ? "未通过"
              : "未知状态"}
          </p>
          <Switch
            defaultChecked={reviewStatus === ReviewStatus.RESOLVE}
            onChange={(checked) => {
              toggleReviewStatus(record, checked);
            }}
          />
        </div>
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
              setSelectedComment(record);
              setReplyModalVisible(true);
            }}
          >
            回复
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
  ];

  const searchFields: SearchItem[] = [
    {
      name: "reviewStatus",
      label: "审核状态",
      render: () => {
        return (
          <Select style={{ width: 120 }} placeholder="未选择">
            <Option value={3}>所有</Option>
            <Option value={1}>通过</Option>
            <Option value={2}>未通过</Option>
            <Option value={0}>未审核</Option>
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
      name: "rangeDate",
      label: "创建时间",
      render: () => {
        return <RangePicker />;
      },
    },
    {
      name: "pid",
      label: false,
      render: () => {
        return <Input placeholder="请输入评论的文章id" />;
      },
    },
    {
      name: "uid",
      label: false,
      render: () => {
        return <Input placeholder="请输入评论的用户id" />;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className={styles["commentlist-box"]}>
        <Table
          columns={columns}
          dataSource={commentList.list}
          page={commentList.page}
          scroll={{ x: 1200 }}
          onPageChange={pageChangeHandler}
          isTableLoading={isTableLoading}
          searchFields={searchFields}
          onSearch={onSearchFinish}
          searchInitialValues={searchValues}
          rowKeyKey="cid"
          rowKeySuffix={tableRowKeySuffix}
        />
        <Modal
          title={"评论详情"}
          wrapClassName="content-modal"
          visible={contentModalVisible}
          width="80%"
          footer={null}
          onCancel={() => {
            setSelectedComment(null);
            setContentModalVisible(false);
          }}
        >
          {selectedComment?.content ? (
            <div
              className={mdStyles["md-box"]}
              dangerouslySetInnerHTML={{
                __html: md2html(selectedComment.content).htmlContent,
              }}
            ></div>
          ) : null}
        </Modal>
        <Modal
          title={"回复评论"}
          wrapClassName="reply-modal"
          visible={replyModalVisible}
          width="80%"
          destroyOnClose
          cancelText={"取消"}
          okText={"回复"}
          onOk={ReplyHandler}
          onCancel={() => {
            setSelectedComment(null);
            setReplyModalVisible(false);
          }}
        >
          <Editor
            ref={editorRef}
            showSubmitButton={false}
            placeholder="请输入回复内容......"
          />
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default CommentList;
