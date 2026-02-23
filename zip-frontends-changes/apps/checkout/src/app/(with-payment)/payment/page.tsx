"use client";

import styles from "./page.module.css";
import {
  Body,
  Button,
  Card,
  DynamicTila,
  ExistingPaymentMethod,
  PaidInstallmentBanner,
  AddPaymentMethod,
  ShippingAddressComponent,
  SimpleOrderSummary,
  SkeletonLoader,
  TermsAndConditionsModal,
  PaydayLendingConsentModal,
  PromoDisclaimerBanner,
  StatusToast,
  HandsAnimation,
  TruthInLendingModal,
} from "zip-components/src/v2";
import { SinglePaymentPlan } from "./_components/SinglePaymentPlan";
import { MultiplePaymentPlans } from "./_components/MultiplePaymentPlans";
import {
  SelectExistingShippingAddressRoute,
  SelectPaymentMethodRoute,
} from "../../routes";
import { usePaymentProcessor } from "payment-wrapper";
import { usePayment } from "./_hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEventBus } from "@/analytics";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { selectMerchantDisplayName } from "@/redux/merchantSlice";
import { selectDiscountAmount } from "@/redux/promotionSlice";
import { PaymentProcessorType } from "services/src/v3";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { approvalToastShown } from "@/redux/applicationSlice";
import {
  selectHasShownApprovalToast,
  selectIsPrequalificationFlow,
  selectOptimizelyExperiment,
  selectPayIn2Experiment,
  selectPayIn8Experiment,
} from "@/redux/applicationSlice/selectors";
import {
  selectCustomerFirstName,
  selectWasCustomerCreated,
  selectCustomer,
} from "@/redux/customerSlice/selectors";
import {
  ExperimentId,
  useOptimizelyExperiments,
} from "@/app/_libs/useOptimizelyExperiments";
import { useFeatureFlags, FeatureFlags } from "@/analytics/feature-flags";
import {
  selectFilteredPaymentPlans,
  selectSelectedPaymentPlanId,
} from "@/redux/paymentSlice/selectors";
import { arePaymentPlansValidForClickToTila } from "@/utils/checkArePaymentPlansValidForClickToTila";
import { useAccessToken } from "@/hooks";
import {
  AccessTokenKey,
  getPropertyFromAccessToken,
} from "@/utils/getPropertyFromAccessToken";

