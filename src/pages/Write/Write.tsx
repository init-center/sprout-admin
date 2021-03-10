import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import {
  Form,
  Input,
  Space,
  Button,
  Switch,
  Tag,
  Dropdown,
  Image,
  message,
} from "antd";
import { PlusOutlined, RetweetOutlined } from "@ant-design/icons";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import http, { ResponseData } from "../../utils/http/http";
import { useHistory as useRouter, useParams } from "react-router-dom";
import { getTagColor } from "../../utils/colorPicker/colorPicker";
import combineClassNames from "../../utils/combineClassNames";
import Editor, { EditorRef } from "../../components/Editor/Editor";
import stripTags from "striptags";
import { Callbacks } from "rc-field-form/lib/interface";
import {
  PostDetail,
  TagType,
  CategoryType,
  Post,
  TagListType,
  CategoryListType,
} from "../../types";
import styles from "./Write.module.scss";
import { urlRegexp } from "../../utils/constants";

interface WritePostInfo {
  categoryId: number;
  categoryName: string;
  tags: TagType[];
  title: string;
  cover: string;
  isTop: 0 | 1;
  bgm: string;
  content: string;
  isCommentOpen: 0 | 1;
  isDisplay: 0 | 1;
  isDelete: 0 | 1;
}

const Write: FC = () => {
  const router = useRouter();
  const { pid } = useParams<{ pid: string }>();
  const [form] = Form.useForm();
  const [writePostInfo, setWritePostInfo] = useState<WritePostInfo>({
    categoryId: 0,
    categoryName: "",
    tags: [],
    title: "",
    cover: "http://static.init.center/common/images/compressed/yjk6ml-min.jpg",
    isTop: 0,
    bgm:
      "http://static.init.center/common/music/%E5%88%98%E7%91%9E%E7%90%A6-%E6%9D%A5%E4%B8%8D%E5%8F%8A.mp3",
    content: "",
    isCommentOpen: 1,
    isDisplay: 1,
    isDelete: 0,
  });
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [tagDropdownVisible, setTagDropdownVisible] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [topPost, setTopPost] = useState<Post | null>(null);
  const editorRef = useRef<EditorRef>(null);

  const fetchPost = useCallback(async () => {
    if (!pid) return;
    try {
      const response = await http.get<ResponseData<PostDetail>>(
        `/admin/posts/${pid}`
      );
      if (response.status === 200 && response.data.code === 2000) {
        const post = response.data.data;
        if (!post) {
          message.error("获取文章信息错误，将跳转到新建文章页面！");
          router.push("/write");
        } else {
          const {
            categoryId,
            categoryName,
            tags,
            title,
            cover,
            topTime,
            bgm,
            content,
            isCommentOpen,
            isDisplay,
            deleteTime,
          } = post;
          const initialInfo: WritePostInfo = {
            categoryId,
            categoryName,
            tags,
            title,
            cover,
            isTop: topTime ? 1 : 0,
            bgm,
            content,
            isCommentOpen,
            isDisplay,
            isDelete: deleteTime ? 1 : 0,
          };
          setWritePostInfo(initialInfo);
          form.setFieldsValue(initialInfo);
        }
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
      router.push("/write");
    }
  }, [pid, router, form]);

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

  useEffect(() => {
    fetchPost();
    getAllTags();
    getAllCategories();
    fetchTopPost();
  }, [fetchPost, getAllTags, getAllCategories, fetchTopPost]);

  const onFinish: Callbacks["onFinish"] = async (values) => {
    const editor = editorRef.current;
    if (!editor) {
      message.error("未能取得内容文本输入框的引用！");
      return;
    }
    const [{ htmlContent }, md] = editor.getContent();
    if (md.trim().length < 2) {
      message.error("内容长度不能小于2！");
      return;
    }

    if (writePostInfo.tags.length < 1) {
      message.error("至少应该有一个标签");
      return;
    }

    if (!writePostInfo.categoryId) {
      message.error("分类不能为空!");
      return;
    }

    const summary = `${stripTags(htmlContent)
      .replace(/[\r\n]/g, " ")
      .slice(0, 98)}……`;
    const post = {
      ...values,
      summary,
      content: md,
      category: writePostInfo.categoryId,
      tags: writePostInfo.tags.map((tag) => tag.id),
    };

    try {
      if (pid) {
        const response = await http.put<ResponseData>(`/posts/${pid}`, post);
        if (response.status === 200 && response.data.code === 2000) {
          message.success("修改文章成功！");
        }
      } else {
        const response = await http.post<ResponseData>(`/posts`, post);
        if (response.status === 201 && response.data.code === 2001) {
          message.success("创建文章成功！");
        }
      }
      router.push("/postlist");
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  };

  return (
    <AdminLayout>
      <div className={styles["post-info-box"]}>
        <Form
          form={form}
          className={styles["list-filter"]}
          onFinish={onFinish}
          initialValues={writePostInfo}
        >
          <Form.Item
            name="title"
            key="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "请输入文章标题",
              },
            ]}
            style={{ width: "100%" }}
          >
            <Input
              placeholder="请输入文章标题"
              size="large"
              className={styles["title-input"]}
              onChange={(e) =>
                setWritePostInfo({
                  ...writePostInfo,
                  title: e.target.value,
                })
              }
            />
          </Form.Item>

          <div className={styles["add-tags-box"]}>
            {writePostInfo.tags.map((tag, idx) => {
              const tagName =
                tag.name.slice(0, 1).toUpperCase() + tag.name.slice(1);
              return (
                <Tag
                  className={styles.tag}
                  color={getTagColor(tag.id)}
                  key={tag.id}
                  closable
                  onClose={() => {
                    const cloneTags = [...writePostInfo.tags];
                    cloneTags.splice(idx, 1);
                    setWritePostInfo({
                      ...writePostInfo,
                      tags: cloneTags,
                    });
                  }}
                >
                  {tagName}
                </Tag>
              );
            })}
            <Dropdown
              visible={tagDropdownVisible}
              overlayStyle={{
                backgroundColor: "#fff",
                padding: "10px",
                border: "1px solid rgba(0, 0, 0, .15)",
              }}
              trigger={["click"]}
              overlay={
                <>
                  <h6 style={{ marginBottom: "10px" }}>
                    还可添加 {20 - writePostInfo.tags.length} 个标签
                  </h6>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      maxWidth: "260px",
                    }}
                  >
                    {allTags.length > 0
                      ? allTags.map((tag: TagType) => {
                          const tagName =
                            tag.name.slice(0, 1).toUpperCase() +
                            tag.name.slice(1);
                          return (
                            <Tag
                              style={{ cursor: "pointer" }}
                              color={getTagColor(tag.id)}
                              key={tag.id}
                              onClick={() => {
                                setTagDropdownVisible(false);
                                if (
                                  writePostInfo.tags.find(
                                    (item) => item.id === tag.id
                                  )
                                ) {
                                  return;
                                }

                                setWritePostInfo({
                                  ...writePostInfo,
                                  tags: [...writePostInfo.tags, tag],
                                });
                              }}
                            >
                              {tagName}
                            </Tag>
                          );
                        })
                      : "暂无标签"}
                  </div>
                </>
              }
            >
              <Tag
                className={combineClassNames(styles.tag, styles["add-btn"])}
                color="default"
                key="add-tag-btn"
                icon={<PlusOutlined />}
                onClick={() => setTagDropdownVisible(!tagDropdownVisible)}
              >
                添加标签
              </Tag>
            </Dropdown>
          </div>

          <div className={styles["add-tags-box"]}>
            {writePostInfo.categoryId ? (
              <Tag
                className={styles.tag}
                color={getTagColor(writePostInfo.categoryId)}
                key={
                  writePostInfo.categoryId < 1 && allCategories[0]
                    ? allCategories[0].id
                    : writePostInfo.categoryId
                }
              >
                {writePostInfo.categoryName.slice(0, 1).toUpperCase() +
                  writePostInfo.categoryName.slice(1)}
              </Tag>
            ) : (
              "暂未选择分类"
            )}

            <Dropdown
              visible={categoryDropdownVisible}
              overlayStyle={{
                backgroundColor: "#fff",
                padding: "10px",
                border: "1px solid rgba(0, 0, 0, .15)",
              }}
              trigger={["click"]}
              overlay={
                <>
                  <h6 style={{ marginBottom: "10px" }}>分类目录</h6>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      maxWidth: "260px",
                    }}
                  >
                    {allCategories.map((category: CategoryType) => {
                      const categoryName =
                        category.name.slice(0, 1).toUpperCase() +
                        category.name.slice(1);
                      return (
                        <Tag
                          style={{ cursor: "pointer" }}
                          color={getTagColor(category.id)}
                          key={category.id}
                          onClick={() => {
                            setCategoryDropdownVisible(false);
                            if (writePostInfo.categoryId === category.id) {
                              return;
                            }

                            setWritePostInfo({
                              ...writePostInfo,
                              categoryId: category.id,
                              categoryName: category.name,
                            });
                          }}
                        >
                          {categoryName}
                        </Tag>
                      );
                    })}
                  </div>
                </>
              }
            >
              <Tag
                className={combineClassNames(styles.tag, styles["add-btn"])}
                color="default"
                key="add-tag-btn"
                icon={<RetweetOutlined />}
                onClick={() =>
                  setCategoryDropdownVisible(!categoryDropdownVisible)
                }
              >
                更换分类
              </Tag>
            </Dropdown>
          </div>

          <Space align="start" wrap>
            <Form.Item
              name="isDisplay"
              key="isDisplay"
              label="是否显示"
              valuePropName="checked"
              normalize={(value) => (value ? 1 : 0)}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item
              name="isDelete"
              key="isDelete"
              label="是否删除"
              valuePropName="checked"
              normalize={(value) => (value ? 1 : 0)}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item
              name="isCommentOpen"
              key="isCommentOpen"
              label="是否显示评论"
              valuePropName="checked"
              normalize={(value) => (value ? 1 : 0)}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item
              name="isTop"
              key="isTop"
              label="是否置顶"
              valuePropName="checked"
              tooltip={
                <div>
                  <p>设置将会替换现有置顶文章！</p>
                  <p>
                    当前置顶文章： {topPost ? `《${topPost.title}》 .` : "无"}
                  </p>
                </div>
              }
              normalize={(value) => (value ? 1 : 0)}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Space>
          <div className={styles["cover-wrapper"]}>
            <p>封面图片链接：</p>
            <Form.Item
              name="cover"
              key="cover"
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
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="请输入封面图片链接"
                className={styles["cover-input"]}
                onChange={(e) =>
                  setWritePostInfo({
                    ...writePostInfo,
                    cover: e.target.value,
                  })
                }
              />
            </Form.Item>
            <Image
              src={writePostInfo.cover}
              width={400}
              placeholder={true}
              alt="cover"
              onError={() =>
                message.error(
                  "封面图片加载错误，请检查是否填入了无法加载的图片地址！"
                )
              }
            />
          </div>

          <div className={styles["cover-wrapper"]}>
            <p>背景音乐链接：</p>
            <Form.Item
              name="bgm"
              key="cover"
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
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="请输入背景音乐链接"
                className={styles["cover-input"]}
                onChange={(e) =>
                  setWritePostInfo({
                    ...writePostInfo,
                    bgm: e.target.value,
                  })
                }
              />
            </Form.Item>
            <audio
              src={writePostInfo.bgm}
              className={styles["bgm-audio"]}
              controls
              onError={() =>
                message.error(
                  "背景音乐加载错误， 请检查是否填入了无法加载的音乐地址！"
                )
              }
            >
              您的浏览器不支持 audio 标签。
            </audio>
          </div>

          <div className={styles["editor-wrapper"]}>
            <Editor
              ref={editorRef}
              content={writePostInfo.content}
              showSubmitButton={false}
              placeholder="请输入文章内容......"
            />
          </div>
          <div className={styles["submit-bar"]}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles["submit-button"]}
            >
              提交
            </Button>
          </div>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default Write;
