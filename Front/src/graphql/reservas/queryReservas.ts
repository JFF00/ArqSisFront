import { gql } from '@apollo/client/core'

export const LIST_RESERVATIONS = gql`
  query ListReservations {
    listReservations {
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
