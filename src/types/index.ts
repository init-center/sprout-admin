export type TagType = {
  id: number;
  name: string;
};

export type TagListType = {
  page: PageType;
  list: TagType[];
};

export type CategoryType = {
  id: number;
  name: string;
};

export type CategoryListType = {
  page: PageType;
  list: CategoryType[];
};

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
  FALSE = 0,
  TRUE,
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

export type ConfigItem = {
  key: string;
  value: string;
  explain: string;
};

export interface PageType {
  currentPage: number;
  size: number;
  count: number;
}

export interface ConfigListType {
  page: PageType;
  list: ConfigItem[];
}

export interface PostListType {
  page: PageType;
  list: PostDetail[];
}

export interface CommentListType {
  page: PageType;
  list: CommentItem[];
}

export enum Gender {
  MALE,
  FEMALE,
}

export enum UserGroup {
  ADMIN = 1,
  DEFAULT,
}

export enum BanStatus {
  UNBLOCK,
  BANED,
}

export type User = {
  uid: string;
  name: string;
  avatar: string;
  email: string;
  gender: Gender;
  tel: string;
  birthday: string;
  group: UserGroup;
  createTime: string | null;
  updateTime: string | null;
  deleteTime: string | null;
  banStartTime: string | null;
  banEndTime: string | null;
  isBaned: BanStatus;
};

export type UpdateUserType = {
  name?: string;
  avatar?: string;
  email?: string | null;
  gender?: Gender;
  tel?: string | null;
  birthday?: Date | string | null;
  group?: UserGroup;
  isDelete?: number;
};

export interface UserListType {
  page: PageType;
  list: User[];
}

export interface OpenSubMenuType {
  name: string;
  key: string;
}
export interface LocationItemType {
  name: string;
  path: string;
}

interface DayIncreaseType {
  date: string;
  increase: number;
}
export interface BaseAnalysisType {
  total: number;
  recentIncreaseList: DayIncreaseType[];
  todayIncrease: number;
}

export interface PostAnalysisType {
  total: number;
  average: number;
  monthIncrease: number;
}

export interface PostViewsItem {
  pid: string;
  title: string;
  views: number;
}

export type PostViewsRank = PostViewsItem[];

export interface CategoriesPostsCount {
  name: string;
  value: number;
}

export type TagsPostsCount = CategoriesPostsCount;

export type CategoriesPostsCountList = CategoriesPostsCount[];

export type TagsPostsCountList = TagsPostsCount[];

export interface ComplexAnalysis {
  month: string;
  views: number;
  comments: number;
  users: number;
}

export type ComplexAnalysisList = ComplexAnalysis[];
