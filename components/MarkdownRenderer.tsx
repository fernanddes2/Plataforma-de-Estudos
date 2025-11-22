import React, { useEffect, useRef, useId } from 'react';

// Make sure KaTeX is available in the global scope from the CDN
declare const katex: any;

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const componentId = useId();

  useEffect(() => {
    if (containerRef.current && typeof katex !== 'undefined') {
      const elements = containerRef.current.querySelectorAll('.math-render');
      elements.forEach((el) => {
        // Prevent re-rendering already processed elements
        if (el.getAttribute('data-katex-rendered') === 'true') return;

        const tex = el.textContent || '';
        const isDisplay = el.classList.contains('math-display');
        try {
          katex.render(tex, el as HTMLElement, {
            throwOnError: false,
            displayMode: isDisplay,
          });
          el.setAttribute('data-katex-rendered', 'true');
        } catch (e) {
          console.error('KaTeX rendering error:', e);
          el.textContent = `[Erro no LaTeX: ${tex}]`; // Fallback to raw TeX with error
        }
      });
    }
  }, [content]);

  const renderContent = () => {
    // Regex to split by code blocks AND LaTeX blocks (display and inline)
    // This preserves multi-line content within each block
    const parts = content.split(/(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\$.*?\$)/g);

    return parts.map((part, index) => {
      const key = `${componentId}-${index}`;

      // Render Code Blocks
      if (part.startsWith('```')) {
        const lang = part.match(/^```(\w*)\n/)?.[1] || '';
        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
        return (
          <div key={key} className="my-4 relative bg-gray-900 dark:bg-black rounded-lg group shadow-lg">
            <span className="absolute top-2 right-3 text-xs text-gray-400 uppercase font-mono select-none">{lang}</span>
            <pre className="p-4 pt-8 text-sm text-white overflow-x-auto rounded-lg custom-scrollbar">
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }

      // Render Display LaTeX
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <div key={key} className="math-render math-display my-4 text-center overflow-x-auto">{part.slice(2, -2)}</div>;
      }
      
      // Render Inline LaTeX
      if (part.startsWith('$') && part.endsWith('$')) {
        return <span key={key} className="math-render math-inline">{part.slice(1, -1)}</span>;
      }

      // Render Plain Text with simple Markdown
      if (part) {
        return part.split('\n').map((line, lineIndex) => {
            const lineKey = `${key}-${lineIndex}`;
            if (line.trim() === '') return null; // Ignore empty lines for cleaner spacing

            if (line.startsWith('# ')) return <h1 key={lineKey} className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">{line.substring(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={lineKey} className="text-2xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={lineKey} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
            if (line.startsWith('---')) return <hr key={lineKey} className="my-6 border-gray-200 dark:border-slate-700" />;
            if (line.startsWith('- ')) return <li key={lineKey} className="ml-6 mb-1 list-disc">{line.substring(2)}</li>;
            
            return <p key={lineKey} className="my-2 leading-relaxed">{line}</p>;
        });
      }

      return null;
    });
  };

  return <div ref={containerRef} className="prose prose-slate dark:prose-invert max-w-none">{renderContent()}</div>;
};

export default MarkdownRenderer;
