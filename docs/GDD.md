# Game Design Document (GDD): Rogue Term

**Versão:** 0.3 (The Keycap Edition - Balatro Style & Continuous Pool)  
**Gênero:** Word Puzzle / Roguelike Deckbuilder & State Manipulator  
**Inspirações Centrais:** *Termo / Wordle*, *Balatro*, *Slay the Spire*  
**Plataforma Alvo:** Web (Mobile-First / Desktop PWA)  
**Direção Visual:** Retrô Arcade / Balatro CRT Aesthetic com Tema de Teclado Mecânico (Keycaps táteis, Switch Thock, Glow Neon)

---

## 1. Visão Geral do Jogo (High Concept)

**Rogue Term** funde o quebra-cabeça clássico de dedução de palavras (*Termo*) com a progressão viciante e sinérgica de *Balatro*, ambientado em uma atmosfera retrô de digitação e computação analógica. Em vez de um desafio diário isolado, o jogador entra em uma **Run Infinita** onde gerencia um **Pool Contínuo de Teclas (Keycaps [ T ])**, coleciona **Cartas de Habilidade (Ativas / Atalhos de Teclado)** e **Relíquias Coringa (Passivas / Switches Modificados)**, enfrenta **Palavras-Chefe com anomalias de tabuleiro** e busca a maior pontuação possível no ranking mundial.

---

## 2. Direção de Arte & Sensação do Jogo (Juice & Aesthetic)

O jogo adota a identidade visual e o design sensorial de **Balatro** mesclado com a estética de **Teclados Mecânicos Retrô**:

```
+-------------------------------------------------------------+
| [CRT Scanlines & Glow Filter]                               |
|                                                             |
|  [RODADA 3 / CHEFE]    [PONTOS: 14.850]    [TECLAS: [T] 12] |
|                                                             |
|  +---------------------+  +-------------------------------+ |
|  | CARTAS / ATALHOS    |  |         GRID DA PALAVRA       | |
|  | [Retro-Edição] (1)  |  |   [ P ] [ E ] [ D ] [ R ] [ A ] | |
|  | [Sonda] (2)         |  |   [ P ] [ O ] [ R ] [ T ] [ O ] | |
|  |                     |  |   [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] | |
|  | [Switch Dourado]    |  |   [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] | |
|  +---------------------+  +-------------------------------+ |
|                                                             |
|          [TECLADO VIRTUAL RETRÔ COM FEEDBACK TÁTIL]          |
+-------------------------------------------------------------+
```

### 2.1 Elementos Visuais e Ícones
- **Ícone de Vida / Sobrevivência: Keycap `[ T ]`:**
  - Em vez de corações ou tinta, a vida do jogador é representada por um ícone estilizado de **Keycap mecânico retrô gravado com a letra `T`**.
  - No HUD principal: exibido com destaque e brilho neon (ex: `[ T ] 14 Teclas`).
- **Shader/Filtro CRT:** Scanlines horizontais suaves, leve vinheta escura nas bordas, efeito de cintilação sutil e aberração cromática leve no texto (com botão de alternar para modo Clean/Minimalista).
- **Paleta de Cores:** Fundo escuro azul-petróleo/púrpura estilo mesa de feltro de cassino retrô; verdes neon fluorescentes (letras corretas), amarelos âmbar quentes (posições incorretas) e cinzas ardósia foscos.
- **Cartas Estilo Balatro/Tarô:** Habilidades e relíquias são exibidas como cartas com bordas ornamentadas, selos de raridade, efeito de holograma/foil nas cartas lendárias e animação de balanço suave com a física do mouse/giroscópio.
- **Game Juice & Micro-Interações:**
  - Animação de *card flip* 3D tátil nas letras ao submeter um palpite.
  - Tela vibra levemente (*screen shake*) ao errar um palpite ou sofrer maldição.
  - Feedback sonoro "thocky" de teclado mecânico tátil a cada tecla pressionada e fanfarra eletrônica retrô ao acertar a palavra.

