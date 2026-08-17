# Carona Universitária — Fluxo do Sistema e Regras de Negócio

## 1. Visão geral

O Carona Universitária é uma plataforma voltada inicialmente para estudantes universitários que desejam compartilhar deslocamentos entre si.

O sistema conecta estudantes que já realizariam determinado trajeto com outros estudantes interessados em utilizar vagas disponíveis no veículo.

O objetivo é facilitar deslocamentos universitários, reduzir custos para os estudantes, aumentar o aproveitamento dos veículos e proporcionar uma forma organizada e segura de encontrar caronas.

A plataforma não deve tratar inicialmente o motorista como um prestador profissional de transporte. A proposta é permitir o compartilhamento dos custos relacionados ao deslocamento.

---

# 2. Participantes do sistema

## 2.1. Estudante

Todo usuário comum da plataforma é um estudante.

Um estudante pode:

- manter seu perfil acadêmico;
- cadastrar veículos;
- criar caronas;
- procurar caronas;
- solicitar participação em uma carona;
- informar onde deseja desembarcar;
- acompanhar suas solicitações;
- participar de caronas;
- cancelar uma participação conforme as regras;
- visualizar histórico de caronas;
- futuramente avaliar outros participantes.

Não existe uma separação permanente entre "motorista" e "passageiro".

O mesmo estudante pode ser motorista em uma carona e passageiro em outra.

---

# 3. Perfil acadêmico

Cada usuário poderá possuir no máximo um perfil acadêmico ativo.

O perfil acadêmico representa o vínculo atual do estudante com um curso.

Inicialmente:

- cada estudante possui um único curso atual;
- cada curso pertence a uma universidade;
- uma universidade pode possuir vários cursos;
- o mesmo nome de curso pode existir em universidades diferentes.

Exemplo:

```text
Universidade Positivo
└── Engenharia de Software

Outra Universidade
└── Engenharia de Software
```

São considerados cursos diferentes dentro do sistema.

O perfil acadêmico deverá possuir:

- usuário;
- curso atual;
- matrícula;
- situação ativa/inativa.

A universidade é determinada através do curso.

No MVP não haverá:

- múltiplos cursos simultâneos;
- histórico acadêmico;
- campus;
- e-mail institucional;
- verificação acadêmica avançada.

Caso futuramente seja necessário permitir múltiplos cursos, dupla graduação ou histórico acadêmico, deverá ser introduzido o conceito de `Enrollment` (matrícula/vínculo acadêmico).

---

# 4. Veículos

Um estudante poderá cadastrar um ou mais veículos.

Cada veículo pertence a um único usuário.

Informações básicas:

- marca;
- modelo;
- cor;
- placa;
- ano;
- quantidade de vagas para passageiros;
- situação ativa/inativa.

A placa deverá ser normalizada pelo sistema.

Exemplo:

```text
abc-1d23
```

deverá ser armazenada como:

```text
ABC1D23
```

Devem ser aceitos os padrões brasileiros de placa antiga e Mercosul.

O ano deverá estar entre 1900 e o próximo ano em relação ao ano atual.

A capacidade de passageiros deverá ser um número inteiro entre 1 e 20.

Somente veículos ativos poderão ser utilizados para criar novas caronas.

O usuário somente poderá alterar ou desativar veículos que pertençam a ele.

---

# 5. Conceito de carona

Uma carona representa um trajeto que um estudante motorista pretende realizar utilizando um de seus veículos.

Toda carona possui obrigatoriamente:

- motorista;
- veículo;
- ponto inicial;
- destino final do motorista;
- data;
- horário de saída;
- quantidade de vagas disponíveis;
- situação da carona.

O motorista define inicialmente apenas sua própria rota:

```text
PONTO INICIAL
      │
      │
      │
      ▼
DESTINO FINAL DO MOTORISTA
```

Depois que a carona for publicada, outros estudantes poderão solicitar participação.

---

# 6. Regra principal de embarque do MVP

