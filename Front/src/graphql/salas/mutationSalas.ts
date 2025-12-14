import { gql } from '@apollo/client'
export const CREATE_SALA = gql`
  mutation CreateSala($input: CreateSalaInput!) {
    createSala(input: $input) {
      id
      nombre
      capacidad
      ubicacion
      tipo
    }
  }
`
