import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("bidding")
export class Bidding {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    unique: true,
  })
  bidCode!: string;

  @Column()
  name!: string;

  @Column("decimal", {
    precision: 12,
    scale: 2,
  })
  pool!: number;

  @Column()
  members!: number;

  @Column()
  duration!: number;

  @Column()
  durationType!: string;

  @Column()
  upiId!: string;

  @Column("longtext", {
    nullable: true,
  })
  qrCodeImage!: string | null;

  @Column("varchar", {
    length: 255,
  })
  userId!: string;

  @CreateDateColumn({
    type: "datetime",
  })
  createdAt!: Date;
}