---

## 3. Core Loop: O Sistema de Pool Contínuo de Teclas (Key Pool)

No Rogue Term, o recurso vital não são tentativas isoladas por palavra, mas sim a durabilidade do seu estoque de **Teclas `[ T ]`**:

```mermaid
flowchart TD
    Start([Início da Run: 15 Teclas [T]]) --> Round[Início da Palavra]
    Round --> Guess[Jogador Digita & Submete Palpite]
    Guess --> Consume[Consome 1 Tecla [T]]
    Consume --> CheckWin{Palavra Correta?}
    
    CheckWin -- Não --> CheckZero{Teclas == 0?}
    CheckZero -- Sim --> GameOver([Fim da Run / Game Over])
    CheckZero -- Não --> UseSkill{Usar Atalho / Novo Palpite?}
    UseSkill --> Guess
    
    CheckWin -- Sim --> CalcReward[Recompensa de Teclas & Moedas]
    CalcReward --> Draft[Escolha de 1 entre 3 Cartas/Upgrades]
    Draft --> CheckBoss{Próxima rodada é Chefe?}
    CheckBoss -- Sim --> BossFight[Palavra Chefe com Anomalia]
    CheckBoss -- Não --> NextRound[Próxima Palavra]
    BossFight --> Round
    NextRound --> Round
```

### 3.1 Economia de Teclas
- **Pool Inicial:** 15 Teclas `[ T ]` (configurável para balanceamento).
- **Consumo:** Cada tentativa de palavra submetida consome **1 Tecla**.
- **Recarga de Teclas ao Vencer a Palavra:**
  - Acertar na **1ª tentativa:** +6 Teclas `[ T ]` (Golpe de Mestre) + Bônus Máximo de Moedas.
  - Acertar na **2ª tentativa:** +5 Teclas `[ T ]`.
  - Acertar na **3ª tentativa:** +4 Teclas `[ T ]`.
  - Acertar na **4ª tentativa:** +3 Teclas `[ T ]`.
  - Acertar na **5ª+ tentativa:** +2 Teclas `[ T ]` (Sobrevivência no limite).
- **Teto Máximo:** O jogador começa com capacidade padrão (ex: 20 Teclas) e pode expandir o teto com relíquias mecânicas.
- **Tensão Roguelike:** Ficar com 2 ou 3 Teclas restantes gera extrema pressão: chutar uma palavra aleatória pode significar a morte da run, incentivando o uso de cartas ativas como *Sonda* ou *Retro-Edição*.

---

## 4. Cartas de Habilidade e Relíquias (Upgrades)

O jogador possui dois slots de equipamento:
- **Cartas Ativas (Atalhos de Teclado / Hacks de Tabuleiro):** Até 3 cartas simultâneas com cargas de uso por rodada/run.
- **Relíquias Passivas (Switches / Modificadores de Hardware):** Até 5 relíquias passivas permanentes com sinergias multiplicativas.

### 4.1 Cartas Ativas (Hacks de Tabuleiro)

| Carta / Atalho | Efeito | Raridade | Power Score | Custo de Uso |
|---|---|:---:|:---:|:---:|
| **Ctrl+Z (Retro-Edição)** | Escolha uma letra de uma tentativa já submetida e troque por outra. As cores daquela linha são recalculadas imediatamente. | **Raro** | 65 | 1 Carga |
| **Anagramador (Shift Swap)** | Inverte ou permuta a posição de duas letras em um palpite anterior, recalculando os acertos. | **Incomum** | 45 | 1 Carga |
| **Backspace Quântico** | Apaga a última tentativa errada do grid e reembolsa a 1 Tecla gasta. | **Lendário** | 85 | 1 uso por run |
| **Sonda de Circuito** | Selecione 3 letras no teclado: revela se alguma delas existe na palavra secreta sem consumir Teclas. | **Comum** | 20 | Recarrega a cada 2 rodadas |
| **Lente Térmica** | Clica em uma letra amarela: aponta com uma seta neon se a posição correta está à esquerda ou à direita. | **Incomum** | 40 | 1 Carga |
| **Keycap Iluminado (Vogal)** | Revela instantaneamente uma vogal da palavra na posição verde correta. | **Raro** | 60 | 1 Carga |
| **CaspLock Coringa** | Transforma 2 letras cinzas em caracteres coringa que acertam qualquer letra no próximo palpite. | **Lendário** | 90 | 1 Carga por ato |

