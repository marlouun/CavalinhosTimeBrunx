# Cavalinhos Time Brunx - Julho corrigido v3

Correcoes aplicadas:

- Julho passa a ler diretamente a aba publicada do Google Sheets com gid=1466453454.
- A aba de julho e interpretada sem cabecalho, exatamente como no print:
  - A1/B1 = BRUNO O. e valor
  - A2/B2 = DARIELE e valor
  - A3/B3 = DANIELE e valor
  - A4/B4 = EMILY e valor
  - A5/B5 = EVERTON e valor
  - A6/B6 = JANAINA e valor
  - A7/B7 = JACIARA e valor
  - A8/B8 = LEANDRA e valor
  - A9/B9 = MAEVELIM e valor
  - A10/B10 = VITORIA e valor
- O ranking mantem os mesmos 10 vendedores e atualiza somente o faturamento conforme a coluna B.
- O parser de CSV foi reforcado para valores em reais com ponto de milhar e virgula decimal.
- O projeto usa cache busting e fetch com cache no-store para evitar valores travados no navegador.
- O dashboard atualiza automaticamente a cada 30 segundos.
