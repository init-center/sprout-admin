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
  topTime: string | null;
  commentCount: number;
  [key: string]: unknown;
}

export enum Status {
  False = 0,
  True,
}

export type Post = IPost;

export type PostDetail = Post & {
  bgm: string;
  content: string;
  isCommentOpen: Status;
  updateTime: string;
  isDisplay: Status;
  deleteTime: string | null;
};

export enum ReviewStatus {
  PENDING = 0,
  RESOLVE,
  REJECT,
}

export type CommentItem = {
  cid: string;
  pid: string;
  uid: string;
  userName: string;
  avatar: string;
  content: string;
  createTime: string;
  updateTime: string;
  deleteTime: string | null;
  targetCid: string | null;
  targetUid: string | null;
  targetName: string | null;
  parentCid: string | null;
  parentUid: string | null;
  postTitle: string;
  reviewStatus: ReviewStatus;
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

export interface CommentListType {
  page: PageType;
  list: CommentItem[];
}
