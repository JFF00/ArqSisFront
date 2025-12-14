import { gql } from '@apollo/client/core'

export const CREATE_EQUIPAMIENTO = gql`
  mutation CreateEquipamiento($input: CreateEquipamientoInput!) {
    createEquipamiento(input: $input) {
      id
      sala_id
      nombre
      tipo
      cantidad
      estado
      descripcion
    }
  }
`
