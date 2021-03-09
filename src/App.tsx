import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Loading from "./components/Loading/Loading";
import "antd/dist/antd.css";
import "./App.css";

const Home = lazy(
  () => import(/* webpackChunkName: "Home" */ "./pages/Home/Home")
);

const PostList = lazy(
  () => import(/* webpackChunkName: "PostList" */ "./pages/PostList/PostList")
);

const Login = lazy(
  () => import(/* webpackChunkName: "Login" */ "./pages/Login/Login")
);

const SignUp = lazy(
  () => import(/* webpackChunkName: "SignUp" */ "./pages/SignUp/SignUp")
);

const Write = lazy(
  () => import(/* webpackChunkName: "Write" */ "./pages/Write/Write")
);

const CommentList = lazy(
  () =>
    import(
      /* webpackChunkName: "CommentList" */ "./pages/CommentList/CommentList"
    )
);

const UserList = lazy(
  () => import(/* webpackChunkName: "UserList" */ "./pages/UserList/UserList")
);

const CategoryList = lazy(
  () =>
    import(
      /* webpackChunkName: "CategoryList" */ "./pages/CategoryList/CategoryList"
    )
);

const TagList = lazy(
  () => import(/* webpackChunkName: "TagList" */ "./pages/TagList/TagList")
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/posts" exact>
            <PostList />
          </Route>
          <Route path="/login" exact>
            <Login />
          </Route>
          <Route path="/signup" exact>
            <SignUp />
          </Route>
          <Route path="/write/:pid?">
            <Write />
          </Route>
          <Route path="/comments" exact>
            <CommentList />
          </Route>
          <Route path="/users" exact>
            <UserList />
          </Route>
          <Route path="/categories" exact>
            <CategoryList />
          </Route>
          <Route path="/tags" exact>
            <TagList />
          </Route>
        </Switch>
      </Suspense>
    </Router>
  );
}

export default App;