No MVP haverá somente UM ponto de embarque.

Todos os passageiros aceitos deverão comparecer ao ponto inicial definido pelo motorista.

Não haverá coleta de passageiros durante o trajeto.

Portanto:

```text
                    TODOS EMBARCAM
                         ↓
                PONTO INICIAL
                     │
                     │
                     ▼
              trajeto da carona
```

Essa é uma regra importante do MVP.

Um passageiro NÃO poderá solicitar:

```text
"Me busque neste endereço."
```

Ele poderá solicitar apenas:

```text
"Quero desembarcar neste endereço."
```

Futuramente o sistema poderá evoluir para permitir múltiplos pontos de embarque, mas isso não faz parte do MVP.

---

# 7. Publicação da carona

O motorista deverá informar:

- veículo;
- ponto inicial;
- destino final;
- data;
- horário;
- quantidade de vagas disponibilizadas;
- observações opcionais.

A quantidade de vagas disponibilizadas não poderá ultrapassar a capacidade de passageiros cadastrada no veículo.

Exemplo:

```text
Veículo:
4 vagas para passageiros

Motorista pode publicar:
1 vaga
2 vagas
3 vagas
4 vagas

Não pode publicar:
5 vagas
```

Depois da publicação, a carona fica disponível para receber solicitações.

---

# 8. Busca por caronas

O estudante poderá procurar caronas compatíveis com sua necessidade.

A busca poderá considerar informações como:

- ponto de partida;
- destino desejado;
- universidade;
- data;
- horário;
- disponibilidade de vagas.

A carona deverá apresentar informações suficientes para o estudante decidir se deseja solicitar participação.

Exemplo:

```text
Universidade Positivo → Zona Norte

Hoje
22:30

Motorista: João
Veículo: Honda Civic
3 vagas disponíveis

Ponto de encontro:
Universidade Positivo
```

---

# 9. Solicitação do passageiro

Quando encontrar uma carona interessante, o estudante poderá solicitar participação.

Como existe somente um ponto de embarque, o passageiro NÃO precisa informar onde será buscado.

Ele deverá informar seu:

**ponto de desembarque.**

Exemplo:

```text
Carona:

Universidade Positivo
        │
        │
        ▼
Zona Norte

Passageiro solicita:

"Quero descer na Rua X, 123."
```

A solicitação inicialmente ficará aguardando decisão do motorista.

---

# 10. Análise da solicitação pelo motorista

O motorista terá liberdade para aceitar ou recusar cada solicitação.

Antes da decisão, o sistema deverá apresentar o impacto daquele passageiro sobre a rota.

Exemplo:

```text
João solicitou uma vaga

Desembarque:
Rua X, 123

Distância da participação:
18,2 km

Sua rota atual:
22,4 km • 31 min

Rota considerando João:
24,1 km • 36 min

Impacto:
+1,7 km
+5 min

Valor estimado para João:
R$ 5,00

[ RECUSAR ] [ ACEITAR ]
```

Isso permite que o motorista saiba antecipadamente quanto aquela parada afetará sua viagem.

---

# 11. Aceitação da solicitação

Quando o motorista aceitar um passageiro:

1. a participação passa para o estado de aceita;
2. o ponto de desembarque passa a fazer parte da carona;
3. a rota é recalculada;
4. o preço do passageiro é definido;
5. uma vaga é ocupada;
6. a quantidade de vagas disponíveis é atualizada;
7. o passageiro poderá seguir para o fluxo de pagamento/reserva.

Exemplo:

```text
Carona inicial:

A ───────────────────────→ E

Passageiro 1 aceito:

A ─────── B ─────────────→ E

Passageiro 2 aceito:

A ─────── B ───── C ─────→ E
```

As paradas aceitas passam progressivamente a formar a rota final.

---

# 12. Recusa da solicitação

O motorista poderá recusar uma solicitação.

Nesse caso:

