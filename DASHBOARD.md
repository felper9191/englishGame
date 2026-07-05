# 📊 Dashboard de Desempenho - Documentação

## Visão Geral

Um novo dashboard foi implementado para rastrear e exibir o desempenho do jogador em tempo real, fornecendo estatísticas detalhadas sobre acertos, erros e progresso por matéria e módulo.

## Recursos Implementados

### 1. **Sistema de Rastreamento de Dados** 

O sistema agora coleta automaticamente:
- ✅ Total de perguntas respondidas
- ✅ Total de acertos e erros (geral)
- ✅ Acertos e erros **por matéria**
- ✅ Acertos e erros **por módulo**
- ✅ Taxa de acerto percentual
- ✅ Maior sequência de acertos

### 2. **Estrutura de Dados**

```javascript
const estatisticas = {
  totalPerguntas: 0,
  acertosPorMateria: {},      // { "Simple Present": 5, ... }
  errosPorMateria: {},         // { "Simple Present": 2, ... }
  acertosPorModulo: {},        // { 1: 10, 2: 8, ... }
  errosPorModulo: {},          // { 1: 2, 2: 1, ... }
  nivelPorMateria: {}          // Rastreamento por nível (Fácil/Médio/Difícil)
};
```

### 3. **Interface do Dashboard**

O dashboard exibe:

#### Estatísticas Gerais
- **Total de Perguntas**: Quantidade total de perguntas respondidas
- **Total de Acertos**: Soma de todas as respostas corretas
- **Total de Erros**: Soma de todas as respostas incorretas
- **Taxa de Acerto**: Percentual geral de acertos
- **Maior Sequência**: Melhor sequência de acertos consecutivos

#### Desempenho por Matéria
Tabela mostrando:
- Nome da matéria
- Quantidade de acertos
- Quantidade de erros
- Taxa percentual de acerto

#### Desempenho por Módulo
Tabela mostrando:
- Número do módulo
- Quantidade de acertos
- Quantidade de erros
- Taxa percentual de acerto

### 4. **Como Usar**

1. **Abrir o Dashboard**: Clique no botão "📊 Dashboard" no cabeçalho da página
2. **Visualizar Estatísticas**: O dashboard é atualizado automaticamente após cada pergunta respondida
3. **Fechar o Dashboard**: Clique no botão "✕" ou clique fora da modal

### 5. **Funções Principais**

#### `rastrearDesempenho(pergunta, acertou)`
Função chamada automaticamente após cada resposta.
- **Parâmetros**:
  - `pergunta`: Objeto da pergunta respondida
  - `acertou`: Boolean indicando se a resposta foi correta

#### `abrirDashboard()`
Abre a modal do dashboard e exibe as estatísticas

#### `fecharDashboard()`
Fecha a modal do dashboard

#### `gerarHTMLDashboard()`
Gera o HTML com todas as estatísticas formatadas

#### `calcularTaxaAcerto()`
Calcula a taxa percentual geral de acertos

### 6. **Integração com o Jogo**

O rastreamento ocorre automaticamente:
- ✅ Quando a pergunta é respondida corretamente → `rastrearDesempenho(q, true)`
- ✅ Quando a pergunta é respondida incorretamente → `rastrearDesempenho(q, false)`
- ✅ Dados persistem durante toda a sessão de jogo
- ✅ Dados reiniciam ao começar um novo módulo (opcional)

### 7. **Estilos CSS**

Novos estilos adicionados:
- `.dashboard-modal`: Modal do dashboard
- `.dashboard-stats`: Cards de estatísticas
- `.performance-table`: Tabelas de desempenho
- `.badge`: Badges coloridos para estatísticas
- Responsividade para dispositivos móveis

### 8. **Responsividade**

O dashboard é totalmente responsivo:
- ✅ Desktop: Grid de 4 colunas com todas as informações
- ✅ Tablet: Grid ajustado com informações principais
- ✅ Mobile: Layout otimizado com colunas reduzidas

## Exemplo de Uso

```javascript
// Adicionar acerto
rastrearDesempenho(pergunta, true);

// Abrir dashboard
abrirDashboard();

// Fechar dashboard
fecharDashboard();
```

## Dados Capturados por Pergunta

Cada pergunta respondida adiciona informações do objeto:
```javascript
{
  questao: string,
  modulo: number,       // 1-10
  nivel: string,        // "Fácil", "Médio", "Difícil"
  materia: string       // "Simple Present", etc.
}
```

## Futuras Melhorias (Opcional)

- 📈 Gráficos visuais (Chart.js ou Canvas)
- 💾 Persistência de dados (localStorage/backend)
- 📊 Estatísticas por data/tempo de jogo
- 🎯 Metas de aprendizado
- 📉 Análise de tendências
- 🏆 Sistema de conquistas

## Notas Técnicas

- Dados são armazenados em variáveis de escopo global
- Atualização ocorre em tempo real
- Sem dependências externas
- Compatível com navegadores modernos
- Acessibilidade ARIA implementada
