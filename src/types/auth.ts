export interface SignInData {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  alias: string
  password: string
}

export interface UserProfile {
  id: string
  email: string
  alias: string
  created_at: string
}