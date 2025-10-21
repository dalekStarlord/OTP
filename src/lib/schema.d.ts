// Type definitions for GraphQL responses
export interface TripPattern {
  startTime: string
  endTime: string
  duration: number
  legs: TripLeg[]
}

export interface TripLeg {
  mode: string
  distance: number
  fromPlace: { name: string; quay: { id: string } }
  toPlace: { name: string; quay: { id: string } }
  line: { id: string; publicCode: string; name: string }
  pointsOnLink: { points: string }
}

export interface Route {
  id: string
  shortName: string
  longName: string
  color: string
  textColor: string
}

export interface RoutePattern {
  id: string
  headsign: string
  directionId: number
  stops: { id: string; name: string; lat: number; lon: number }[]
}
