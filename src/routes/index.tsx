import { Fragment } from 'react'
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

import { appRoutes } from './routes'

import CompanyRoute from './CompanyRoute'
import { PrivateRoute } from './PrivateRoute'
import PublicRoute from './PublicRoute'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Fragment>
      {appRoutes?.map(({ element, isPrivate, url, id }) => {
        // For company routes, respect the isPrivate flag
        if (url.startsWith('/company/')) {
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
          )
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
        )
      })}
    </Fragment>
  )
)
