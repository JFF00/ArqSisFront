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

export const CREATE_NOTA = gql`
  mutation CreateNota($input: CreateNotaInput!) {
    createNota(input: $input) {
      id
      titulo
      contenido
      prioridad
      tipo
      resuelta
      created_at
    }
  }
`

export const CREATE_ITEM_PERDIDO = gql`
  mutation CreateItemPerdido($input: CreateItemPerdidoInput!) {
    createItemPerdido(input: $input) {
      id
      nombre
      descripcion
      categoria
      estado
      ubicacion
      fecha_hallazgo
      created_at
    }
  }
`

export const UPDATE_ITEM_PERDIDO = gql`
  mutation UpdateItemPerdido($id: Int!, $input: UpdateItemPerdidoInput!) {
    updateItemPerdido(id: $id, input: $input) {
      id
      estado
      reportado_por
    }
  }
`

export const UPDATE_NOTA = gql`
  mutation UpdateNota($id: Int!, $input: UpdateNotaInput!) {
    updateNota(id: $id, input: $input) {
      id
      resuelta
    }
  }
`
