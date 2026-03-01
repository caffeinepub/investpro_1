import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Authorization component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
  };

  public type InvestmentPlan = {
    id : Nat;
    name : Text;
    amount : Nat;
    dailyReturn : Nat;
    duration : Nat;
  };

  public type UserInvestment = {
    planId : Nat;
    amountInvested : Nat;
    dailyReturn : Nat;
    startTime : Time.Time;
    lastClaimTime : Time.Time;
    daysCompleted : Nat;
    totalEarned : Nat;
    isExpired : Bool;
  };

  public type BankProfile = {
    accountNumber : Text;
    holderName : Text;
    ifscCode : Text;
    isLinked : Bool;
  };

  public type TransactionLog = {
    txType : Text;
    amount : Nat;
    description : Text;
    timestamp : Time.Time;
    status : Text;
  };

  public type WithdrawalRequest = {
    id : Nat;
    userId : Text;
    amount : Nat;
    status : Text;
    timestamp : Time.Time;
  };

  public type UserDashboard = {
    totalBalance : Nat;
    activeInvestments : Nat;
    totalInvested : Nat;
    totalWithdrawn : Nat;
    totalROIEarned : Nat;
  };

  public type StripeDepositRequest = {
    sessionId : Text;
    userId : Text;
    amount : Nat;
    status : Text;
    timestamp : Time.Time;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let plans = Map.empty<Nat, InvestmentPlan>();
  let userWallets = Map.empty<Text, Nat>();
  let userInvestments = Map.empty<Text, List.List<UserInvestment>>();
  let bankProfiles = Map.empty<Text, BankProfile>();
  let transactionLogs = Map.empty<Text, List.List<TransactionLog>>();
  let withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
  let stripeDepositRequests = Map.empty<Text, StripeDepositRequest>();

  var nextWithdrawalId = 1;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Transform function required for Stripe HTTP outcalls
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Additional business logic would go here...
};
