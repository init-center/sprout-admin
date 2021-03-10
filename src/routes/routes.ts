import { lazy, ComponentType } from "react";
import { OpenSubMenuType } from "../types";

interface Route {
  name: string;
  path: string;
  component: ComponentType;
  ParentSubMenu?: OpenSubMenuType;
}

const Home = lazy(
  () => import(/* webpackChunkName: "Home" */ "../pages/Home/Home")
);

const PostList = lazy(
  () => import(/* webpackChunkName: "PostList" */ "../pages/PostList/PostList")
);

const Login = lazy(
  () => import(/* webpackChunkName: "Login" */ "../pages/Login/Login")
);

const SignUp = lazy(
  () => import(/* webpackChunkName: "SignUp" */ "../pages/SignUp/SignUp")
);

const Write = lazy(
  () => import(/* webpackChunkName: "Write" */ "../pages/Write/Write")
);

const CommentList = lazy(
  () =>
    import(
      /* webpackChunkName: "CommentList" */ "../pages/CommentList/CommentList"
    )
);

const UserList = lazy(
  () => import(/* webpackChunkName: "UserList" */ "../pages/UserList/UserList")
);

const CategoryList = lazy(
  () =>
    import(
      /* webpackChunkName: "CategoryList" */ "../pages/CategoryList/CategoryList"
    )
);

const TagList = lazy(
  () => import(/* webpackChunkName: "TagList" */ "../pages/TagList/TagList")
);

export const routes: Route[] = [
  {
    name: "首页",
    path: "/",
    component: Home,
  },
  {
    name: "文章列表",
    path: "/posts",
    component: PostList,
    ParentSubMenu: {
      name: "文章管理",
      key: "/posts-manage",
    },
  },
  {
    name: "登录",
    path: "/login",
    component: Login,
  },
  {
    name: "注册",
    path: "/signup",
    component: SignUp,
  },
  {
    name: "写作",
    path: "/write",
    component: Write,
    ParentSubMenu: {
      name: "文章管理",
      key: "/posts-manage",
    },
  },
  {
    name: "评论列表",
    path: "/comments",
    component: CommentList,
    ParentSubMenu: {
      name: "评论管理",
      key: "/comments-manage",
    },
  },
  {
    name: "用户列表",
    path: "/users",
    component: UserList,
    ParentSubMenu: {
      name: "用户管理",
      key: "/users-manage",
    },
  },
  {
    name: "分类列表",
    path: "/categories",
    component: CategoryList,
    ParentSubMenu: {
      name: "分类管理",
      key: "/categories-manage",
    },
  },
  {
    name: "标签列表",
    path: "/tags",
    component: TagList,
    ParentSubMenu: {
      name: "标签管理",
      key: "/tags-manage",
    },
  },
];

export function getRouteInfoOfPath(path: string) {
  return routes.find((route) => route.path === path);
}

export function findSubMenuOfPath(path: string | undefined) {
  if (!path) return undefined;
  return routes.find((route) => route.path === path)?.ParentSubMenu;
}

export function findSubMenuName(key: string) {
  return routes.find((route) => route.ParentSubMenu?.key === key)?.name;
}