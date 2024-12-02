import {
  ParameterUpdate as ParameterUpdateEvent,
  SetController as SetControllerEvent,
  Bond as BondEvent,
  EarningsClaimed as EarningsClaimedEvent,
  Rebond as RebondEvent,
  Unbond as UnbondEvent,
  Reward as RewardEvent,
  WithdrawFees as WithdrawFeesEvent,
  WithdrawStake as WithdrawStakeEvent,
} from "../generated/ManagerProxy/ManagerProxy";

import {
  ParameterUpdate,
  SetController,
  Bond,
  EarningsClaimed,
  Rebond,
  Delegator,
  UnbondingLock,
  Round,
  PendingEarnings,
  RoundEarnings, // Import the new entity
} from "../generated/schema";

import { BigInt, Bytes } from "@graphprotocol/graph-ts";

// Handle ParameterUpdate Event
export function handleParameterUpdate(event: ParameterUpdateEvent): void {
  let entity = new ParameterUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.param = event.params.param;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

// Handle SetController Event
export function handleSetController(event: SetControllerEvent): void {
  let entity = new SetController(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.controller = event.params.controller;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

// Handle Bond Event
export function handleBond(event: BondEvent): void {
  let delegatorId = event.params.delegator;
  let delegator = Delegator.load(delegatorId);

  // Initialize Delegator if it doesn't exist
  if (!delegator) {
    delegator = new Delegator(delegatorId);
    delegator.bondedAmount = BigInt.fromI32(0);
    delegator.fees = BigInt.fromI32(0);
    delegator.delegateAddress = event.params.newDelegate;
    delegator.delegatedAmount = BigInt.fromI32(0);
    delegator.startRound = BigInt.fromI32(0);
    delegator.lastClaimRound = BigInt.fromI32(0);
    delegator.nextUnbondingLockId = BigInt.fromI32(0);
  }

  // Update Delegator fields
  delegator.bondedAmount = event.params.bondedAmount;
  delegator.delegateAddress = event.params.newDelegate;
  delegator.save();

  // Create Bond event
  let bondEvent = new Bond(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  bondEvent.newDelegate = event.params.newDelegate;
  bondEvent.oldDelegate = event.params.oldDelegate;
  bondEvent.delegator = delegatorId;
  bondEvent.additionalAmount = event.params.additionalAmount;
  bondEvent.bondedAmount = event.params.bondedAmount;
  bondEvent.blockNumber = event.block.number;
  bondEvent.blockTimestamp = event.block.timestamp;
  bondEvent.transactionHash = event.transaction.hash;
  bondEvent.save();
}


// Handle EarningsClaimed Event
export function handleEarningsClaimed(event: EarningsClaimedEvent): void {
  let entity = new EarningsClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let delegatorId = event.params.delegator;
  let delegator = Delegator.load(delegatorId);

  // Initialize Delegator if it doesn't exist
  if (!delegator) {
    delegator = new Delegator(delegatorId);
    delegator.bondedAmount = BigInt.fromI32(0);
    delegator.fees = BigInt.fromI32(0);
    delegator.delegateAddress = event.params.delegate;
    delegator.delegatedAmount = BigInt.fromI32(0);
    delegator.startRound = event.params.startRound;
    delegator.lastClaimRound = event.params.endRound;
    delegator.nextUnbondingLockId = BigInt.fromI32(0);
  }

  entity.delegate = event.params.delegate;
  entity.delegator = delegatorId;
  entity.rewards = event.params.rewards;
  entity.fees = event.params.fees;
  entity.startRound = event.params.startRound;
  entity.endRound = event.params.endRound;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  delegator.lastClaimRound = event.params.endRound;
  delegator.save();

  // Compute rewards and fees per round
  let numRounds = event.params.endRound.minus(event.params.startRound).plus(BigInt.fromI32(1));
  let rewardsPerRound = event.params.rewards.div(numRounds);
  let feesPerRound = event.params.fees.div(numRounds);
  let remainingRewards = event.params.rewards.mod(numRounds);
  let remainingFees = event.params.fees.mod(numRounds);

  for (
    let roundNum = event.params.startRound;
    roundNum.le(event.params.endRound);
    roundNum = roundNum.plus(BigInt.fromI32(1))
  ) {
    // Load or create the Round entity
    let roundId = roundNum.toString();
    let round = Round.load(roundId);
    if (!round) {
      round = new Round(roundId);
      round.startBlock = BigInt.fromI32(0); // Populate with actual logic
      round.endBlock = BigInt.fromI32(0);   // Populate with actual logic
      round.initialized = true;
      round.totalActiveStake = BigInt.fromI32(0);
      round.blockNumber = event.block.number;
      round.blockTimestamp = event.block.timestamp;
    }
    round.save();

    // Load or create RoundEarnings
    let roundEarningsId = `${delegatorId.toHex()}-${roundNum.toString()}`;
    let roundEarnings = RoundEarnings.load(roundEarningsId);
    if (!roundEarnings) {
      roundEarnings = new RoundEarnings(roundEarningsId);
      roundEarnings.delegator = delegatorId;
      roundEarnings.round = round.id;
      roundEarnings.rewards = BigInt.fromI32(0);
      roundEarnings.fees = BigInt.fromI32(0);
    }

    // Add rewards/fees for the round
    roundEarnings.rewards = roundEarnings.rewards.plus(rewardsPerRound);
    roundEarnings.fees = roundEarnings.fees.plus(feesPerRound);

    // Add remaining rewards/fees to the last round
    if (roundNum.equals(event.params.endRound)) {
      roundEarnings.rewards = roundEarnings.rewards.plus(remainingRewards);
      roundEarnings.fees = roundEarnings.fees.plus(remainingFees);
    }

    roundEarnings.blockNumber = event.block.number;
    roundEarnings.blockTimestamp = event.block.timestamp;
    roundEarnings.save();
  }
}


// Handle Rebond Event
export function handleRebond(event: RebondEvent): void {
  let entity = new Rebond(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.delegate = event.params.delegate;
  entity.delegator = event.params.delegator;
  entity.unbondingLockId = event.params.unbondingLockId;
  entity.amount = event.params.amount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

// Handle Unbond Event
export function handleUnbond(event: UnbondEvent): void {
  let entity = new UnbondingLock(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.delegator = event.params.delegator;
  entity.amount = event.params.amount;
  entity.withdrawRound = event.params.withdrawRound;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

// Handle Reward Event
export function handleReward(event: RewardEvent): void {
  let roundId = event.block.number.toString();
  let round = Round.load(roundId);

  // Initialize Round if it doesn't exist
  if (!round) {
    round = new Round(roundId);
    round.startBlock = event.block.number; // Populate with actual data if available
    round.endBlock = BigInt.fromI32(0);    // Populate with actual data if available
    round.initialized = true;
    round.totalActiveStake = BigInt.fromI32(0);
    round.blockNumber = event.block.number;
    round.blockTimestamp = event.block.timestamp;
  }

  // Update total active stake for the round
  round.totalActiveStake = round.totalActiveStake.plus(event.params.amount);
  round.blockNumber = event.block.number;
  round.blockTimestamp = event.block.timestamp;
  round.save();
}

// Handle WithdrawFees Event
export function handleWithdrawFees(event: WithdrawFeesEvent): void {
  let delegatorId = event.params.delegator.toHex();
  let delegator = Delegator.load(Bytes.fromHexString(delegatorId));

  // Initialize Delegator if it doesn't exist
  if (!delegator) {
    delegator = new Delegator(Bytes.fromHexString(delegatorId));
    delegator.bondedAmount = BigInt.fromI32(0);
    delegator.fees = BigInt.fromI32(0);
    delegator.delegateAddress = Bytes.empty();
    delegator.delegatedAmount = BigInt.fromI32(0);
    delegator.startRound = BigInt.fromI32(0);
    delegator.lastClaimRound = BigInt.fromI32(0);
    delegator.nextUnbondingLockId = BigInt.fromI32(0);
    delegator.save();
  }

  let pendingEarnings = new PendingEarnings(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  pendingEarnings.delegator = Bytes.fromHexString(delegatorId);
  pendingEarnings.pendingStake = BigInt.fromI32(0);
  pendingEarnings.pendingFees = event.params.amount;
  pendingEarnings.round = BigInt.fromI32(0); // Or make it nullable in schema
  pendingEarnings.blockNumber = event.block.number;
  pendingEarnings.blockTimestamp = event.block.timestamp;
  pendingEarnings.save();
}

// Handle WithdrawStake Event
export function handleWithdrawStake(event: WithdrawStakeEvent): void {
  let entity = new UnbondingLock(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.delegator = event.params.delegator;
  entity.amount = event.params.amount;
  entity.withdrawRound = event.params.withdrawRound;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
