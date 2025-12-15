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
      fecha_hallazgo
      ubicacion
      reportado_por
      reporter {
        nombreCompleto
        email
      }
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

export const GET_EQUIPAMIENTO_POR_SALA = gql`
  query GetEquipamientoPorSala($salaId: Int!) {
    equipamientoPorSala(salaId: $salaId) {
      id
      nombre
      tipo
      estado
      cantidad
      descripcion
    }
  }
`
