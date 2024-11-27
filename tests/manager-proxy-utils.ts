import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  ParameterUpdate,
  SetController
} from "../generated/ManagerProxy/ManagerProxy"

export function createParameterUpdateEvent(param: string): ParameterUpdate {
  let parameterUpdateEvent = changetype<ParameterUpdate>(newMockEvent())

  parameterUpdateEvent.parameters = new Array()

  parameterUpdateEvent.parameters.push(
    new ethereum.EventParam("param", ethereum.Value.fromString(param))
  )

  return parameterUpdateEvent
}

export function createSetControllerEvent(controller: Address): SetController {
  let setControllerEvent = changetype<SetController>(newMockEvent())

  setControllerEvent.parameters = new Array()

  setControllerEvent.parameters.push(
    new ethereum.EventParam(
      "controller",
      ethereum.Value.fromAddress(controller)
    )
  )

  return setControllerEvent
}
