
import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import Card from './Card';

interface Formula {
  id: string;
  name: string;
  formula: string;
  description: string;
  explanation: string[];
}

const formulas: Formula[] = [
  {
    id: 'pp',
    name: 'Ponto de Pedido (PP)',
    formula: 'PP = (D \\times LT) + SS',
    description: 'Define quando é necessário fazer um novo pedido de compra',
    explanation: [
      'PP = Ponto de Pedido (quantidade mínima para disparar compra)',
      'D = Demanda diária média (calculada pela IA)',
      'LT = Lead Time (tempo de entrega do fornecedor)',
      'SS = Estoque de Segurança (buffer para imprevistos)'
    ]
  },
  {
    id: 'ss',
    name: 'Estoque de Segurança (SS)',
    formula: 'SS = Z \\times \\sigma \\times \\sqrt{LT}',
    description: 'Calcula o buffer necessário para cobrir variações de demanda e lead time',
    explanation: [
      'Z = Coeficiente de confiança (ex: 1.65 para 95% de confiança)',
      'σ (sigma) = Desvio padrão da demanda',
      'LT = Lead Time em dias',
      'Quanto maior Z, maior proteção contra stockouts'
    ]
  },
  {
    id: 'mape',
    name: 'MAPE - Mean Absolute Percentage Error',
    formula: 'MAPE = \\frac{1}{n} \\sum_{i=1}^{n} \\left|\\frac{Actual_i - Forecast_i}{Actual_i}\\right| \\times 100\\%',
    description: 'Mede a precisão das previsões em termos de erro percentual',
    explanation: [
      'Calcula o erro médio percentual entre valores reais e previstos',
      'Valores menores indicam maior precisão',
      'MAPE < 10% = Excelente precisão',
      'MAPE 10-20% = Boa precisão',
      'MAPE > 20% = Precisão ruim'
    ]
  },
  {
    id: 'rmse',
    name: 'RMSE - Root Mean Squared Error',
    formula: 'RMSE = \\sqrt{\\frac{1}{n} \\sum_{i=1}^{n} (Actual_i - Forecast_i)^2}',
    description: 'Mede a magnitude do erro, penalizando mais erros grandes',
    explanation: [
      'RMSE penaliza mais os erros grandes do que a MAE',
      'Usado para comparar modelos de forecast',
      'Unidade é a mesma da variável prevista',
      'Menor RMSE = Melhor modelo'
    ]
  },
  {
    id: 'mae',
    name: 'MAE - Mean Absolute Error',
    formula: 'MAE = \\frac{1}{n} \\sum_{i=1}^{n} |Actual_i - Forecast_i|',
    description: 'Erro médio absoluto, fácil de interpretar',
    explanation: [
      'Representa o erro médio em unidades da variável',
      'Não penaliza erros grandes mais que pequenos',
      'Mais robusto a outliers que RMSE',
      'Útil para comunicação com gestores'
    ]
  },
  {
    id: 'ensemble',
    name: 'Ensemble de Modelos',
    formula: '\\hat{y} = w_1 \\cdot \\hat{y}_{ARIMA} + w_2 \\cdot \\hat{y}_{Prophet} + w_3 \\cdot \\hat{y}_{LSTM}',
    description: 'Combina previsões de múltiplos modelos para maior precisão',
    explanation: [
      'w₁, w₂, w₃ = Pesos de cada modelo (somam 1.0)',
      'ARIMA: Boa para padrões sazonais',
      'Prophet: Excelente para feriados e eventos',
      'LSTM: Captura complexidades não-lineares',
      'Ensemble reduz overfitting e aumenta robustez'
    ]
  }
];

