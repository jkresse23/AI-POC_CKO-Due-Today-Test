import { Body } from "..";
import { formatCurrency } from "../../utils";
import styles from "./PaymentPlanSpotlight.module.css";
import { useMemo } from "react";

type PaymentPlanSpotlightProps = {
  installmentCount: number;
  installmentAmount: number;
  variableFirstInstallmentAmount?: number;
  promotionAmount?: number;
  installments?: { totalAmountIncludingFees: number }[];
  showDueTodayHero?: boolean;
};

export const PaymentPlanSpotlight = ({
  installmentCount,
  installmentAmount,
  variableFirstInstallmentAmount,
  promotionAmount = 0,
  installments,
  showDueTodayHero = false,
}: PaymentPlanSpotlightProps) => {
  const isPromotionAvailable =
    promotionAmount !== undefined && promotionAmount > 0;
  const originalInstallmentAmount = useMemo(() => {
    if (!isPromotionAvailable) {
      return installmentAmount;
    }
    if (installments) {
      const totalAmountAfterPromotion = installments.reduce(
        (acc, installment) => acc + installment.totalAmountIncludingFees,
        0,
      );
      const unrounded =
        (totalAmountAfterPromotion + (promotionAmount ?? 0)) / installmentCount;
      return Math.ceil(unrounded * 100) / 100;
    }
    const unrounded =
      installmentAmount + (promotionAmount ?? 0) / installmentCount;
    return Math.ceil(unrounded * 100) / 100;
  }, [
    isPromotionAvailable,
    installmentAmount,
    promotionAmount,
    installmentCount,
    installments,
  ]);

  // Variation B — Due Today Hero
  // VFI fix: use the actual first-payment amount as the hero (not the regular installment amount)
  if (showDueTodayHero && installments) {
    const dueTodayAmount = variableFirstInstallmentAmount ?? installmentAmount;
    const remainingCount = installmentCount - 1;
    const total = installments.reduce(
      (sum, i) => sum + i.totalAmountIncludingFees,
      0,
    );
    return (
      <div className={styles.container}>
        <div className={styles.dueTodayBadge}>DUE TODAY</div>
        <div className={styles.dueTodayHeroAmount}>
          {formatCurrency(dueTodayAmount)}
        </div>
        <Body size="s" variant="book">
          {`then ${remainingCount} more ${remainingCount === 1 ? "payment" : "payments"} of ${formatCurrency(installmentAmount)} · ${formatCurrency(total)} total`}
        </Body>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div>
        <Body size="s" variant="book">
          {`${installmentCount} bi-weekly payments of`}
        </Body>
      </div>
      <div className={styles.amount}>
        <Body variant="book" size="l" overrideClass={styles.dollarSign}>
          $
        </Body>
        <div className={styles.amountSection}>
          {isPromotionAvailable ? (
            <>
              <span className={styles.oldAmount} data-testid="old-amount">
                {formatCurrency(originalInstallmentAmount).slice(1)}
              </span>
              <span className={styles.newAmount} data-testid="new-amount">
                {formatCurrency(installmentAmount).slice(1)}
              </span>
              {variableFirstInstallmentAmount ? "*" : ""}
            </>
          ) : (
            <Body variant="book" overrideClass={styles.number}>
              {formatCurrency(installmentAmount).slice(1)}
              {variableFirstInstallmentAmount ? "*" : ""}
            </Body>
          )}
        </div>
      </div>
      {variableFirstInstallmentAmount && (
        <div className={styles.vfiBanner}>
          *Requires a larger first payment of{" "}
          {formatCurrency(variableFirstInstallmentAmount)}
        </div>
      )}
    </div>
  );
};
