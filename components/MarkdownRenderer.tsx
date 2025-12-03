import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Settings2, ImageIcon, GitGraph } from 'lucide-react';

// Interface para os componentes renderizados
interface MarkdownRendererProps {
  content: string;
}

// Declaração global
declare global {
  interface Window {
    mermaid: any;
    katex: any;
  }
}

// Componente Interno para Renderizar KaTeX Estático
const KatexComponent: React.FC<{ tex: string; displayMode: boolean; isKatexReady: boolean }> = ({ tex, displayMode, isKatexReady }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isKatexReady && containerRef.current && window.katex) {
      try {
        const html = window.katex.renderToString(tex, {
          throwOnError: false,
          displayMode: displayMode,
          trust: true,
          strict: false
        });
        containerRef.current.innerHTML = html;
      } catch (error) {
        console.error("Erro ao renderizar KaTeX:", error);
        containerRef.current.textContent = tex; 
      }
    }
  }, [tex, displayMode, isKatexReady]);

  return <span ref={containerRef} className={displayMode ? "block my-2 text-center overflow-x-auto custom-scrollbar" : "inline-block px-0.5 align-middle"} />;
};

// Componente para renderizar Mermaid
const MermaidBlock: React.FC<{ chart: string; isMermaidReady: boolean }> = ({ chart, isMermaidReady }) => {
  const [svg, setSvg] = useState<string>('');
  const [isDark, setIsDark] = useState(false);

  // Detectar tema inicial e mudanças
  useEffect(() => {
    const checkTheme = () => document.documentElement.classList.contains('dark');
    setIsDark(checkTheme());

    const observer = new MutationObserver(() => {
      setIsDark(checkTheme());
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (isMermaidReady && window.mermaid) {
      const renderMermaid = async () => {
        try {
          // Reinicializa com tema correto antes de renderizar
          window.mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
          });

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // Sanitização: Envolve texto dentro de colchetes com aspas se não estiverem aspeados.
          // Ex: A[Texto (com) parenteses] -> A["Texto (com) parenteses"]
          const sanitizedChart = chart.replace(/([a-zA-Z0-9_]+)\[([^"\]\n]+?)\]/g, '$1["$2"]');

          const { svg } = await window.mermaid.render(id, sanitizedChart);
          setSvg(svg);
        } catch (error) {
          console.error('Erro ao renderizar Mermaid:', error);
          setSvg(`<div class="p-4 border border-red-200 bg-red-50 text-red-600 rounded text-sm font-mono whitespace-pre-wrap">Erro ao gerar diagrama visual.<br/>Tente recarregar.</div>`);
        }
      };
      renderMermaid();
    }
  }, [chart, isMermaidReady, isDark]);

  if (!isMermaidReady) return <div className="animate-pulse h-32 bg-gray-100 dark:bg-slate-700 rounded-xl mb-4"></div>;

  return (
    <div className="my-4 flex flex-col items-center bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider self-start">
         <GitGraph className="w-4 h-4" /> Diagrama
      </div>
      <div 
        className="w-full overflow-x-auto flex justify-center custom-scrollbar pb-2"
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
};

// Componente para renderizar SVG Seguro
const SvgBlock: React.FC<{ svgCode: string }> = ({ svgCode }) => {
  // Remove declarações XML e força responsividade básica se necessário
  const cleanSvg = svgCode.replace(/<\?xml.*?\?>/, '').trim();

  return (
    <div className="my-4 flex flex-col items-center bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider self-start">
         <ImageIcon className="w-4 h-4" /> Visualização Vetorial
      </div>
      <div 
        className="w-full overflow-x-auto flex justify-center custom-scrollbar pb-2"
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
      />
    </div>
  );
};

// Componente: Matemática Interativa com Sliders
interface VariableConfig {
  name: string;
  defaultValue: number;
  min: number;
  max: number;
  label: string;
}

const InteractiveMath: React.FC<{ rawContent: string; isKatexReady: boolean }> = ({ rawContent, isKatexReady }) => {
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [config, setConfig] = useState<{ template: string; vars: VariableConfig[] } | null>(null);

  useEffect(() => {
    try {
      const parts = rawContent.split('|');
      if (parts.length < 3) return;

      const template = parts[1];
      const vars: VariableConfig[] = [];
      const initialValues: Record<string, number> = {};

      for (let i = 2; i < parts.length; i++) {
        const [name, def, min, max, label] = parts[i].split(':');
        const defVal = parseFloat(def);
        vars.push({
          name,
          defaultValue: defVal,
          min: parseFloat(min),
          max: parseFloat(max),
          label: label || name
        });
        initialValues[name] = defVal;
      }

      setConfig({ template, vars });
      setVariables(initialValues);
    } catch (e) {
      console.error("Erro ao parsear bloco interativo", e);
    }
  }, [rawContent]);

  const handleSliderChange = (name: string, value: number) => {
    setVariables(prev => ({ ...prev, [name]: value }));
  };

  const renderDynamicTex = () => {
    if (!config) return "";
    let tex = config.template;
    config.vars.forEach(v => {
      tex = tex.replace(new RegExp(`\\{${v.name}\\}`, 'g'), variables[v.name]?.toString() || v.defaultValue.toString());
    });
    return tex;
  };

  if (!config) return null;

  return (
    <div className="my-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm transition-all">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
        <Settings2 className="w-4 h-4" />
        Simulação Interativa
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg flex items-center justify-center min-h-[100px]">
        <KatexComponent tex={renderDynamicTex()} displayMode={true} isKatexReady={isKatexReady} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {config.vars.map((v) => (
          <div key={v.name} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{v.label}</label>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400 font-mono">{variables[v.name]}</span>
            </div>
            <input
              type="range"
              min={v.min}
              max={v.max}
              step={(v.max - v.min) / 100}
              value={variables[v.name]}
              onChange={(e) => handleSliderChange(v.name, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
              <span>{v.min}</span>
              <span>{v.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [isKatexReady, setIsKatexReady] = useState(false);
  const [isMermaidReady, setIsMermaidReady] = useState(false);

  // Verificar disponibilidade de KaTeX e Mermaid
  useEffect(() => {
    const checkDependencies = () => {
      let kReady = isKatexReady;
      let mReady = isMermaidReady;

      if (!kReady && typeof window !== 'undefined' && window.katex) {
        setIsKatexReady(true);
        kReady = true;
      }
      if (!mReady && typeof window !== 'undefined' && window.mermaid) {
        setIsMermaidReady(true);
        mReady = true;
      }
      return kReady && mReady;
    };

    if (!checkDependencies()) {
      const interval = setInterval(() => {
        if (checkDependencies()) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isKatexReady, isMermaidReady]);

  // Helper: Processa texto inline para Bold, Italic e Math Inline
  const renderInlineContent = (text: string, keyPrefix: string) => {
    const parts = text.split(/\$((?:\\.|[^$])+?)\$/g);
    
    return parts.map((part, idx) => {
        if (idx % 2 === 1) {
            return <KatexComponent key={`${keyPrefix}-math-${idx}`} tex={part} displayMode={false} isKatexReady={isKatexReady} />;
        }

        const boldParts = part.split(/(\*\*.*?\*\*)/g);
        return boldParts.map((boldPart, bIdx) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                return <strong key={`${keyPrefix}-bold-${idx}-${bIdx}`} className="font-bold text-gray-900 dark:text-white">{boldPart.slice(2, -2)}</strong>;
            }
            
            const italicParts = boldPart.split(/(\*.*?\*)/g);
            return italicParts.map((italicPart, iIdx) => {
                if (italicPart.startsWith('*') && italicPart.endsWith('*') && italicPart.length > 2) {
                     return <em key={`${keyPrefix}-italic-${idx}-${bIdx}-${iIdx}`} className="italic">{italicPart.slice(1, -1)}</em>;
                }
                return <span key={`${keyPrefix}-text-${idx}-${bIdx}-${iIdx}`}>{italicPart}</span>;
            });
        });
    });
  };

  // Parser Principal
  const renderedContent = useMemo(() => {
    if (!content) return null;

    const blocks: Record<string, { type: 'code' | 'math' | 'mermaid' | 'svg', content: string, lang?: string }> = {};
    let blockIdCounter = 0;

    // Substituir Code Blocks (incluindo Mermaid e SVG)
    let processedText = content.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, codeContent) => {
        const id = `__BLOCK_${blockIdCounter++}__`;
        const lowerLang = lang ? lang.toLowerCase() : '';
        
        if (lowerLang === 'mermaid') {
            blocks[id] = { type: 'mermaid', content: codeContent };
        } else if (lowerLang === 'svg') {
            blocks[id] = { type: 'svg', content: codeContent };
        } else {
            blocks[id] = { type: 'code', content: codeContent, lang: lang };
        }
        return `\n${id}\n`;
    });

    // Substituir Block Math ($$ ... $$)
    processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
        const id = `__BLOCK_${blockIdCounter++}__`;
        blocks[id] = { type: 'math', content: mathContent };
        return `\n${id}\n`;
    });

    const lines = processedText.split('\n');
    const nodes: React.ReactNode[] = [];
    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
        if (paragraphBuffer.length > 0) {
            const fullText = paragraphBuffer.join(' ').trim();
            if (fullText) {
                // Reduzido mb-4 para mb-2 para evitar espaços gigantes
                nodes.push(
                    <p key={`p-${nodes.length}`} className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300 text-justify">
                        {renderInlineContent(fullText, `p-${nodes.length}`)}
                    </p>
                );
            }
            paragraphBuffer = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (blocks[trimmedLine]) {
            flushParagraph();
            const block = blocks[trimmedLine];
            
            if (block.type === 'code') {
                nodes.push(
                    <div key={`code-${index}`} className="my-4 relative bg-gray-900 dark:bg-black rounded-lg border border-gray-800 overflow-hidden shadow-sm">
                        {block.lang && <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 uppercase font-mono bg-gray-800 px-2 py-1 rounded z-10 select-none">{block.lang}</span>}
                        <pre className="p-4 text-sm text-gray-100 overflow-x-auto custom-scrollbar font-mono leading-relaxed">
                            <code>{block.content.trim()}</code>
                        </pre>
                    </div>
                );
            } else if (block.type === 'mermaid') {
                nodes.push(<MermaidBlock key={`mermaid-${index}`} chart={block.content} isMermaidReady={isMermaidReady} />);
            } else if (block.type === 'svg') {
                nodes.push(<SvgBlock key={`svg-${index}`} svgCode={block.content} />);
            } else {
                const cleanContent = block.content.trim();
                if (cleanContent.startsWith('INTERACTIVE|')) {
                    nodes.push(<InteractiveMath key={`math-${index}`} rawContent={cleanContent} isKatexReady={isKatexReady} />);
                } else {
                    nodes.push(<KatexComponent key={`math-${index}`} tex={block.content} displayMode={true} isKatexReady={isKatexReady} />);
                }
            }
            return;
        }

        // Headers - Reduzido margens superiores (mt-8 -> mt-6, etc)
        if (trimmedLine.startsWith('#')) {
            flushParagraph();
            const level = trimmedLine.match(/^#+/)?.[0].length || 0;
            const text = trimmedLine.replace(/^#+\s*/, '');
            
            if (level === 1) {
                nodes.push(<h1 key={`h1-${index}`} className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-slate-700">{renderInlineContent(text, `h1-${index}`)}</h1>);
            } else if (level === 2) {
                nodes.push(<h2 key={`h2-${index}`} className="text-xl font-bold mt-5 mb-2 text-gray-800 dark:text-gray-100">{renderInlineContent(text, `h2-${index}`)}</h2>);
            } else {
                nodes.push(<h3 key={`h3-${index}`} className="text-lg font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{renderInlineContent(text, `h3-${index}`)}</h3>);
            }
            return;
        }

        // Listas
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            flushParagraph();
            const text = trimmedLine.substring(2);
            nodes.push(
                <div key={`list-${index}`} className="flex items-start mb-1 ml-4">
                    <span className="mr-3 mt-2 w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></span>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {renderInlineContent(text, `list-${index}`)}
                    </div>
                </div>
            );
            return;
        }

        if (trimmedLine === '') {
            flushParagraph();
            return;
        }

        paragraphBuffer.push(trimmedLine);
    });

    flushParagraph();

    return nodes;

  }, [content, isKatexReady, isMermaidReady]);

  return (
    <div className="markdown-content w-full text-left break-words">
      {renderedContent}
    </div>
  );
};

export default MarkdownRenderer;
