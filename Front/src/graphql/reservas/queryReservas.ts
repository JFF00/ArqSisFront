import { gql } from '@apollo/client/core'

export const LIST_RESERVATIONS = gql`
  query ListReservations($input: ListReservationsInput) {
    listReservations(input: $input) {
      reservations {
        id
        user_uid
        user {
          nombreCompleto
          email
        }
        status
        purpose
        room_id
        start_time
        end_time
        created_at
      }
    }
  }
`

export const GET_MY_RESERVATIONS = gql`
  query GetMyReservations($input: ListReservationsInput!) {
    listReservations(input: $input) {
      reservations {
        id
        user_uid
        status
        purpose
        room_id
        start_time
        end_time
        created_at
        rejection_reason
      }
    }
  }
`
