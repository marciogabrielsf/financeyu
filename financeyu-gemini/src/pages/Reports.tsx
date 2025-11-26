import { useState, useRef } from "react";
import { FileText, Download, Filter, Check, Search } from "lucide-react";
import { useFinance } from "../hooks/useFinance";
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Debtor, Debt } from "../types";

// Estilos do PDF
const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: '#18181b',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    paddingBottom: 20,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  debtorCard: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  debtorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
    paddingBottom: 15,
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debtorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  debtorSubtitle: {
    fontSize: 9,
    color: '#a1a1aa',
    marginTop: 2,
  },
  debtorTotal: {
    marginLeft: 'auto',
    textAlign: 'right',
  },
  debtorTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  cardGroup: {
    marginBottom: 15,
  },
  cardGroupTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#d4d4d8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  debtRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  debtDescription: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#f4f4f5',
  },
  debtDate: {
    fontSize: 8,
    color: '#a1a1aa',
    marginTop: 2,
  },
  debtRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  installmentBadge: {
    backgroundColor: '#3f3f46',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  installmentText: {
    fontSize: 8,
    color: '#d4d4d8',
  },
  debtAmount: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#ffffff',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3f3f46',
  },
  subtotalLabel: {
    fontSize: 8,
    color: '#a1a1aa',
    marginRight: 6,
  },
  subtotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 20,
    marginTop: 'auto',
  },
  footerLeft: {
    fontSize: 9,
    color: '#a1a1aa',
  },
  footerRight: {
    textAlign: 'right',
  },
  grandTotalLabel: {
    fontSize: 9,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  grandTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

// Tipos para os dados do relatório
interface ReportDataItem {
  debtor: Debtor;
  debtsByCard: Record<string, { name: string; debts: Debt[]; total: number }>;
  total: number;
}

// Componente do documento PDF
const ReportPDF = ({ 
  reportData, 
  grandTotal, 
  currentMonth 
}: { 
  reportData: ReportDataItem[]; 
  grandTotal: number; 
  currentMonth: Date;
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      {/* Header */}
      <View style={pdfStyles.header} fixed>
        <Text style={pdfStyles.title}>Relatório Financeiro</Text>
        <Text style={pdfStyles.subtitle}>
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      {reportData.map((data) => (
        <View key={data.debtor.id} style={pdfStyles.debtorCard} wrap={false}>
          {/* Debtor Header */}
          <View style={pdfStyles.debtorHeader}>
            <View style={pdfStyles.avatar}>
              <Text style={pdfStyles.avatarText}>{data.debtor.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={pdfStyles.debtorName}>{data.debtor.name}</Text>
              <Text style={pdfStyles.debtorSubtitle}>Total a pagar</Text>
            </View>
            <View style={pdfStyles.debtorTotal}>
              <Text style={pdfStyles.debtorTotalValue}>R$ {data.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Debts by Card */}
          {Object.values(data.debtsByCard).map((group) => (
            <View key={group.name} style={pdfStyles.cardGroup}>
              <Text style={pdfStyles.cardGroupTitle}>Cartão: {group.name}</Text>
              
              {group.debts.map((debt, index) => (
                <View 
                  key={debt.id} 
                  style={index < group.debts.length - 1 ? pdfStyles.debtRow : pdfStyles.debtRowLast}
                >
                  <View>
                    <Text style={pdfStyles.debtDescription}>{debt.description}</Text>
                    <Text style={pdfStyles.debtDate}>
                      {format(new Date(debt.date), "dd/MM/yyyy")}
                    </Text>
                  </View>
                  <View style={pdfStyles.debtRight}>
                    {debt.installments && (
                      <View style={pdfStyles.installmentBadge}>
                        <Text style={pdfStyles.installmentText}>
                          {debt.installments.current}/{debt.installments.total}
                        </Text>
                      </View>
                    )}
                    <Text style={pdfStyles.debtAmount}>R$ {debt.amount.toFixed(2)}</Text>
                  </View>
                </View>
              ))}

              <View style={pdfStyles.subtotalRow}>
                <Text style={pdfStyles.subtotalLabel}>Subtotal:</Text>
                <Text style={pdfStyles.subtotalValue}>R$ {group.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View style={pdfStyles.footer} wrap={false}>
        <View>
          <Text style={pdfStyles.footerLeft}>Gerado via FinanceYu</Text>
          <Text style={pdfStyles.footerLeft}>{format(new Date(), "dd/MM/yyyy HH:mm")}</Text>
        </View>
        <View style={pdfStyles.footerRight}>
          <Text style={pdfStyles.grandTotalLabel}>Total Geral</Text>
          <Text style={pdfStyles.grandTotalValue}>R$ {grandTotal.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const Reports = () => {
  const { debtors, cards, isLoading } = useFinance();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [debtorSearch, setDebtorSearch] = useState("");
  const [cardSearch, setCardSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-white">Carregando dados...</div>;
  }

  const currentMonthStr = format(currentMonth, "yyyy-MM");

  // Filtering Logic
  const filteredDebtors = debtors.filter(d => 
    selectedDebtors.length === 0 || selectedDebtors.includes(d.id)
  );

  const getDebtorReport = (debtor: Debtor) => {
    const debts = debtor.debts.filter(debt => {
      const matchesMonth = debt.month === currentMonthStr;
      const matchesCard = selectedCards.length === 0 || (debt.cardId && selectedCards.includes(debt.cardId)) || (!debt.cardId && selectedCards.includes("other"));
      return matchesMonth && matchesCard;
    });

    if (debts.length === 0) return null;

    const total = debts.reduce((acc, debt) => acc + debt.amount, 0);
    
    // Group by Card
    const debtsByCard: Record<string, { name: string, debts: Debt[], total: number }> = {};
    
    debts.forEach(debt => {
        const cardId = debt.cardId || "other";
        if (!debtsByCard[cardId]) {
            const card = cards.find(c => c.id === cardId);
            debtsByCard[cardId] = {
                name: card ? card.name : "Outros / Sem Cartão",
                debts: [],
                total: 0
            };
        }
        debtsByCard[cardId].debts.push(debt);
        debtsByCard[cardId].total += debt.amount;
    });

    return { debtor, debtsByCard, total };
  };

  const reportData = filteredDebtors.map(getDebtorReport).filter(Boolean) as ReportDataItem[];
  const grandTotal = reportData.reduce((acc, data) => acc + (data?.total || 0), 0);

  const handleDownloadPDF = async () => {
    if (reportData.length === 0) return;
    
    try {
      setIsGenerating(true);
      
      // Gerar o PDF usando @react-pdf/renderer
      const blob = await pdf(
        <ReportPDF 
          reportData={reportData} 
          grandTotal={grandTotal} 
          currentMonth={currentMonth} 
        />
      ).toBlob();
      
      // Criar link de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Financeiro_${currentMonthStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error: unknown) {
      console.error("Error generating PDF:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Erro ao gerar PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDebtor = (id: string) => {
    setSelectedDebtors(prev => 
        prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleCard = (id: string) => {
    setSelectedCards(prev => 
        prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Relatórios</h2>
          <p className="text-muted-foreground">
            Gere relatórios detalhados para cobrança.
          </p>
        </div>
        <button 
            onClick={handleDownloadPDF}
            disabled={reportData.length === 0 || isGenerating}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-5 h-5" />
            {isGenerating ? "Gerando..." : "Baixar PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Filters Panel */}
        <div className="lg:col-span-1 space-y-6">
            <div className="glass p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-white/10 pb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    Filtros
                </div>

                {/* Month Selector */}
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Mês de Referência</label>
                    <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                        <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 text-center text-white font-medium">
                            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                        </div>
                        <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Debtors Filter */}
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Devedores</label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Buscar devedor..."
                            value={debtorSearch}
                            onChange={(e) => setDebtorSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {debtors
                            .filter(d => d.name.toLowerCase().includes(debtorSearch.toLowerCase()))
                            .map(debtor => (
                            <button
                                key={debtor.id}
                                onClick={() => toggleDebtor(debtor.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedDebtors.includes(debtor.id) ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'}`}
                            >
                                <span className="text-sm font-medium">{debtor.name}</span>
                                {selectedDebtors.includes(debtor.id) && <Check className="w-4 h-4 text-primary" />}
                            </button>
                        ))}
                         {debtors.filter(d => d.name.toLowerCase().includes(debtorSearch.toLowerCase())).length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nenhum devedor encontrado.</p>}
                    </div>
                </div>

                 {/* Cards Filter */}
                 <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Cartões</label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Buscar cartão..."
                            value={cardSearch}
                            onChange={(e) => setCardSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {cards
                            .filter(c => c.name.toLowerCase().includes(cardSearch.toLowerCase()))
                            .map(card => (
                            <button
                                key={card.id}
                                onClick={() => toggleCard(card.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedCards.includes(card.id) ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'}`}
                            >
                                <span className="text-sm font-medium">{card.name}</span>
                                {selectedCards.includes(card.id) && <Check className="w-4 h-4 text-primary" />}
                            </button>
                        ))}
                        <button
                            onClick={() => toggleCard("other")}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedCards.includes("other") ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'}`}
                            style={{ display: "Outros / Sem Cartão".toLowerCase().includes(cardSearch.toLowerCase()) ? 'flex' : 'none' }}
                        >
                            <span className="text-sm font-medium">Outros / Sem Cartão</span>
                            {selectedCards.includes("other") && <Check className="w-4 h-4 text-primary" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
             <div className="glass p-4 md:p-8 rounded-2xl min-h-[600px] relative overflow-x-auto">
                {reportData.length > 0 ? (
                    <div 
                      ref={reportRef} 
                      style={{ 
                        backgroundColor: '#18181b', 
                        padding: '2rem', 
                        borderRadius: '0.75rem', 
                        color: '#ffffff' 
                      }}
                    >
                        {/* Header */}
                        <div style={{ textAlign: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', marginBottom: '0.5rem', color: '#ffffff' }}>Relatório Financeiro</h1>
                            <p style={{ color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}>
                                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>

                        {/* Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {reportData.map((data) => (
                                <div key={data!.debtor.id} style={{ backgroundColor: '#27272a', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #3f3f46' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #3f3f46', paddingBottom: '1rem' }}>
                                        <div style={{ 
                                          width: '3rem', 
                                          height: '3rem', 
                                          borderRadius: '50%', 
                                          background: 'linear-gradient(to bottom right, #6366f1, #9333ea)', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center', 
                                          fontSize: '1.25rem', 
                                          fontWeight: 'bold', 
                                          color: '#ffffff' 
                                        }}>
                                            {data!.debtor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>{data!.debtor.name}</h3>
                                            <p style={{ fontSize: '0.875rem', color: '#a1a1aa', margin: 0 }}>Total a pagar</p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fafafa', margin: 0 }}>R$ {data!.total.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {Object.values(data!.debtsByCard).map((group) => (
                                            <div key={group.name}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#d4d4d8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <CreditCard style={{ width: '1rem', height: '1rem' }} />
                                                    {group.name}
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {group.debts.map((debt, index) => (
                                                        <div key={debt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: index < group.debts.length - 1 ? '1px solid #3f3f46' : 'none' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: '500', color: '#f4f4f5' }}>{debt.description}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{format(new Date(debt.date), "dd/MM/yyyy")}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                {debt.installments && (
                                                                    <span style={{ fontSize: '0.75rem', backgroundColor: '#3f3f46', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: '#d4d4d8' }}>
                                                                        {debt.installments.current}/{debt.installments.total}
                                                                    </span>
                                                                )}
                                                                <span style={{ fontWeight: '500', color: '#ffffff' }}>R$ {debt.amount.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #3f3f46' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginRight: '0.5rem' }}>Subtotal:</span>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#ffffff' }}>R$ {group.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '1px solid #27272a', paddingTop: '1.5rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
                                <p style={{ margin: 0 }}>Gerado via FinanceYu</p>
                                <p style={{ margin: 0 }}>{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.875rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Geral</p>
                                <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>R$ {grandTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Nenhum dado encontrado para o período.</p>
                        <p className="text-sm">Tente ajustar os filtros.</p>
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for icons
const ChevronLeft = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m15 18-6-6 6-6"/></svg>
)

const ChevronRight = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m9 18 6-6-6-6"/></svg>
)

const CreditCard = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
)
