import { Navigate } from 'react-router-dom'
import { RootState } from '../redux'
import { UserService } from '../redux/session/reducers'
import { useSelector } from 'react-redux'

const isAdmin = (userService: UserService): boolean =>
  userService.user && userService.user.role && userService.user.role === 'admin'
    ? true
    : false

export default function ProtectedRoute(props: {
  path: string
  element?: JSX.Element
}) {
  const userService = useSelector<RootState, UserService>(
    (state) => state.session.userService
  )

  return isAdmin(userService) ? (
    props.element || <></>
  ) : (
    <Navigate
      to={{
        pathname: '/login'
      }}
    />
  )
}
