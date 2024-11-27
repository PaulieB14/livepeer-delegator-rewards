import {
  ParameterUpdate as ParameterUpdateEvent,
  SetController as SetControllerEvent,
  Bond as BondEvent,
  EarningsClaimed as EarningsClaimedEvent,
  Rebond as RebondEvent
} from "../generated/ManagerProxy/ManagerProxy"
import {
  ParameterUpdate,
  SetController,
  Bond,
  EarningsClaimed,
  Rebond
} from "../generated/schema"

export function handleParameterUpdate(event: ParameterUpdateEvent): void {
  let entity = new ParameterUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.param = event.params.param

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSetController(event: SetControllerEvent): void {
  let entity = new SetController(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.controller = event.params.controller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

// New handler for Bond event
export function handleBond(event: BondEvent): void {
  let entity = new Bond(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newDelegate = event.params.newDelegate
  entity.oldDelegate = event.params.oldDelegate
  entity.delegator = event.params.delegator
  entity.additionalAmount = event.params.additionalAmount
  entity.bondedAmount = event.params.bondedAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

// New handler for EarningsClaimed event
export function handleEarningsClaimed(event: EarningsClaimedEvent): void {
  let entity = new EarningsClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.delegate = event.params.delegate
  entity.delegator = event.params.delegator
  entity.rewards = event.params.rewards
  entity.fees = event.params.fees
  entity.startRound = event.params.startRound
  entity.endRound = event.params.endRound

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

// New handler for Rebond event
export function handleRebond(event: RebondEvent): void {
  let entity = new Rebond(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.delegate = event.params.delegate
  entity.delegator = event.params.delegator
  entity.unbondingLockId = event.params.unbondingLockId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