### 4.2 Relíquias Passivas (Switches e Modificadores de Hardware)

| Relíquia | Efeito | Raridade | Sinergia |
|---|---|:---:|---|
| **Keycaps PBT Reforçadas** | Aumenta o teto máximo de Teclas em +10 e restaura +3 Teclas ao ser adquirida. | **Comum** | Sobrevivência e fôlego |
| **Switch Dourado (Midas)** | Palavras contendo letras raras (X, Z, K, W, Y) concedem o dobro de moedas e +2 Teclas bônus ao resolver. | **Incomum** | Economia e alto risco |
| **Buffer de Teclado** | O primeiro palpite da rodada não consome Tecla se acertar pelo menos 2 letras amarelas/verdes. | **Raro** | Abertura analítica |
| **RGB Sincronizado** | Cada acerto verde em sequência aumenta o multiplicador de pontuação em +0.3x. | **Incomum** | Pontuação explosiva |
| **Circuito Duplo (Eco)** | Letras verdes descobertas na palavra anterior já começam marcadas como reveladas na próxima palavra. | **Lendário** | Velocidade e economia de Teclas |

---

## 5. Estrutura de Dificuldade & Palavras-Chefe (Boss Blinds)

A cada 3 ou 4 rodadas normais, o jogador enfrenta uma **Palavra-Chefe com Anomalia**:

*   **Chefe "O Bug do Teclado":** Algumas letras comuns ficam bloqueadas e não podem ser digitadas.
*   **Chefe "Ghosting de Switch":** As vogais não mostram status amarelo (ou são verdes ou cinzas).
*   **Chefe "Monitor Desfocado":** A 3ª coluna do tabuleiro fica borrada até a 3ª tentativa.
*   **Chefe "Teclado Duplo":** O jogador deve resolver **duas palavras simultâneas** usando os mesmos palpites.

---

## 6. Arquitetura Técnica & Stack Detalhada

*   **Frontend:** Next.js (React 19 / 18 App Router) + Tailwind CSS + Framer Motion + Lucide Icons + SVG Custom Keycap icons.
*   **Shader CRT:** Implementação em camadas CSS com scanlines dinâmicas, vinheta e chave de alternância para modo minimalista limpo.
*   **Estado da Partida:** Zustand com persistência local de sessão ativa e cálculo imutável de estado de rodada.
*   **Engine de Dicionário (Léxico Oficial pt-br):**
  - Base extraída diretamente do repositório oficial utilizado pelo Termo: [`fserb/pt-br`](https://github.com/fserb/pt-br) sob licença MIT.
  - **Palavras Válidas (11.302 entradas):** Conjunto completo com todas as formas lexicais e conjugações verbais de 5 letras em português (ex: "FIRMA", "TERMO", "SAGAZ", "ANDOU", "CORRI").
  - **Palavras Secretas / Alvo (1.624 entradas):** Curadas através do índice **ICF (Inverse Corpus Frequency)** para garantir apenas termos comuns do dia a dia, excluindo termos ofensivos via lista negativa oficial.
  - Normalização NFD automática (digitação sem acentos como "MACAO" reconhece "MAÇÃ").
*   **Backend & Leaderboard:** Next.js Server Actions / API Routes conectadas ao Supabase (PostgreSQL) com verificação de integridade e auditoria de pontuação baseada em seeds.

