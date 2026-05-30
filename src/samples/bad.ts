import { DataSource } from "typeorm";

// 触发全部 6 条规则的示例（仅用于 lint 验证）
async function violations(
  dataSource: DataSource,
  orderRepo: any,
  itemRepo: any,
  userId: number,
  status: string,
) {
  // 1. SELECT * 等价：findAndCount 默认返回全字段
  const list = await orderRepo.findAndCount({ where: { userId } });

  // 2. getMany()[0] 取单条，应改 findOne
  const one = (await orderRepo.createQueryBuilder("o").where("o.id = :id", { id: 1 }).getMany())[0];

  // 3. 字符串拼接 SQL，注入风险
  const rows = await dataSource.query(`SELECT * FROM orders WHERE status = '${status}'`);

  // 4. 深分页大 skip
  const page = await orderRepo.find({ skip: 100000, take: 10 });

  // 5. N+1：循环体内逐条查库
  const orders = await orderRepo.find({ where: { userId } });
  for (const o of orders) {
    o.items = await itemRepo.find({ where: { orderId: o.id } });
  }

  // 6. JOIN 过多（4 表）
  const r = await orderRepo.createQueryBuilder("o")
    .leftJoinAndSelect("o.user", "u")
    .leftJoinAndSelect("u.profile", "p")
    .leftJoinAndSelect("o.items", "i")
    .leftJoinAndSelect("i.product", "pr")
    .getMany();
}