- nenhuma vaga será ocupada;
- o ponto solicitado não será adicionado à rota;
- o passageiro será informado;
- nenhum pagamento deverá ser realizado;
- a carona continuará disponível normalmente.

---

# 13. Limite de passageiros

No MVP, o número máximo de passageiros aceitos será limitado pela quantidade de vagas disponibilizadas pelo motorista.

Exemplo:

```text
Carona possui:
3 vagas

Aceitos:
Passageiro 1
Passageiro 2
Passageiro 3

Resultado:
0 vagas disponíveis
```

Mesmo que o Passageiro 1 desembarque antes dos outros, a vaga não será reutilizada durante aquela carona.

Portanto:

```text
3 vagas
=
máximo de 3 passageiros aceitos
```

Essa regra simplifica significativamente o MVP.

---

# 14. Carona lotada

Quando todas as vagas forem ocupadas, a carona deverá deixar automaticamente de aceitar novas solicitações.

Exemplo:

```text
3 vagas

P1 → aceito
P2 → aceito
P3 → aceito

Status:
FULL
```

Novos estudantes não poderão solicitar participação.

---

# 15. Fechamento manual das solicitações

O motorista poderá decidir parar de receber solicitações mesmo que ainda existam vagas.

Exemplo:

```text
3 vagas

P1 → aceito
P2 → aceito

1 vaga ainda disponível

Motorista:
"Fechar reservas"
```

A carona passa a não aceitar novos passageiros.

O termo recomendado é:

**Fechar reservas**

em vez de:

**Tornar privada**

Isso evita confusão com caronas privadas ou acessíveis apenas por convite.

---

# 16. Possíveis situações da carona

Inicialmente poderão existir estados como:

```text
OPEN
FULL
CLOSED
IN_PROGRESS
COMPLETED
CANCELED
```

## OPEN

A carona está publicada e aceita solicitações.

## FULL

Todas as vagas disponibilizadas foram ocupadas.

## CLOSED

O motorista fechou manualmente novas solicitações.

## IN_PROGRESS

A viagem foi iniciada.

## COMPLETED

A viagem foi concluída.

## CANCELED

A carona foi cancelada.

Os status deverão ser gerenciáveis pelo sistema e não tratados como valores rígidos espalhados pela aplicação.

---

# 17. Situações da participação

A participação de um passageiro possui ciclo independente da carona.

Possíveis situações:

```text
PENDING
ACCEPTED
REJECTED
CANCELED
COMPLETED
```

## PENDING

O passageiro solicitou participação e aguarda decisão.

## ACCEPTED

O motorista aceitou o passageiro.

## REJECTED

O motorista recusou a solicitação.

## CANCELED

A participação foi cancelada.

## COMPLETED

O passageiro concluiu a participação na carona.

---

# 18. Formação da rota

A rota começa apenas com:

```text
START
  │
  ▼
END
```

Conforme passageiros são aceitos:

```text
START
  │
  ▼
PASSAGEIRO 1
  │
  ▼
PASSAGEIRO 2
  │
  ▼
PASSAGEIRO 3
  │
  ▼
END
```

O sistema deverá determinar uma sequência adequada para as paradas.

Cada parada de passageiro representa um ponto de desembarque.

A rota final poderá ser visualizada pelo motorista antes do início da viagem.

Exemplo:

```text
CARONA FINAL

① Universidade Positivo
   Ponto inicial

        ↓

② Av. Higienópolis
   João

        ↓

③ Rua Pernambuco
   Maria

        ↓

④ Av. Saul Elkind
   Pedro

        ↓

⑤ Destino do motorista
```

---

# 19. Cálculo do impacto de uma parada

Sempre que um passageiro solicitar participação, o sistema deverá analisar como seu desembarque afeta a rota atual.

O motorista deverá conseguir visualizar pelo menos:

- endereço solicitado;
- distância percorrida pelo passageiro;
- distância adicional causada à rota;
- tempo adicional estimado;
- valor estimado da participação.

Exemplo:

