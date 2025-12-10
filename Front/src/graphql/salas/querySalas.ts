import { gql } from '@apollo/client'

export const GET_SALAS = gql`
  query GetSalas {
    salas {
      id
      nombre
      capacidad
      ubicacion
      disponible
      tipo
      created_at
      updated_at
    }
  }
`
export const GET_ITEMS_PERDIDOS_POR_SALA = gql`
  query GetItemsPerdidosPorSala($salaId: Int!) {
    itemsPerdidosPorSala(salaId: $salaId) {
      id
      nombre
      descripcion
      categoria
      estado
    }
  }
`
export const GET_NOTAS_POR_SALA = gql`
  query GetNotasPorSala($salaId: Int!) {
    notasPorSala(salaId: $salaId) {
      id
      titulo
      contenido
      prioridad
      tipo
      resuelta
    }
  }
`