export default function Payment() {
  const router = useRouter();
  const eventBus = useEventBus();
  const {
    isSubmitting,
    paymentError,
    setPaymentError,
    containerRef,
    numberOfPaymentPlans,
    orderSummary,
    selectedFundingSource,
    selectedShippingAddress,
    isEligibleToUseCreditCard,
    installmentBanner,
    handleCompleteCheckout,
    tilaFields,
    isComplianceLoading,
    shouldReturnToMerchant,
    isSelectedAddressRestricted,
    isPoBox,
    modalControls,
    handleContinueOnModal,
  } = usePayment(eventBus);

  // Get the unified payment provider
  const { CardElement, currentProcessorType } = usePaymentProcessor();

  const merchantName = useAppSelector(selectMerchantDisplayName);
  const discountAmount = useAppSelector(selectDiscountAmount);
  const hasValidPromotion = discountAmount !== undefined && discountAmount > 0;
  const firstName = useAppSelector(selectCustomerFirstName);
  const wasCustomerCreated = useAppSelector(selectWasCustomerCreated);
  const hasShownApprovalToast = useAppSelector(selectHasShownApprovalToast);
  const isPrequalificationFlow = useAppSelector(selectIsPrequalificationFlow);
  const paymentPlans = useAppSelector(selectFilteredPaymentPlans);
  const selectedPaymentPlanId = useAppSelector(selectSelectedPaymentPlanId);
  const selectedPaymentPlan = paymentPlans.byId[selectedPaymentPlanId];

  // Only fire tila shown event once
  const [hasShownTilaEventBeenFired, setHasShownTilaEventBeenFired] =
    useState(false);

  // Get Optimizely experiment variation for toast display
  const toastExperimentVariation = useAppSelector(
    selectOptimizelyExperiment("display_toast_message_popup"),
  );

  const clickToTilaVariation = useAppSelector(
    selectOptimizelyExperiment(ExperimentId.ClickToTila),
  );

  const payIn2ExperimentVariation = useAppSelector(selectPayIn2Experiment);
  const payIn8ExperimentVariation = useAppSelector(selectPayIn8Experiment);

  const customer = useAppSelector(selectCustomer);
  const optimizelyExperiments = useOptimizelyExperiments();
  const accessToken = useAccessToken();

  const { isFeatureFlagEnabled } = useFeatureFlags();
  // Local dev override: run `localStorage.setItem("CKO_Due_Today_Test", "on")` in browser
  // devtools to preview the variation. Remove it to fall back to the Optimizely flag value.
  const isDueTodayEnabled = useMemo(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("CKO_Due_Today_Test") === "on"
    ) {
      return true;
    }
    return isFeatureFlagEnabled(FeatureFlags.CkoDueTodayTest);
  }, [isFeatureFlagEnabled]);

  // Ref to ensure Click-to-TILA experiment is only called once
  const hasCalledClickToTilaExperiment = useRef(false);

  // Call Click-to-TILA experiment when customer data is loaded
  useEffect(() => {
    const callClickToTilaExperiment = async () => {
      // Only call if we haven't called it yet, don't have a variation, and customer data is loaded.
      // Mutually exclusive with the Due Today test — skip ClickToTila bucketing for Due Today users
      // so that TILA always renders inline when the Due Today hero is shown.
      if (
        hasCalledClickToTilaExperiment.current ||
        clickToTilaVariation !== undefined ||
        !customer?.address?.state ||
        isDueTodayEnabled
      ) {
        return;
      }

      // Check if payment plans are valid for click to tila
      const plansArray = paymentPlans.allIds.map((id) => paymentPlans.byId[id]);
      const isEligible = arePaymentPlansValidForClickToTila(plansArray, {
        isPayIn2Used: payIn2ExperimentVariation as string,
        isPayIn8Used: payIn8ExperimentVariation as string,
      });

      if (!isEligible) {
        return;
      }

      // Mark as called to prevent duplicate calls
      hasCalledClickToTilaExperiment.current = true;

      try {
        const customerId =
          getPropertyFromAccessToken(accessToken, AccessTokenKey.CUSTOMERID) ||
          undefined;

        await optimizelyExperiments.getOptimizelyExperimentAndStore(
          ExperimentId.ClickToTila,
          customerId,
        );
      } catch {
        eventBus.publishExperimentDecisionError(ExperimentId.ClickToTila);
      }
    };

    callClickToTilaExperiment();
  }, [
    clickToTilaVariation,
    customer?.address?.state,
    paymentPlans,
    payIn2ExperimentVariation,
    payIn8ExperimentVariation,
    optimizelyExperiments,
    accessToken,
    eventBus,
    isDueTodayEnabled,
  ]);

  // If experiment is enabled and the selected payment plan is valid, enable click to tila
  const isClickToTilaEnabled = useMemo(() => {
    const isValidPaymentPlanSelected =
      !!selectedPaymentPlan && selectedPaymentPlan.installmentCount <= 4;
    return (
      clickToTilaVariation === "click_to_tila" && isValidPaymentPlanSelected
    );
  }, [clickToTilaVariation, selectedPaymentPlan]);

  // Once compliance is done loading, fire the tila shown event if we aren't doing click to tila
  useEffect(() => {
    if (
      !isComplianceLoading &&
      !isClickToTilaEnabled &&
      !hasShownTilaEventBeenFired &&
      !!tilaFields?.dueToday // using dueToday as a proxy for the TILA data being properly loaded
    ) {
      eventBus.publishTilaShown(tilaFields);
      setHasShownTilaEventBeenFired(true);
    }
  }, [
    isComplianceLoading,
    isClickToTilaEnabled,
    hasShownTilaEventBeenFired,
    eventBus,
    tilaFields,
  ]);

  const dispatch = useAppDispatch();
  const [isComplete, setIsComplete] = useState(false);
  const [showApprovalToast, setShowApprovalToast] = useState(false);

  // Memoize the dismiss handler to prevent timer resets on re-renders
  const handleDismissToast = useCallback(() => {
    setShowApprovalToast(false);
  }, []);

  const scrollToPaymentMethod = useCallback(() => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [containerRef]);

  useEffect(() => {
    // Show approval toast only for new customers, only once per session, and ONLY in Checkout flow (NOT PQM)
    // The experiment variation must be "Display Popup" to show the toast
    const shouldShowToast =
      wasCustomerCreated &&
      !hasShownApprovalToast &&
      toastExperimentVariation === "display_popup" &&
      !isPrequalificationFlow;

    if (shouldShowToast) {
      setShowApprovalToast(true);
      dispatch(approvalToastShown());
    }
  }, [
    wasCustomerCreated,
    hasShownApprovalToast,
    toastExperimentVariation,
    isPrequalificationFlow,
    dispatch,
  ]);

  if (numberOfPaymentPlans === 0) {
    return (
      <>
        <SkeletonLoader height={150} marginBottom={16} />
        <SkeletonLoader height={285} marginBottom={16} />
        <SkeletonLoader height={80} marginBottom={16} />
        <SkeletonLoader height={50} marginBottom={16} />
      </>
    );
  }

  const submitButtonText = shouldReturnToMerchant
    ? "Agree and continue"
    : "Agree and confirm payment";

  return (
    <div>
      <StatusToast
        isOpen={showApprovalToast}
        icon={<HandsAnimation />}
        title="Welcome to Zip"
        subtitle="You're approved to use Zip for this purchase!"
        userName={firstName}
        onDismiss={handleDismissToast}
      />
      {installmentBanner && (
        <PaidInstallmentBanner content={installmentBanner} />
      )}
      {hasValidPromotion && (
        <PromoDisclaimerBanner merchantName={merchantName} />
      )}
      {numberOfPaymentPlans === 1 ? (
        <SinglePaymentPlan showDueTodayHero={isDueTodayEnabled} />
      ) : (
        <MultiplePaymentPlans
          disabled={isSubmitting}
          onChange={() => setPaymentError("")}
        />
      )}

      {isComplianceLoading ? (
        <SkeletonLoader height={300} marginBottom={16}></SkeletonLoader>
      ) : (
        <SimpleOrderSummary
          {...orderSummary}
          eventOnClickedFinanceTooltip={() =>
            eventBus.publishClickedFinanceTooltip()
          }
          eventOnExpandedAccordion={() => eventBus.publishExpandOrderTotal()}
        />
      )}

      {selectedShippingAddress && (
        <ShippingAddressComponent
          shippingAddress={selectedShippingAddress}
          isSelectedAddressRestricted={isSelectedAddressRestricted}
          isPoBox={isPoBox}
          onNavigate={() => router.push(SelectExistingShippingAddressRoute)}
        />
      )}

      {selectedFundingSource ? (
        <Link
          href={SelectPaymentMethodRoute}
          onClick={() => eventBus.publishViewSavedCards()}
        >
          <ExistingPaymentMethod
            brand={selectedFundingSource.cardDetails?.brand ?? ""}
            type={selectedFundingSource.cardDetails?.fundingType ?? ""}
            lastDigits={selectedFundingSource.cardDetails?.lastFour ?? ""}
          ></ExistingPaymentMethod>
        </Link>
      ) : (
        <Card shouldRemovePadding>
          <AddPaymentMethod
            isEligibleToUseCreditCard={isEligibleToUseCreditCard}
            paymentError={paymentError}
            setPaymentError={setPaymentError}
            PaymentComponent={CardElement}
            ref={containerRef}
            eventOnClickedPaymentMethodTooltip={() =>
              eventBus.publishClickedPaymentMethodTooltip()
            }
            onFocus={() => {
              eventBus.publishPaymentMethodFocused(
                currentProcessorType ?? PaymentProcessorType.none,
              );
            }}
            disabled={isSubmitting}
            onComplete={setIsComplete}
          />
        </Card>
      )}

      {/* Only show the Tila on-page if click to Tila is not enabled */}
      {isComplianceLoading && !isClickToTilaEnabled ? (
        <SkeletonLoader height={300} marginBottom={16}></SkeletonLoader>
      ) : !isClickToTilaEnabled ? (
        <div id="tila">
          <style jsx global>{`
            html {
              scroll-behavior: smooth;
            }
          `}</style>
          <DynamicTila tilaFields={tilaFields}></DynamicTila>
        </div>
      ) : (
        <></>
      )}

      <div style={{ lineHeight: "16px" }}>
        <Body size="s" variant="book" overrideClass={styles.inline}>
          By tapping “{submitButtonText}”, I acknowledge I have read the{" "}
          {!isClickToTilaEnabled ? (
            // Show the Tila "scroll-to-tila-on-page" link if click to Tila is not enabled
            <a className={styles.link} href="#tila">
              Truth in Lending Disclosure
            </a>
          ) : !isComplianceLoading ? (
            // Show the Tila modal button if click to Tila is enabled
            <TruthInLendingModal
              eventOnViewedTila={() => {
                eventBus.publishTilaShown(tilaFields);
              }}
              tilaFields={tilaFields}
            />
          ) : (
            "Truth in Lending Disclosure" // Show plain text if TILA isn't loaded yet
          )}{" "}
          and I grant Zip full authorization to charge my debit or credit card
          on or after the payment due dates shown above. This authorization is
          subject to our{" "}
        </Body>
        <TermsAndConditionsModal
          shouldShowRefundReturnPolicy={true}
          eventOnViewedTerms={() => eventBus.publishViewedTerms("Payment")}
        />
        .
      </div>

      <div className={styles.buttonWrapper}>
        {/* Overlay to capture clicks when button is disabled due to payment form issues */}
        {!selectedFundingSource && (!isComplete || paymentError) && (
          <button
            type="button"
            aria-label="Complete payment form to continue"
            className={styles.disabledButtonOverlay}
            onClick={scrollToPaymentMethod}
          />
        )}
        <Button
          text={submitButtonText}
          overrideClass={styles.paymentButton}
          onClick={() => {
            handleCompleteCheckout(false);
          }}
          loading={isSubmitting}
          disabled={
            isSubmitting ||
            isComplianceLoading ||
            isSelectedAddressRestricted ||
            (!isComplete && !selectedFundingSource)
          }
        ></Button>
      </div>

      <PaydayLendingConsentModal
        modalControls={modalControls}
        handleContinue={handleContinueOnModal}
      />
    </div>
  );
}
