import { gql } from '@apollo/client/core'

export const CREATE_RESERVATION = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      id
      status
      message
    }
  }
`

export const APPROVE_RESERVATION = gql`
  mutation ApproveReservation($id: Int!) {
    approveReservation(id: $id) {
      id
      status
      message
    }
  }
`

export const REJECT_RESERVATION = gql`
  mutation RejectReservation($id: Int!, $reason: String!) {
    rejectReservation(id: $id, reason: $reason) {
      id
      status
      message
    }
  }
`
