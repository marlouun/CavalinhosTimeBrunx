# 🏁 GP do Atacado - Cavalinhos Time Brunx

<div align="center">

![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Version](https://img.shields.io/badge/version-2.0-orange?style=flat-square)

**🐴 Um dashboard interativo e gamificado que transforma dados de vendas em uma emocionante corrida de cavalinhos!**

[Sobre](#-sobre-o-projeto) • [Funcionalidades](#-funcionalidades-principais) • [Tecnologias](#-tecnologias-utilizadas) • [Como Usar](#-como-usar) • [Estrutura](#-estrutura-de-arquivos) • [Desenvolvedor](#-desenvolvedor)

</div>

---

## 📋 Sobre o Projeto

**GP do Atacado** é uma aplicação web inovadora que gamifica o acompanhamento de desempenho de vendas da equipe Brunx. Inspirada na clássica corrida dos cavalinhos do Fantástico, transforma números de faturamento em uma visualização lúdica e engajadora.

O projeto integra-se com **Google Sheets** para consumo de dados em tempo real, oferecendo visualizações dinâmicas, histórico de ultrapassagens e um painel interativo que celebra conquistas e motiva a equipe de forma divertida.

---

## 🚀 Funcionalidades Principais

### 🎨 **Interface & Design**
- ✨ **Tema Visualmente Atraente** - Design inspired by cartoon/TV aesthetics com tipografia divertida (Bangers, Fredoka)
- 🎬 **Animações Fluidas** - Animate.css integrado com efeitos customizados (galope, confetes, pulsação)
- 📱 **100% Responsivo** - Layout adaptável para desktop, tablet e mobile utilizando Bootstrap 5
- 🌙 **Tema Copa do Mundo** - Tema especial para junho/julho com decoração dinâmica (bandeirinhas Brasil)
- 🎭 **Painel Lateral Interativo** - Offcanvas com perfil detalhado do vendedor (posição, time, frases motivacionais)

### 🏇 **Dashboard Principal - A Corrida**
- 🏁 **Pista de Corrida Visual** - Representação gráfica proporcional ao desempenho (quanto maior o faturamento, mais avançado o cavalinho)
- 🎠 **Avatares Personalizados** - Imagens únicas para cada vendedor com suporte a times brasileiros
- 📊 **KPIs em Destaque** - Cards informativos mostrando:
  - 💰 Faturamento Total
  - 🏆 Líder da Prova
  - 📅 Data de Atualização
- 🎙️ **Narração Automática Divertida** - Comentários aleatórios narrando a situação do líder, último colocado e pelotão
- 🔄 **Auto Scroll Dinâmico** - Botão para habilitar rolagem automática pela página com pausa nas extremidades

### 📈 **Análise de Dados & Gráficos**
- 📑 **Integração Google Sheets** - Consumo direto de planilhas publicadas como CSV (múltiplos meses)
- 🧹 **Tratamento Robusto de Dados** - Parsing inteligente de valores monetários com suporte a diferentes formatos
- 🍕 **Gráfico Doughnut Interativo** - Visualização de fatias de mercado com Chart.js + DataLabels
- 🛡️ **Escudos de Times** - Ícones dos times brasileiros sobreposto ao gráfico de pizza
- 📋 **Tabela de Classificação** - Ranking atualizado com posição, nome e faturamento

### 🎯 **Histórico & Rastreamento**
- 🔥 **Histórico de Ultrapassagens** - Registro automático das últimas 5 ultrapassagens com data e evento
- 📊 **Detecção de Mudanças de Posição** - Sistema que captura quando um vendedor sobe de posição
- 📅 **Modo Geral (Anual)** - Agregação de vendas de todos os meses para visão consolidada
- 🗓️ **Filtro por Mês** - Seleção granular: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho...

### 🎊 **Efeitos & Celebração**
- 🎉 **Chuva de Confetes** - Efeito celebrativo ao carregar o dashboard
- 🎬 **Background Dinâmico** - Vídeo/imagem de fundo para modo Copa do Mundo
- ⭐ **Badges de Posição** - Indicadores visuais de ranking (1º, 2º, 3º...)
- 💫 **Animações de Entrada** - Elementos animados ao carregar a página

### 👥 **Suporte a Vendedores**
Suporte completo para: **Bruno**, **Daniele**, **Dariele**, **Emily**, **Everton**, **Leandra**, **Maevelim**, **Marlon**, **Maria** e **Vitoria**

---

## 🛠️ Tecnologias Utilizadas

<div align="center">

| Tecnologia | Descrição |
|-----------|-----------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34C26?style=flat-square&logo=html5&logoColor=white) | Estrutura semântica |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | Estilização avançada |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Lógica ES6+ |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat-square&logo=bootstrap&logoColor=white) | Framework CSS |
| ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chart.js&logoColor=white) | Gráficos interativos |
| ![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=flat-square&logo=google-sheets&logoColor=white) | Fonte de dados |

