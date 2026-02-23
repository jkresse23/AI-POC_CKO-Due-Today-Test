import styles from "./MultiplePaymentPlans.module.css";
import {
  AccordionItem,
  AddOnComponent,
  Card,
  PayInNInstallmentGraphic,
  PaymentPlanSpotlight,
} from "zip-components/src/v2";
import { useAppSelector } from "@/hooks";
import { selectFirstPaymentPlan } from "@/redux/paymentSlice";
import { selectDiscountAmount } from "@/redux/promotionSlice";
import { useMemo } from "react";
import { useEventBus } from "@/analytics";
import { selectAddOns } from "@/redux/orderSlice";

type SinglePaymentPlanProps = {
  showDueTodayHero?: boolean;
};

export const SinglePaymentPlan = ({ showDueTodayHero }: SinglePaymentPlanProps) => {
  const { installments, installmentCount, downPaymentAmount } = useAppSelector(
    selectFirstPaymentPlan,
  );
  const discountAmount = useAppSelector(selectDiscountAmount);
  const addOns = useAppSelector(selectAddOns);
  const eventBus = useEventBus();

  const isVfi = downPaymentAmount !== undefined && downPaymentAmount > 0;

  const variableFirstInstallmentAmount = isVfi
    ? installments[0].totalAmountIncludingFees
    : undefined;

  const installmentAmount = useMemo(() => {
    const installmentStartIndex = isVfi ? 1 : 0;
    let maxInstallmentAmount = 0;

    installments
      .slice(installmentStartIndex, installmentCount)
      .forEach((installment) => {
        if (installment.totalAmountIncludingFees > maxInstallmentAmount) {
          maxInstallmentAmount = installment.totalAmountIncludingFees;
        }
      });

    return maxInstallmentAmount;
  }, [installments, installmentCount, isVfi]);

  return (
    <Card shouldRemovePadding>
      <AccordionItem
        eventOnToggle={() => eventBus.publishExpandPaymentPlan()}
        description="Payment plan summary"
        shouldStartHidden={false}
        shouldShiftIconUp={true}
        visibleComponent={
          <div className={styles.visible}>
            <PaymentPlanSpotlight
              installmentCount={installmentCount}
              installmentAmount={installmentAmount}
              variableFirstInstallmentAmount={variableFirstInstallmentAmount}
              promotionAmount={discountAmount}
              installments={installments}
              showDueTodayHero={showDueTodayHero}
            ></PaymentPlanSpotlight>
          </div>
        }
        hiddenComponent={
          <div className={styles.hidden}>
            <PayInNInstallmentGraphic
              installments={installments}
            ></PayInNInstallmentGraphic>
          </div>
        }
      ></AccordionItem>
      <AddOnComponent items={addOns} />
    </Card>
  );
};
