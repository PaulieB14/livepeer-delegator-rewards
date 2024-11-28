# Livepeer Delegation Rewards Subgraph

## Overview

### This repository contains a subgraph for indexing data related to Livepeer's delegation rewards. It captures events such as bonding, rebonding, unbonding, and earnings claimed by delegators within the Livepeer ecosystem. The subgraph helps provide detailed information about delegation rewards, enabling better insights for stakeholders and participants.

## Features

Tracks bonding, rebonding, and unbonding events.

Captures earnings claimed by delegators.

Provides real-time access to data from the Livepeer protocol.


1. Query Delegator's Bonded Amount
This query retrieves information about the specific delegator, including the total bonded amount and the delegate they are bonded with.

```graphql

query GetDelegatorBond {
  bond(id: "0xa6f8509c623e23019f52f8e5d7776ca05641c359") {
    id
    delegator
    bondedAmount
    newDelegate
    oldDelegate
    blockNumber
    blockTimestamp
  }
}
```

2. Query Rewards Claimed by Delegator
This query fetches the rewards claimed by the specific delegator, including the amount of fees and rewards claimed, as well as the period of the claim.

```graphql

query GetDelegatorRewards {
  earningsClaimeds(where: { delegator: "0xa6f8509c623e23019f52f8e5d7776ca05641c359" }) {
    id
    delegate
    delegator
    rewards
    fees
    startRound
    endRound
    blockNumber
    blockTimestamp
    transactionHash
  }
}
```