</div>

**Bibliotecas Adicionais:**
- 🎬 **Animate.css** - Animações CSS pré-construídas
- 🎉 **Canvas Confetti** - Efeito de confetes
- 📝 **Chart.js DataLabels** - Plugin para rótulos em gráficos
- 🔤 **Google Fonts** - Tipografia personalizada (Bangers, Fredoka)

---

## 📂 Estrutura de Arquivos

```
CavalinhosTimeBrunx/
├── index.html                          # Arquivo principal HTML
├── README.md                           # Este arquivo
├── assets/
│   ├── script.js                       # Lógica principal da aplicação
│   ├── style.css                       # Estilos customizados
│   ├── Imagens/
│   │   ├── EscudosTimes/              # Escudos de 10+ times brasileiros
│   │   ├── Imagens_Cavalinhos/        # Avatares dos vendedores
│   │   └── LogoBrunx*.png             # Logos da empresa (normal e Copa)
│   ├── Imagens_Brasil/                # Avatares do tema Copa do Mundo
│   ├── Sons/                          # Efeitos sonoros (futuro)
│   └── Videos/                        # Backgrounds de vídeo (futuro)
```

---

## ⚙️ Como Usar

### 1️⃣ **Instalação Rápida**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/CavalinhosTimeBrunx.git

# Navegue até o diretório
cd CavalinhosTimeBrunx

# Abra em seu navegador
# Windows
start index.html

# Mac
open index.html

# Linux
xdg-open index.html
```

### 2️⃣ **Configuração de Dados**
- Os dados são consumidos de uma **planilha Google Sheets** pública
- Cada mês tem seu próprio `gid` (sheet ID) na URL
- Para atualizar dados, basta editar a planilha - a aplicação puxa automaticamente

### 3️⃣ **Usando o Dashboard**
1. Selecione o mês desejado no dropdown
2. Visualize a corrida em tempo real
3. Clique em um vendedor para ver seu perfil completo
4. Use o botão **Auto Scroll** para rolagem automática
5. Acompanhe o **Histórico de Ultrapassagens** em tempo real

---

## 🎯 Recursos Avançados

### Modo Copa do Mundo (Junho/Julho)
- 🏴🏳️ Bandeirinhas Brasil decorando a página
- 🏆 Logo especial da Brunx Copa
- 🇧🇷 Imagens em tema Brasil dos vendedores
- 🛡️ Escudos de times sobre gráficos

### Sistema de Filtros
- **Geral**: Agregação de todos os meses
- **Por Mês**: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho
- **Remoção Dinâmica**: Alguns vendedores são filtrados em meses específicos (configurável)

### Detecção de Ultrapassagens
- Sistema inteligente que identifica mudanças de posição
- Registro automático com timestamp
- Histórico limitado às últimas 5 para limpeza visual

---

## 🔄 Fluxo de Dados

```
Google Sheets (CSV)
       ↓
    fetch() em JS
       ↓
parseCurrency() - Tratamento de valores
       ↓
Filtros por mês e vendedor
       ↓
Ordenação por faturamento (DESC)
       ↓
Renderização em:
├── Pista de Corrida (visual)
├── Gráfico Doughnut (pizza)
└── Tabela de Classificação
```

---

## 🎨 Personalização

### Adicionar Novo Vendedor
1. Adicione o nome na planilha Google Sheets
2. Crie avatar em `assets/Imagens_Cavalinhos/`
3. Crie avatar Brasil em `assets/Imagens_Brasil/` (sufixo `_Brasil.png`)
4. Adicione mapeamento em `getAvatarUrl()` se necessário

### Alterar Cores e Tema
- Abra `assets/style.css`
- Procure por variáveis CSS ou classes `.copa-mundo-theme`
- Customize as cores, fontes e animações

### Adicionar Novo Mês
1. Crie nova aba na planilha Google Sheets
2. Copie o `gid` da aba
3. Adicione em `urlsPorMes` no `script.js`
4. Adicione option no dropdown HTML

---

## 💡 Dicas de Desenvolvimento

- **DevTools**: Use F12 para inspecionar elementos e debug de rede
- **CSV**: Teste localmente salvando CSVs na pasta `assets/`
- **Performance**: O script é otimizado para múltiplas requisições paralelas
- **Responsividade**: Teste em diferentes resoluções com DevTools

---

## 📞 Suporte & Contribuição

Encontrou um bug? Tem uma ideia de melhoria?

- 🐛 Abra uma issue detalhando o problema
- 💡 Sugira novas funcionalidades
- 📝 Envie um pull request com melhorias

---

## 👨‍💻 Desenvolvedor

**Marlon Albino**

Desenvolvido com ❤️ para o **Time Brunx** em 2026

---

<div align="center">

**Feito para gamificar vendas, aumentar engajamento e celebrar conquistas! 🎉**

⭐ Se achou útil, deixe uma star! ⭐

</div>