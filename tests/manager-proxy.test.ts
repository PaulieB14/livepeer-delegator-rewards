import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { ParameterUpdate } from "../generated/schema"
import { ParameterUpdate as ParameterUpdateEvent } from "../generated/ManagerProxy/ManagerProxy"
import { handleParameterUpdate } from "../src/manager-proxy"
import { createParameterUpdateEvent } from "./manager-proxy-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let param = "Example string value"
    let newParameterUpdateEvent = createParameterUpdateEvent(param)
    handleParameterUpdate(newParameterUpdateEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ParameterUpdate created and stored", () => {
    assert.entityCount("ParameterUpdate", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ParameterUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "param",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
