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

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/postlist" exact>
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
        </Switch>
      </Suspense>
    </Router>
  );
}

export default App;