```text
Rota atual:
20,5 km
29 minutos

Com nova parada:
22,8 km
35 minutos

Impacto:
+2,3 km
+6 minutos
```

O motorista decide se esse impacto é aceitável.

---

# 20. Modelo de preço da carona

O preço inicial será calculado utilizando:

```text
R$ 0,15 por quilômetro
```

com valor mínimo de:

```text
R$ 5,00 por passageiro
```

A fórmula será:

```text
valor = distância × R$ 0,15

se valor < R$ 5,00:
    valor = R$ 5,00
```

Ou:

```text
Valor da carona =
MAX(distância × R$ 0,15, R$ 5,00)
```

---

# 21. Exemplos de preço

## 10 km

```text
10 × R$ 0,15
= R$ 1,50

Como é menor que R$ 5:

Valor = R$ 5,00
```

## 20 km

```text
20 × R$ 0,15
= R$ 3,00

Valor = R$ 5,00
```

## 30 km

```text
30 × R$ 0,15
= R$ 4,50

Valor = R$ 5,00
```

## 40 km

```text
40 × R$ 0,15
= R$ 6,00

Valor = R$ 6,00
```

## 50 km

```text
50 × R$ 0,15
= R$ 7,50

Valor = R$ 7,50
```

## 100 km

```text
100 × R$ 0,15
= R$ 15,00

Valor = R$ 15,00
```

O valor mínimo domina o cálculo até aproximadamente 33,33 km.

---

# 22. Distância utilizada para cobrança

Como todos os passageiros embarcam no mesmo ponto, o preço de cada passageiro será calculado considerando:

```text
Ponto inicial
      ↓
Destino daquele passageiro
```

Exemplo:

```text
Universidade
│
├──── 15 km ───→ Passageiro 1
│
├──── 28 km ─────────→ Passageiro 2
│
└──── 45 km ─────────────────→ Passageiro 3
```

Valores:

```text
P1:
15 × 0,15 = 2,25
→ R$ 5,00

P2:
28 × 0,15 = 4,20
→ R$ 5,00

P3:
45 × 0,15 = 6,75
→ R$ 6,75
```

---

# 23. Passageiro não deve pagar pelo desvio dos outros

Um princípio importante será:

> Um passageiro não deverá ter seu preço aumentado porque outros passageiros foram adicionados posteriormente à carona.

Exemplo:

João aceita participar por:

```text
R$ 6,00
```

Depois Maria é aceita e provoca um desvio na rota.

Mesmo que João permaneça mais tempo dentro do veículo por causa disso:

```text
João continua pagando:
R$ 6,00
```

O preço confirmado não deverá aumentar por decisões posteriores do motorista.

---

# 24. Taxa da plataforma

Além do valor destinado à carona, a plataforma poderá cobrar uma taxa de serviço.

A referência inicial discutida é:

```text
R$ 1,50 por reserva
```

Portanto:

```text
Valor da carona        R$ 5,00
Taxa da plataforma     R$ 1,50
──────────────────────────────
Total                  R$ 6,50
```

A taxa deverá ser apresentada claramente antes da confirmação do pagamento.

---

# 25. Exemplo com três passageiros

Considere três passageiros pagando o mínimo de R$ 5.

Cada um:

```text
Carona                 R$ 5,00
Taxa da plataforma     R$ 1,50
──────────────────────────────
Total                  R$ 6,50
```

Três passageiros:

```text
3 × R$ 6,50
= R$ 19,50
```

Distribuição econômica antes das tarifas do processamento financeiro:

```text
Motorista:
3 × R$ 5,00
= R$ 15,00

Plataforma:
3 × R$ 1,50
= R$ 4,50

Total:
R$ 19,50
```

---

# 26. Exemplo mensal

Considere:

- 1 motorista;
- 3 passageiros por viagem;
- R$ 5 por passageiro;
- R$ 1,50 de taxa;
- 22 dias úteis;
- uma viagem por dia.

Quantidade de reservas:

```text
3 × 22
= 66 reservas/mês
```

Valor destinado às caronas:

```text
66 × R$ 5
= R$ 330/mês
```

Receita bruta da plataforma:

```text
66 × R$ 1,50
= R$ 99/mês
```

Total movimentado:

```text
R$ 330 + R$ 99
= R$ 429/mês
```

Portanto:

| Destino | Mensal |
|---|---:|
| Valor-base das caronas | R$ 330,00 |
| Receita bruta da plataforma | R$ 99,00 |
| Volume total | R$ 429,00 |

Esses valores ainda não consideram:

- tarifa do gateway;
- impostos;
- estornos;
- reembolsos;
- custos operacionais da plataforma.

---

# 27. Ida e volta

Se o mesmo motorista oferecer:

```text
Casa → Universidade
```

e:

```text
Universidade → Casa
```

todos os 22 dias úteis, serão 44 viagens.

Com três passageiros:

```text
44 × 3
= 132 reservas/mês
```

Valor-base:

```text
132 × R$ 5
= R$ 660
```

Taxa da plataforma:

```text
132 × R$ 1,50
= R$ 198
```

Volume total:

```text
R$ 858/mês
```

antes dos demais custos financeiros.

---

# 28. Pagamento

A intenção é que o pagamento futuramente seja realizado dentro da plataforma.

O fluxo conceitual será:

```text
Passageiro aceito
      ↓
Preço confirmado
      ↓
Pagamento
      ↓
Gateway de pagamento
      ↓
Pagamento aprovado
      ↓
Reserva confirmada
```

O sistema deverá separar claramente:

```text
Valor da carona
+
Taxa de serviço
=
Total
```

Exemplo:

```text
Resumo

Carona                 R$ 6,00
Taxa de serviço        R$ 1,50
──────────────────────────────
Total                  R$ 7,50
```

---

# 29. Gateway e divisão financeira

A plataforma deverá utilizar um serviço de pagamento adequado para plataformas/marketplaces.

O objetivo é permitir separar:

```text
PASSAGEIRO
    │
    ▼
PAGAMENTO
    │
    ▼
GATEWAY
    │
    ├────→ valor relacionado à carona
    │
    └────→ receita da plataforma
```

As tarifas cobradas pelo gateway deverão ser consideradas separadamente.

Portanto:

```text
Receita bruta da plataforma
≠
Lucro líquido da plataforma
```

O lucro real será:

```text
Receita da plataforma
-
custos de pagamento
-
infraestrutura
-
impostos
-
outros custos operacionais
```

---

# 30. Confirmação do valor

O passageiro deverá conhecer o valor antes de pagar.

O sistema não poderá alterar silenciosamente um valor já confirmado.

Fluxo:

```text
Solicitação
     ↓
Motorista aceita
     ↓
Sistema calcula valor
     ↓
Passageiro visualiza
     ↓
Passageiro confirma
     ↓
Pagamento
```

---

# 31. Início da carona

No horário combinado, todos os passageiros deverão comparecer ao ponto inicial.

A tela do motorista poderá mostrar:

```text
CARONA

Ponto inicial:
Universidade Positivo

Passageiros:
✓ João
✓ Maria
✓ Pedro

Próxima parada:
João

[ INICIAR CARONA ]
```

Ao iniciar:

```text
status → IN_PROGRESS
```

A carona deixa de aceitar qualquer alteração comum de participantes.

---

# 32. Durante a carona

Durante a viagem, o motorista deverá visualizar a sequência das paradas.

Exemplo:

```text
CARONA EM ANDAMENTO

✓ Universidade Positivo
  Início

↓ 8,2 km

● João
  Av. Higienópolis, 123

↓ 5,7 km

○ Maria
  Rua X, 456

↓ 9,1 km

○ Pedro
  Av. Y, 789

↓ 4,3 km

○ Destino final
```

Quando uma parada for concluída, ela poderá ser marcada como realizada.

---

# 33. Finalização

Depois que os passageiros forem desembarcados e o motorista chegar ao destino final, a carona poderá ser concluída.