const FormulaExplainer: React.FC = () => {
  const [selectedFormula, setSelectedFormula] = useState<string>('pp');
  const [calcValues, setCalcValues] = useState<{ [key: string]: number }>({
    pp_demand: 15,
    pp_lt: 10,
    pp_ss: 25,
    ss_z: 1.65,
    ss_sigma: 8,
    ss_lt: 10
  });

  const currentFormula = formulas.find(f => f.id === selectedFormula);

  const calculatePP = () => {
    const D = calcValues.pp_demand || 0;
    const LT = calcValues.pp_lt || 0;
    const SS = calcValues.pp_ss || 0;
    return Math.round(D * LT + SS);
  };

  const calculateSS = () => {
    const Z = calcValues.ss_z || 0;
    const sigma = calcValues.ss_sigma || 0;
    const LT = calcValues.ss_lt || 0;
    return Math.round(Z * sigma * Math.sqrt(LT));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-2xl font-bold text-brand-lightest-slate mb-6">
          📐 Fórmulas Matemáticas de Previsão de Demanda
        </h3>
        
        {/* Formula Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {formulas.map((formula) => (
            <button
              key={formula.id}
              onClick={() => setSelectedFormula(formula.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedFormula === formula.id
                  ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                  : 'border-brand-light-navy/50 hover:border-brand-cyan/50 text-brand-slate'
              }`}
            >
              <div className="text-sm font-semibold">{formula.name.split('(')[0]}</div>
            </button>
          ))}
        </div>

        {/* Current Formula Display */}
        {currentFormula && (
          <div className="bg-brand-navy/70 rounded-xl p-6 border border-brand-light-navy/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-brand-lightest-slate">
                {currentFormula.name}
              </h4>
              <div className="text-brand-cyan text-sm font-mono">
                {currentFormula.description}
              </div>
            </div>

            {/* Formula Display */}
            <div className="bg-brand-blue rounded-lg p-4 mb-4">
              <BlockMath math={currentFormula.formula} />
            </div>

            {/* Explanation */}
            <div className="space-y-2 mb-4">
              <h5 className="text-brand-cyan font-semibold">Explicação:</h5>
              <ul className="list-disc list-inside space-y-1 text-brand-slate">
                {currentFormula.explanation.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            {/* Interactive Calculators */}
            {selectedFormula === 'pp' && (
              <div className="mt-6 border-t border-brand-light-navy/30 pt-6">
                <h5 className="text-brand-cyan font-semibold mb-4">🧮 Calculadora Interativa - PP</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-brand-slate text-sm mb-2">Demanda Diária (D)</label>
                    <input
                      type="number"
                      value={calcValues.pp_demand}
                      onChange={(e) => setCalcValues({...calcValues, pp_demand: parseFloat(e.target.value)})}
                      className="w-full bg-brand-navy/50 border border-brand-light-navy/30 rounded-lg px-3 py-2 text-brand-lightest-slate focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-slate text-sm mb-2">Lead Time (LT) dias</label>
                    <input
                      type="number"
                      value={calcValues.pp_lt}
                      onChange={(e) => setCalcValues({...calcValues, pp_lt: parseFloat(e.target.value)})}
                      className="w-full bg-brand-navy/50 border border-brand-light-navy/30 rounded-lg px-3 py-2 text-brand-lightest-slate focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-slate text-sm mb-2">Estoque Segurança (SS)</label>
                    <input
                      type="number"
                      value={calcValues.pp_ss}
                      onChange={(e) => setCalcValues({...calcValues, pp_ss: parseFloat(e.target.value)})}
                      className="w-full bg-brand-navy/50 border border-brand-light-navy/30 rounded-lg px-3 py-2 text-brand-lightest-slate focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-brand-slate">Resultado:</span>
                    <span className="text-3xl font-bold text-green-400">
                      PP = {calculatePP()} unidades
                    </span>
                  </div>
                  <div className="text-brand-slate text-sm mt-2">
                    <InlineMath math={`PP = ${calcValues.pp_demand} \\times ${calcValues.pp_lt} + ${calcValues.pp_ss} = ${calculatePP()}`} />
                  </div>
                </div>
              </div>
            )}

            {selectedFormula === 'ss' && (
              <div className="mt-6 border-t border-brand-light-navy/30 pt-6">
                <h5 className="text-brand-cyan font-semibold mb-4">🧮 Calculadora Interativa - SS</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-brand-slate text-sm mb-2">Coeficiente Z (Confiança)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calcValues.ss_z}
                      onChange={(e) => setCalcValues({...calcValues, ss_z: parseFloat(e.target.value)})}
                      className="w-full bg-brand-navy/50 border border-brand-light-navy/30 rounded-lg px-3 py-2 text-brand-lightest-slate focus:border-brand-cyan focus:outline-none"
                    />
                    <div className="text-xs text-brand-slate mt-1">
                      (1.28=90%, 1.65=95%, 2.33=99%)
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-slate text-sm mb-2">Desvio Padrão (σ)</label>
                    <input
                      type="number"
                      value={calcValues.ss_sigma}
                      onChange={(e) => setCalcValues({...calcValues, ss_sigma: parseFloat(e.target.value)})}
                      className="w-full bg-brand-navy/50 border border-brand-light-navy/30 rounded-lg px-3 py-2 text-brand-lightest-slate focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-slate text-sm mb-2">Lead Time (LT) dias</label>
                    <input
                      type="number"
                      value={calcValues.ss_lt}
                      onChange={(e) => setCalcValues({...calcValues, ss_lt: parseFloat(e.target.value)})}
                      className="w-full bg-brand-navy/50 border border-brand-light-navy/30 rounded-lg px-3 py-2 text-brand-lightest-slate focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-brand-slate">Resultado:</span>
                    <span className="text-3xl font-bold text-green-400">
                      SS = {calculateSS()} unidades
                    </span>
                  </div>
                  <div className="text-brand-slate text-sm mt-2">
                    <InlineMath math={`SS = ${calcValues.ss_z} \\times ${calcValues.ss_sigma} \\times \\sqrt{${calcValues.ss_lt}} = ${calcValues.ss_z} \\times ${calcValues.ss_sigma} \\times ${Math.sqrt(calcValues.ss_lt).toFixed(2)} = ${calculateSS()}`} />
                  </div>
                </div>
              </div>
            )}

            {/* Example Calculation */}
            <div className="mt-6 bg-brand-light-navy/20 rounded-lg p-4 border border-brand-light-navy/30">
              <h5 className="text-brand-cyan font-semibold mb-2">💡 Exemplo Prático - Nova Corrente</h5>
              {selectedFormula === 'pp' && (
                <div className="text-brand-slate text-sm space-y-1">
                  <p>Suponha que a demanda diária para {'"'}Transceptor 5G{'"'} seja 15 unidades.</p>
                  <p>O fornecedor leva 10 dias para entregar (lead time).</p>
                  <p>Temos 25 unidades de estoque de segurança.</p>
                  <p className="text-green-400 font-semibold">
                    → PP = 15 × 10 + 25 = 175 unidades
                  </p>
                  <p className="text-xs mt-2">
                    Quando o estoque chegar a 175 unidades, devemos fazer um novo pedido.
                  </p>
                </div>
              )}
              {selectedFormula === 'mape' && (
                <div className="text-brand-slate text-sm space-y-1">
                  <p>Nosso modelo LSTM obteve MAPE de 10.5%.</p>
                  <p>Isso significa que, em média, nossas previsões têm erro de 10.5%.</p>
                  <p className="text-green-400 font-semibold">
                    → Classificação: Excelente precisão (&lt;10.5%)
                  </p>
                  <p className="text-xs mt-2">
                    Para contexto: MAPE entre 10-20% é considerado {'"'}boa precisão{'"'} na indústria telecom.
                  </p>
                </div>
              )}
              {selectedFormula === 'ensemble' && (
                <div className="text-brand-slate text-sm space-y-1">
                  <p>Combinamos: ARIMA (40%), Prophet (30%), LSTM (30%)</p>
                  <p>ARIMA prevê 100, Prophet prevê 105, LSTM prevê 110</p>
                  <p className="text-green-400 font-semibold">
                    → Previsão Final: 0.4×100 + 0.3×105 + 0.3×110 = 104.5 unidades
                  </p>
                  <p className="text-xs mt-2">
                    Ensemble reduz erro em média 15-20% comparado a modelos individuais.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FormulaExplainer;

