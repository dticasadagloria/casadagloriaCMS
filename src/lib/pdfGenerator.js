import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const gerarFichaPDF = ({
  titulo = "Ficha",
  dados = [],
  nomeFicheiro = "documento.pdf",
  mostrarRodape = true,
  logo = null,
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ====== CORES ======
  const DOURADO = [212, 175, 55];
  const DOURADO_ESCURO = [160, 120, 20];
  const CINZA_ESCURO = [40, 40, 40];
  const BRANCO = [255, 255, 255];

  // ====== FAIXA DE FUNDO DO CABEÇALHO ======
  doc.setFillColor(...CINZA_ESCURO);
  doc.rect(0, 0, pageWidth, 50, "F");

  // ====== LINHA DOURADA DECORATIVA (topo) ======
  doc.setFillColor(...DOURADO);
  doc.rect(0, 0, pageWidth, 3, "F");

  // ====== LOGO (centralizado) ======
 let logoBottomY = 10;
if (logo) {
  // Cria um elemento de imagem temporário para obter as dimensões originais
  const img = new Image();
  img.src = logo;

  const logoH = 22; // mantém altura fixa para não quebrar o layout
  const ratio = img.naturalWidth / img.naturalHeight;
  const logoW = logoH * ratio || 22; // calcula largura proporcional ao original
  const logoX = (pageWidth - logoW) / 2; // centraliza

  doc.addImage(logo, "PNG", logoX, 6, logoW, logoH);
  logoBottomY = 30;
} else {
  logoBottomY = 10;
}

  // ====== NOME DA IGREJA (centralizado) ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DOURADO);
  doc.text(
    "Igreja Internacional Casa da Glória da Palavra",
    pageWidth / 2,
    logo ? logoBottomY + 5 : logoBottomY + 6,
    { align: "center" }
  );

  // ====== TÍTULO DA FICHA (centralizado) ======
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(210, 210, 210);
  doc.text(titulo.toUpperCase(), pageWidth / 2, logo ? logoBottomY + 13 : logoBottomY + 14, {
    align: "center",
  });

  // ====== LINHA DOURADA DECORATIVA (fundo do header) ======
  doc.setFillColor(...DOURADO);
  doc.rect(0, 50, pageWidth, 1.5, "F");

  // ====== TABELA ======
  autoTable(doc, {
    startY: 57,
    head: [["Campo", "Informação"]],
    body: dados,
    theme: "grid",
    headStyles: {
      fillColor: DOURADO_ESCURO,
      textColor: BRANCO,
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: CINZA_ESCURO,
    },
    alternateRowStyles: {
      fillColor: [252, 248, 235], // dourado bem suave
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        textColor: DOURADO_ESCURO,
        cellWidth: 60,
      },
      1: {
        cellWidth: "auto",
      },
    },
    tableLineColor: [220, 200, 150],
    tableLineWidth: 0.3,
    margin: { left: 14, right: 14 },
  });

  // ====== LINHA DOURADA ANTES DO RODAPÉ ======
  const rodapeY = pageHeight - 18;
  doc.setDrawColor(...DOURADO);
  doc.setLineWidth(0.5);
  doc.line(14, rodapeY - 4, pageWidth - 14, rodapeY - 4);

  // ====== RODAPÉ ======
  if (mostrarRodape) {
    const anoAtual = new Date().getFullYear();
    const dataGeracao = `Gerado em ${new Date().toLocaleString("pt-MZ")}`;
    const textoAno = `© ${anoAtual} — Ano de Impacto`;

    doc.setFontSize(8);
    doc.setTextColor(130, 100, 30); // tom dourado escuro

    // Lado esquerdo: data de geração
    doc.text(dataGeracao, 14, rodapeY);

    // Lado direito: Ano de impacto
    doc.text(textoAno, pageWidth - 14, rodapeY, { align: "right" });
  }

  // ====== BORDA LATERAL DOURADA (decoração elegante) ======
  doc.setFillColor(...DOURADO);
  doc.rect(0, pageHeight - 3, pageWidth, 3, "F");

  doc.save(nomeFicheiro);
};