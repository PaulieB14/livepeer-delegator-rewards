import {
  ParameterUpdate as ParameterUpdateEvent,
  SetController as SetControllerEvent
} from "../generated/ManagerProxy/ManagerProxy"
import { ParameterUpdate, SetController } from "../generated/schema"

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
