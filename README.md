# 🏁 GP do Atacado - Cavalinhos Time Brunx

Bem-vindo ao **GP do Atacado**, um dashboard interativo e divertido inspirado na corrida dos cavalinhos do Fantástico, desenvolvido para acompanhar o desempenho de vendas da equipe Brunx de forma lúdica e engajadora.

## 📋 Sobre o Projeto

Este projeto é uma aplicação web que transforma dados de vendas em uma emocionante corrida de cavalinhos. Ele consome dados de uma planilha do Google Sheets e apresenta as informações em tempo real, com animações, gráficos interativos e um histórico de ultrapassagens para aumentar a competitividade.

## 🚀 Funcionalidades Implementadas

### 🎨 Interface e Design
- **Tema Divertido:** Design inspirado em desenhos animados e programas de TV, utilizando fontes como 'Bangers' e 'Fredoka'.
- **Animações:** Uso de `Animate.css` para entradas de elementos e animações personalizadas (galope dos cavalinhos, confetes).
- **Responsividade:** Layout adaptável utilizando **Bootstrap 5**, garantindo boa visualização em diferentes dispositivos.
- **Menu de Meses (Dropdown):** Um menu de seleção (dropdown) permite filtrar os resultados por mês ou visualizar o resultado geral do ano, otimizando o espaço na tela.
- **Painel Lateral (Offcanvas):** Perfil detalhado de cada vendedor ao clicar no cavalinho ou na tabela, mostrando posição, time e frases motivacionais.

### 🏇 A Corrida (Dashboard Principal)
- **Pista de Corrida:** Visualização gráfica onde a posição dos cavalinhos é proporcional ao faturamento do vendedor em relação ao líder.
- **Avatares Personalizados:** Cada vendedor possui um avatar de cavalinho personalizado (imagens PNG) baseado no seu nome.
- **KPIs em Destaque:** Exibição clara do Faturamento Total, Líder da Prova e Data de Atualização.
- **Narração Automática:** Frases divertidas geradas aleatoriamente narrando a situação do líder, do último colocado e do pelotão intermediário.
- **Histórico de Ultrapassagens:** Uma tabela exibe as últimas 5 ultrapassagens, mostrando a data e o evento, para acirrar a competição.

### 📊 Dados e Gráficos
- **Integração com Google Sheets:** Os dados são puxados diretamente de uma planilha publicada na web como CSV, permitindo atualização fácil e confiável por parte dos gestores.
- **Tratamento de Dados:** Script robusto para limpar e formatar valores monetários e nomes, garantindo a integridade dos dados exibidos.
- **Gráfico de Pizza (Doughnut):** Visualização da fatia de mercado de cada vendedor utilizando `Chart.js`, com padrões de cores personalizados para times específicos (ex: Corinthians, Palmeiras, Flamengo).
- **Tabela de Classificação:** Lista ordenada dos vendedores com suas respectivas posições e faturamentos.

### 🔊 Áudio e Efeitos
- **Confetes:** Efeito de chuva de confetes ao carregar o dashboard para celebrar os resultados.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3:** Estrutura e estilização.
- **JavaScript (ES6+):** Lógica da aplicação, manipulação do DOM e consumo de dados.
- **Bootstrap 5:** Framework CSS para layout e componentes.
- **Chart.js:** Biblioteca para geração de gráficos.
- **Animate.css:** Biblioteca de animações CSS.
- **Canvas Confetti:** Efeito de confetes.
- **Google Fonts:** Tipografia personalizada.

## 📂 Estrutura de Arquivos

- `index.html`: Arquivo principal contendo a estrutura da página.
- `assets/script.js`: Arquivo contendo toda a lógica JavaScript da aplicação.
- `assets/style.css`: Folha de estilos personalizada.
- `assets/Images/`: Pasta contendo logos e os avatares dos cavalinhos.
- `assets/Sons/`: Pasta contendo os efeitos sonoros.

## ⚙️ Como Executar

1. Clone este repositório.
2. Certifique-se de que as pastas `assets/Images` e `assets/Sons` estejam populadas com os arquivos necessários.
3. Abra o arquivo `index.html` em seu navegador preferido.

---
*Desenvolvido com ❤️ para o Time Brunx!*