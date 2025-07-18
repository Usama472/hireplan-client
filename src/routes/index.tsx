import { Fragment } from 'react'
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

// route constant
import { appRoutes } from './routes'

// Guards
import { PrivateRoute } from './PrivateRoute'
import PublicRoute from './PublicRoute'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Fragment>
      {appRoutes?.map(({ element, isPrivate, url, id }) => {
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
      {/* <Route path='/*' element={<NotFound />} /> */}
    </Fragment>
  )
)