```text
START
  ✓

P1
  ✓

P2
  ✓

P3
  ✓

END
  ✓

↓

COMPLETED
```

Depois da conclusão, a carona passa a fazer parte do histórico.

---

# 34. Cancelamentos

O sistema deverá possuir regras para cancelamento tanto da carona quanto da participação.

## Cancelamento pelo motorista

Ao cancelar uma carona:

- todos os passageiros deverão ser avisados;
- a carona passa para `CANCELED`;
- pagamentos deverão seguir a política de reembolso;
- nenhuma nova solicitação poderá ocorrer.

## Cancelamento pelo passageiro

O passageiro poderá cancelar sua participação dentro das regras estabelecidas.

Nesse caso:

- sua participação passa para `CANCELED`;
- sua vaga poderá voltar a ficar disponível, dependendo do estado da carona;
- sua parada deverá ser removida da rota;
- a rota deverá ser recalculada;
- eventual pagamento seguirá a política de cancelamento.

As regras financeiras exatas de cancelamento e reembolso ainda deverão ser definidas antes do lançamento pago.

---

# 35. Regras fundamentais de segurança do domínio

O sistema deverá garantir que:

1. um usuário somente altere seus próprios veículos;
2. um motorista somente altere suas próprias caronas;
3. um passageiro somente altere sua própria solicitação;
4. um motorista não participe como passageiro da própria carona;
5. um veículo inativo não seja utilizado;
6. uma carona cancelada não receba solicitações;
7. uma carona lotada não receba solicitações;
8. uma carona fechada não receba solicitações;
9. não sejam aceitos mais passageiros que vagas disponíveis;
10. o mesmo passageiro não possua duas participações na mesma carona;
11. somente usuários ativos possam criar ou participar de caronas;
12. o motorista realmente seja proprietário do veículo utilizado;
13. o ponto inicial seja único no MVP;
14. passageiros informem apenas seus pontos de desembarque;
15. valores confirmados não aumentem devido à entrada posterior de outros passageiros.

---

# 36. Fluxo completo do motorista

```text
LOGIN
  ↓
COMPLETAR PERFIL
  ↓
CADASTRAR VEÍCULO
  ↓
CRIAR CARONA
  ↓
Definir:
- veículo
- ponto inicial
- destino
- data
- horário
- vagas
  ↓
PUBLICAR
  ↓
OPEN
  ↓
Receber solicitações
  ↓
Visualizar:
- passageiro
- desembarque
- distância
- desvio
- tempo adicional
- preço
  ↓
ACEITAR / RECUSAR
  ↓
Recalcular rota
  ↓
Continuar recebendo solicitações
  ↓
FULL ou FECHAR RESERVAS
  ↓
Visualizar rota final
  ↓
INICIAR CARONA
  ↓
Realizar paradas
  ↓
Chegar ao destino
  ↓
FINALIZAR
  ↓
COMPLETED
```

---

# 37. Fluxo completo do passageiro

```text
LOGIN
  ↓
COMPLETAR PERFIL
  ↓
BUSCAR CARONA
  ↓
Selecionar carona
  ↓
Visualizar:
- motorista
- veículo
- ponto inicial
- destino
- horário
- vagas
  ↓
INFORMAR PONTO DE DESEMBARQUE
  ↓
SOLICITAR VAGA
  ↓
PENDING
  ↓
Motorista decide
  │
  ├── REJECTED
  │
  └── ACCEPTED
         ↓
     visualizar preço
         ↓
       pagar
         ↓
   reserva confirmada
         ↓
comparecer ao ponto inicial
         ↓
participar da carona
         ↓
desembarcar
         ↓
COMPLETED
```

---

# 38. Fluxo resumido da formação da rota

