# DER — Carona Universitária (MVP)

Este é um modelo conceitual proposto a partir das regras descritas em
`AGENT.md`. Ele não altera o schema Prisma nem representa uma migration já
aplicada.

## Diagrama de Entidade-Relacionamento

```mermaid
flowchart TB
  ROLE["ROLE<br/>──────────<br/>PK id<br/>UK code<br/>name<br/>active<br/>createdAt<br/>updatedAt"]
  USER["USER<br/>──────────<br/>PK id<br/>FK roleId<br/>UK login<br/>password<br/>active<br/>createdAt<br/>updatedAt"]
  UNIVERSITY["UNIVERSITY<br/>──────────<br/>PK id<br/>UK name<br/>acronym<br/>active<br/>createdAt<br/>updatedAt"]
  COURSE["COURSE<br/>──────────<br/>PK id<br/>FK universityId<br/>name<br/>code<br/>active<br/>createdAt<br/>updatedAt"]
  PROFILE["STUDENT_PROFILE<br/>──────────<br/>PK id<br/>FK/UK userId<br/>FK courseId<br/>fullName<br/>registrationNumber<br/>institutionalEmail<br/>createdAt<br/>updatedAt"]
  VEHICLE["VEHICLE<br/>──────────<br/>PK id<br/>FK ownerId<br/>UK plate<br/>brand<br/>model<br/>color<br/>year<br/>seats<br/>active<br/>createdAt<br/>updatedAt"]
  RIDE_STATUS["RIDE_STATUS<br/>──────────<br/>PK id<br/>UK code<br/>name<br/>active<br/>createdAt<br/>updatedAt"]
  RIDE["RIDE<br/>──────────<br/>PK id<br/>FK driverId<br/>FK vehicleId<br/>FK statusId<br/>origin<br/>destination<br/>departureAt<br/>totalSeats<br/>availableSeats<br/>pricePerSeat<br/>notes<br/>cancellationReason<br/>canceledAt<br/>completedAt<br/>createdAt<br/>updatedAt"]
  PARTICIPANT_STATUS["PARTICIPANT_STATUS<br/>──────────<br/>PK id<br/>UK code<br/>name<br/>active<br/>createdAt<br/>updatedAt"]
  PARTICIPANT["RIDE_PARTICIPANT<br/>──────────<br/>PK id<br/>FK rideId<br/>FK passengerId<br/>FK statusId<br/>requestedAt<br/>decidedAt<br/>canceledAt<br/>updatedAt<br/>UK rideId + passengerId"]
  REVIEW["REVIEW<br/>──────────<br/>PK id<br/>FK rideId<br/>FK authorId<br/>FK reviewedUserId<br/>rating<br/>comment<br/>createdAt<br/>updatedAt<br/>UK rideId + authorId + reviewedUserId"]

  HAS_ROLE{"POSSUI"}
  HAS_PROFILE{"POSSUI"}
  OFFERS{"OFERECE"}
  ENROLLED{"CURSA"}
  OWNS{"POSSUI"}
  DRIVES{"DIRIGE"}
  USES{"UTILIZA"}
  RIDE_STATE{"ESTÁ EM"}
  REQUESTS{"SOLICITA"}
  HAS_REQUEST{"RECEBE"}
  REQUEST_STATE{"ESTÁ EM"}
  CONTEXT{"OCORRE EM"}
  WRITES{"FAZ"}
  RECEIVES{"RECEBE"}

  ROLE -- "1" --- HAS_ROLE
  HAS_ROLE -- "N" --- USER

  USER -- "1" --- HAS_PROFILE
  HAS_PROFILE -- "0..1" --- PROFILE

  UNIVERSITY -- "1" --- OFFERS
  OFFERS -- "N" --- COURSE

  COURSE -- "1" --- ENROLLED
  ENROLLED -- "N" --- PROFILE

  USER -- "1" --- OWNS
  OWNS -- "N" --- VEHICLE

  USER -- "1" --- DRIVES
  DRIVES -- "N" --- RIDE

  VEHICLE -- "1" --- USES
  USES -- "N" --- RIDE

  RIDE_STATUS -- "1" --- RIDE_STATE
  RIDE_STATE -- "N" --- RIDE

  USER -- "1" --- REQUESTS
  REQUESTS -- "N" --- PARTICIPANT

  RIDE -- "1" --- HAS_REQUEST
  HAS_REQUEST -- "N" --- PARTICIPANT

  PARTICIPANT_STATUS -- "1" --- REQUEST_STATE
  REQUEST_STATE -- "N" --- PARTICIPANT

  RIDE -- "1" --- CONTEXT
  CONTEXT -- "N" --- REVIEW

  USER -- "1 autor" --- WRITES
  WRITES -- "N" --- REVIEW

  USER -- "1 avaliado" --- RECEIVES
  RECEIVES -- "N" --- REVIEW

  classDef entity fill:#eef5ff,stroke:#2457a6,stroke-width:2px,color:#10233f;
  classDef relationship fill:#fff4d6,stroke:#a66b00,stroke-width:2px,color:#4d3200;
  class ROLE,USER,UNIVERSITY,COURSE,PROFILE,VEHICLE,RIDE_STATUS,RIDE,PARTICIPANT_STATUS,PARTICIPANT,REVIEW entity;
  class HAS_ROLE,HAS_PROFILE,OFFERS,ENROLLED,OWNS,DRIVES,USES,RIDE_STATE,REQUESTS,HAS_REQUEST,REQUEST_STATE,CONTEXT,WRITES,RECEIVES relationship;
```







