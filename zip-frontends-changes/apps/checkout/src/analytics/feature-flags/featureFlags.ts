export enum FeatureFlags {
  EnableDeviceFingerprinting = "checkout-enable-device-fingerprinting",
  StepUpAuthEnabled = "checkout-enable-step-up-auth",
  WindowFeatureFlagsEnabled = "checkout-enable-window-feature-flags",
  SocureEnabled = "checkout-enable-socure",
  EnablePromotion = "enable_promotion",
  ZipRedesignSignInSignUp = "checkout-redesign-sign-in-sign-up",
  SelfServiceEnabled = "checkout-enable-self-service",
  CheckoutMakeUnavailable = "checkout-make-unavailable",
  FundingSourceServiceUnavailable = "funding_source_service_unavailable",
  UseUcccCreditPolicy = "use_uccc_credit_policy",
  PrequalFlowMakeUnavailable = "prequal_flow_make_unavailable",
  BypassRecaptcha = "cko-bypass-recaptcha",
  EnableNewGooglePlaces = "enable_new_google_places", // TODO CFU-1430: remove this once the new Google Places is fully deployed
  FingerprintCookieEnabled = "cko-fingerprint-cookie",
  CkoDueTodayTest = "CKO_Due_Today_Test",
}
