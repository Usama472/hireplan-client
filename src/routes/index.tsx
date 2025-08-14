import { Fragment } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import { appRoutes } from "./routes";

import CompanyRoute from "./CompanyRoute";
import InterviewRoute from "./InterviewRoute";
import { PrivateRoute } from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Fragment>
      {appRoutes?.map(({ element, isPrivate, url, id }) => {
        // For company routes, respect the isPrivate flag
        if (url.startsWith("/company/")) {
          return (
            <Route
              key={id}
              caseSensitive
              path={url}
              element={
                isPrivate ? (
                  <CompanyRoute>{element}</CompanyRoute>
                ) : (
                  <PublicRoute>{element}</PublicRoute>
                )
              }
            />
          );
        }

        // For interview scheduling route, use InterviewRoute
        if (url.startsWith("/interview/schedule/")) {
          return (
            <Route
              key={id}
              caseSensitive
              path={url}
              element={<InterviewRoute>{element}</InterviewRoute>}
            />
          );
        }

        return (
          <Route
            key={id}
            caseSensitive
            path={url}
            element={
              isPrivate ? (
                <PrivateRoute>{element}</PrivateRoute>
              ) : (
                <PublicRoute>{element}</PublicRoute>
              )
            }
          />
        );
      })}
    </Fragment>
  )
);
