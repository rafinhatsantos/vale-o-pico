# Vale o Pico

Previsão de surfe para o litoral de São Paulo e do Rio de Janeiro. Em vez de tabelas de números, cada pico recebe uma nota de 0 a 10 por horário, ajustada ao nível do surfista. O site responde: vale a pena ir?

## Estado atual

Fase 1 (hobby) em andamento:

- 31 picos cadastrados em `src/lib/spots.ts`, todos como **rascunho**: as fichas ainda não foram validadas com quem surfa em cada lugar.
- Os números da fórmula da nota são um chute inicial, a calibrar contra o mar real.
- Ainda não publicado.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Outros comandos:

```bash
npm test        # testes da nota e da maré (test runner do Node)
npm run lint
npm run build
```

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/lib/spots.ts` | Fichas dos picos |
| `src/lib/score.ts` | Função única da nota (tamanho × período × vento × maré) |
| `src/lib/forecast/` | Camada de dados: único ponto que conhece a Open-Meteo, com cache de 1 hora no servidor |
| `src/app/praia/[slug]` | Página de cada pico |
| `src/app/como-calculamos` | Explicação da fórmula e dos limites da previsão |

Stack: Next.js 16 (App Router, Cache Components), TypeScript e Tailwind CSS 4.

## Dados e licença

A previsão vem da [Open-Meteo](https://open-meteo.com/) (Marine API e API de tempo). O plano gratuito não permite uso comercial; conferir os termos antes de publicar ou monetizar.
