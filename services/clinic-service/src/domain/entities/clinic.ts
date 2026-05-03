import {Locale} from "../enums/locale.enum";

export class Clinic {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly timezone: string,
    public readonly locale: Locale,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
