import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { routes } from "./routes/routes";
import Loading from "./components/Loading/Loading";
import "antd/dist/antd.css";
import "./App.css";

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Switch>
          {routes.map((route) => (
            <Route
              path={route.path}
              component={route.component}
              key={route.path}
              exact
            />
          ))}
        </Switch>
      </Suspense>
    </Router>
  );
}

export default App;
