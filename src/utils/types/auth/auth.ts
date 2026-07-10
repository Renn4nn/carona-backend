import { UserSchema } from "../../schemas/user.schema"

export type JwtPayload = {
  sub: string
  login: string
  admin: boolean
}

export type AuthResponse = {
  user: UserSchema
  accessToken: string
  refreshToken: string
}

export type OAuthAuthorizeResponse = {
  code: string
  expiresIn: number
  redirectUri?: string
  state?: string
}