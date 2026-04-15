export class UserProfileDto {
  id!: string;
  email!: string;
  fullName!: string;
  role!: string;
  clinicId!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: UserProfileDto;
}
