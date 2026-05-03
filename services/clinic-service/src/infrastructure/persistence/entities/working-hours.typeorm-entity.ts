import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
  Index,
} from "typeorm";
import {ClinicTypeOrmEntity} from "./clinic.typeorm-entity";

@Entity("working_hours")
@Unique(["clinic_id", "day_of_week"])
@Index("idx_working_hours_clinic", ["clinic_id"])
export class WorkingHoursTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({name: "clinic_id"})
  clinic_id!: string;

  @Column({name: "day_of_week", type: "tinyint"})
  day_of_week!: number;

  @Column({name: "open_time", type: "time", nullable: true})
  open_time!: string | null;

  @Column({name: "close_time", type: "time", nullable: true})
  close_time!: string | null;

  @Column({name: "is_closed", default: false})
  is_closed!: boolean;

  @ManyToOne(() => ClinicTypeOrmEntity, {onDelete: "CASCADE"})
  @JoinColumn({name: "clinic_id"})
  clinic!: ClinicTypeOrmEntity;
}
