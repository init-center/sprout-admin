export interface TagType {
  id: number;
  name: string;
}

export interface CategoryType {
  id: number;
  name: string;
}

interface IPost {
  uid: string;
  pid: string;
  categoryId: number;
  categoryName: string;
  tags: TagType[];
  title: string;
  cover: string;
  summary: string;
  views: number;
  createTime: string;
  topTime: string;
  commentCount: number;
  [key: string]: unknown;
}

export type Post = IPost;

export type PostDetail = Post & {
  bgm: string;
  content: string;
  isCommentOpen: 0 | 1;
  updateTime: string;
  isDisplay: 0 | 1;
  deleteTime: string;
};

export interface PageType {
  currentPage: number;
  size: number;
  count: number;
}

export interface PostListType {
  page: PageType;
  list: PostDetail[];
}