```text
Motorista cria:

START
  │
  │
  ▼
END


Passageiro 1 solicita P1:

START
  │
  ├──── P1 ?
  │
  ▼
END

Motorista aceita:

START
  │
  ▼
P1
  │
  ▼
END


Passageiro 2 solicita P2:

Sistema calcula impacto

Motorista aceita:

START
  │
  ▼
P1
  │
  ▼
P2
  │
  ▼
END


Passageiro 3:

START
  │
  ▼
P1
  │
  ▼
P2
  │
  ▼
P3
  │
  ▼
END


ROTA FINAL
```

---

# 39. Principais telas relacionadas ao fluxo

## Passageiro

- Login
- Cadastro
- Completar perfil acadêmico
- Home
- Buscar caronas
- Resultado da busca
- Detalhes da carona
- Selecionar ponto de desembarque
- Confirmar solicitação
- Solicitação pendente
- Solicitação aceita
- Resumo do preço
- Pagamento
- Reserva confirmada
- Detalhes da próxima carona
- Carona em andamento
- Histórico
- Detalhes de carona concluída
- Perfil
- Veículos

## Motorista

Além das telas comuns:

- Criar carona
- Selecionar veículo
- Definir ponto inicial
- Definir destino
- Definir data/horário
- Definir vagas
- Revisar publicação
- Gerenciar carona
- Solicitações pendentes
- Detalhes da solicitação
- Impacto da parada na rota
- Aceitar/recusar passageiro
- Visualizar passageiros aceitos
- Visualizar rota atualizada
- Fechar reservas
- Rota final
- Iniciar carona
- Carona em andamento
- Próxima parada
- Finalizar carona

---

# 40. Princípios do MVP

O MVP deverá priorizar simplicidade.

Por isso:

- existe apenas um ponto de embarque;
- todos os passageiros começam juntos;
- cada passageiro informa somente seu desembarque;
- cada usuário possui apenas um curso atual;
- vagas não são reutilizadas durante a viagem;
- motorista decide quais solicitações aceitar;
- preço é baseado em distância;
- existe um valor mínimo;
- o preço de um passageiro não aumenta pela entrada de outros;
- pagamentos serão associados às reservas;
- rotas mais complexas poderão ser introduzidas futuramente.

---

# 41. Evoluções futuras possíveis

O sistema poderá posteriormente evoluir para:

- múltiplos pontos de embarque;
- embarque de passageiros durante o trajeto;
- caronas recorrentes;
- ida e volta vinculadas;
- histórico acadêmico;
- múltiplos cursos;
- avaliações;
- reputação;
- favoritos;
- motorista preferido;
- passageiro preferido;
- chat;
- notificações;
- compartilhamento de localização;
- acompanhamento em tempo real;
- contatos de segurança;
- verificação acadêmica;
- documentos do motorista;
- documentos do veículo;
- políticas avançadas de cancelamento;
- cupons;
- promoções;
- programa de indicação;
- assinatura premium;
- otimização automática da ordem das paradas;
- sugestão automática de caronas compatíveis.

Essas funcionalidades não devem aumentar desnecessariamente a complexidade do primeiro lançamento.

---

# 42. Definição resumida do produto

O Carona Universitária funciona através de um modelo simples:

> Um estudante informa que realizará determinado trajeto e disponibiliza vagas em seu veículo.

> Todos os passageiros embarcam no mesmo ponto inicial.

> Estudantes interessados informam onde desejam desembarcar.

> O motorista analisa o impacto de cada solicitação e decide se deseja aceitá-la.

> Conforme passageiros são aceitos, o sistema monta a rota final da viagem.

> Cada passageiro paga de acordo com a distância correspondente ao seu deslocamento, respeitando um valor mínimo.

> A plataforma cobra uma taxa de serviço pela intermediação da reserva.

> Quando as vagas terminam ou o motorista fecha as reservas, a rota é consolidada.

> No horário combinado, todos se encontram no ponto inicial, a viagem começa, os passageiros são desembarcados nas paradas aceitas e o motorista segue até seu destino final.

A proposta central é tornar o compartilhamento de deslocamentos universitários simples, organizado, previsível e economicamente interessante para todos os envolvidos.