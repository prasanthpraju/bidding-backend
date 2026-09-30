import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Bidding } from "./bidding";

@Entity("participants")
export class Participant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  fullName!: string;

  @Column("longtext", {
    nullable: true,
  })
  photo!: string | null;

  @Column("longtext", {
    nullable: true,
  })
  idProof!: string | null;

  @Column()
  age!: number;

  @Column()
  gender!: string;

  @Column()
  phoneNumber!: string;

  @Column()
  whatsappNumber!: string;

  @Column()
  biddingId!: string;

  @ManyToOne(() => Bidding)
  @JoinColumn({
    name: "biddingId",
  })
  bidding!: Bidding;

  @Column({
    default: "Pending",
  })
  status!: string;

  @Column({
    default: false,
  })
  isWinner!: boolean;

  @CreateDateColumn({
    type: "datetime",
  })
  createdAt!: Date;
}