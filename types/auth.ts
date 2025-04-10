export type TAuth = {
  accessToken: string;
  refreshToken: string;
};

export type TEmailDecoded = {
  accountId: string;
};

export type TInviteSignupDecoded = {
  email: string;
  brand: string;
  role: string;
};

export interface IRegisterPayload {
  email: string;
  username: string;
  role: string;
  password: string;
}
export interface IResendOtpPayload {
  email: string;
}
export interface IRegisterFormPayload extends Omit<IRegisterPayload, "role"> {
  passwordConfirmation: string;
}
