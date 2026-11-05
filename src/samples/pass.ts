import { DataSource, In } from "typeorm";

// 合规写法：不应触发 typeorm-rule 插件的任何 error/warn
async function clean(
  dataSource: DataSource,
  orderRepo: any,
  itemRepo: any,
  userId: number,
  lastId: number,
  status: string,
) {
  // 显式列（替代 SELECT *）
  const list = await orderRepo.createQueryBuilder("o")
    .select(["o.id", "o.amount", "o.status"])
    .where("o.userId = :uid", { uid: userId })
    .getMany();

  // 取单条用 findOne（自动 LIMIT 1） typeorm 的`findOne` 内部固定`take: 1` ，生成 SQL 自带 LIMIT 1；`exists` 同样带 LIMIT 1

  const one = await orderRepo.findOne({ where: { id: 1 } });

  // 参数化查询
  const rows = await dataSource.query("SELECT id, status FROM orders WHERE status = ?", [status]);

  // 游标分页替代深分页
  const page = await orderRepo.createQueryBuilder("o")
    .where("o.userId = :uid", { uid: userId })
    .andWhere("o.id < :lastId", { lastId })
    .orderBy("o.id", "DESC")
    .limit(10)
    .getMany();

  // 批量 IN 替代 N+1
  const orders = await orderRepo.find({ where: { userId } });
  const ids = orders.map((o: any) => o.id);
  const items = await itemRepo.find({ where: { orderId: In(ids) } });

  // 合理 JOIN（≤3 表）
  const r = await orderRepo.createQueryBuilder("o")
    .leftJoinAndSelect("o.user", "u")
    .leftJoinAndSelect("o.items", "i")
    .getMany();
}
