import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("bidding_round")
export class BiddingRound {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 255 })
  biddingId!: string;

  @Column()
  roundNumber!: number;

  @Column("decimal", {
    precision: 12,
    scale: 2,
    default: 0,
  })
  bidAmount!: number;

  @Column("varchar", {
    length: 255,
    nullable: true,
  })
  winnerId!: string | null;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;
}