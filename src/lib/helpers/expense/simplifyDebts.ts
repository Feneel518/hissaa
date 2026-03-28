export type Debt = {
  from: { id: string; name: string | null; image: string | null };
  to: { id: string; name: string | null; image: string | null };
  amount: number;
};

export function simplifyDebts(debts: Debt[]) {
  const balanceMap: Record<string, { user: Debt["from"]; net: number }> = {};

  const ensureUser = (user: Debt["from"]) => {
    if (!balanceMap[user.id]) {
      balanceMap[user.id] = { user, net: 0 };
    }
  };

  for (const debt of debts) {
    ensureUser(debt.from);
    ensureUser(debt.to);

    balanceMap[debt.from.id].net -= debt.amount;
    balanceMap[debt.to.id].net += debt.amount;
  }

  const debtors = Object.values(balanceMap)
    .filter((u) => u.net < -0.01)
    .map((u) => ({
      user: u.user,
      amount: Math.abs(Number(u.net.toFixed(2))),
    }));

  const creditors = Object.values(balanceMap)
    .filter((u) => u.net > 0.01)
    .map((u) => ({
      user: u.user,
      amount: Number(u.net.toFixed(2)),
    }));

  const simplified: Debt[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Number(
      Math.min(debtor.amount, creditor.amount).toFixed(2),
    );

    if (settledAmount > 0.01) {
      simplified.push({
        from: debtor.user,
        to: creditor.user,
        amount: settledAmount,
      });

      debtor.amount = Number((debtor.amount - settledAmount).toFixed(2));
      creditor.amount = Number((creditor.amount - settledAmount).toFixed(2));
    }

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return simplified;
}
