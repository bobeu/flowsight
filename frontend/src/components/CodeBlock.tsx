/**
 * CodeBlock Component
 * 
 * Syntax highlighting for code examples with language-specific colors
 */

'use client'

import { useMemo } from 'react'

interface CodeBlockProps {
  code: string
  language: 'python' | 'javascript' | 'typescript' | 'bash' | 'json' | 'websocket'
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const highlightedCode = useMemo(() => {
    return highlightCode(code, language)
  }, [code, language])

  return (
    <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap text-light-gray">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  )
}

function highlightCode(code: string, language: CodeBlockProps['language']): string {
  // First escape HTML to prevent XSS
  const escaped = escapeHtml(code)
  
  switch (language) {
    case 'python':
      return highlightPython(escaped)
    case 'javascript':
    case 'typescript':
    case 'websocket':
      return highlightJavaScript(escaped)
    case 'bash':
      return highlightBash(escaped)
    case 'json':
      return highlightJSON(escaped)
    default:
      return escaped
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Split text into segments, highlighting only non-HTML parts
function highlightTextSegments(text: string, highlightFn: (text: string) => string): string {
  const segments: string[] = []
  let lastIndex = 0
  
  // Find all HTML tags (escaped as &lt;span...&gt;)
  const tagPattern = /&lt;span[^&]*&gt;.*?&lt;\/span&gt;/g
  let match
  
  while ((match = tagPattern.exec(text)) !== null) {
    // Add text before tag (highlight it)
    if (match.index > lastIndex) {
      const textSegment = text.substring(lastIndex, match.index)
      segments.push(highlightFn(textSegment))
    }
    // Add tag as-is
    segments.push(match[0])
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text (highlight it)
  if (lastIndex < text.length) {
    const textSegment = text.substring(lastIndex)
    segments.push(highlightFn(textSegment))
  }
  
  // If no tags found, highlight entire text
  if (segments.length === 0) {
    return highlightFn(text)
  }
  
  return segments.join('')
}

function highlightPython(code: string): string {
  // First highlight comments and strings (these create spans)
  code = code.replace(/(#.*$)/gm, '<span style="color: #888888">$1</span>')
  code = code.replace(/(&quot;[^&]*&quot;)/g, '<span style="color: #00FF00">$1</span>')
  code = code.replace(/(&#039;[^&]*&#039;)/g, '<span style="color: #00FF00">$1</span>')
  
  // Now highlight the remaining parts
  return highlightTextSegments(code, (text) => {
    let highlighted = text
    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #FFD700">$1</span>')
    // Keywords
    const keywords = /\b(import|from|def|class|if|elif|else|for|while|try|except|finally|with|as|return|yield|lambda|and|or|not|in|is|None|True|False|async|await)\b/g
    highlighted = highlighted.replace(keywords, '<span style="color: #00FFFF">$&</span>')
    // Function calls
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=&lt;)/g, '<span style="color: #00FFFF">$1</span>')
    return highlighted
  })
}

function highlightJavaScript(code: string): string {
  // First highlight comments, template literals, and strings
  code = code.replace(/(\/\/.*$)/gm, '<span style="color: #888888">$1</span>')
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #888888">$1</span>')
  
  // Template literals (backticks don't get escaped)
  code = code.replace(/(`[^`]*`)/g, (match) => {
    const inner = match.replace(/\$\{([^}]+)\}/g, '<span style="color: #00FFFF">${</span><span style="color: #FFD700">$1</span><span style="color: #00FFFF">}</span>')
    return `<span style="color: #00FF00">${inner}</span>`
  })
  
  code = code.replace(/(&quot;[^&]*&quot;)/g, '<span style="color: #00FF00">$1</span>')
  code = code.replace(/(&#039;[^&]*&#039;)/g, '<span style="color: #00FF00">$1</span>')
  
  // Now highlight the remaining parts
  return highlightTextSegments(code, (text) => {
    let highlighted = text
    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #FFD700">$1</span>')
    // TypeScript types
    highlighted = highlighted.replace(/\b(string|number|boolean|object|any|void|never|unknown|bigint|symbol)\b/g, '<span style="color: #BB86FC">$&</span>')
    // Keywords
    const keywords = /\b(const|let|var|function|async|await|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|class|extends|super|static|import|export|from|default|typeof|instanceof|in|of|true|false|null|undefined)\b/g
    highlighted = highlighted.replace(keywords, '<span style="color: #00FFFF">$&</span>')
    // Function calls
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=&lt;)/g, '<span style="color: #00FFFF">$1</span>')
    // Object properties
    highlighted = highlighted.replace(/([a-zA-Z_][a-zA-Z0-9_]*)(:)/g, '<span style="color: #00CCFF">$1</span>$2')
    return highlighted
  })
}

function highlightBash(code: string): string {
  // First highlight comments and strings
  code = code.replace(/(#.*$)/gm, '<span style="color: #888888">$1</span>')
  code = code.replace(/(&quot;[^&]*&quot;)/g, '<span style="color: #00FF00">$1</span>')
  code = code.replace(/(&#039;[^&]*&#039;)/g, '<span style="color: #00FF00">$1</span>')
  code = code.replace(/(https?:&lt;\/&lt;\/[^\s&quot;&#039;]+)/g, '<span style="color: #00FFFF">$1</span>')
  
  // Now highlight the remaining parts
  return highlightTextSegments(code, (text) => {
    let highlighted = text
    // Commands
    highlighted = highlighted.replace(/^\s*(curl|wget|git|npm|yarn|echo|export|cd|ls|mkdir|rm|cp|mv)\b/gm, '<span style="color: #00FFFF">$&</span>')
    // Flags
    highlighted = highlighted.replace(/(-[a-zA-Z]|--[a-zA-Z-]+)/g, '<span style="color: #00CCFF">$&</span>')
    return highlighted
  })
}

function highlightJSON(code: string): string {
  // Brackets first
  code = code.replace(/([{}[\],])/g, '<span style="color: #00FFFF">$1</span>')
  
  // Now highlight the remaining parts
  return highlightTextSegments(code, (text) => {
    let highlighted = text
    // Booleans
    highlighted = highlighted.replace(/:\s*(true|false|null)\b/g, ': <span style="color: #BB86FC">$1</span>')
    // Numbers
    highlighted = highlighted.replace(/:\s*(\d+\.?\d*)/g, ': <span style="color: #FFD700">$1</span>')
    // String values
    highlighted = highlighted.replace(/:\s*(&quot;[^&quot;]*&quot;)/g, ': <span style="color: #00FF00">$1</span>')
    // Keys
    highlighted = highlighted.replace(/(&quot;[^&quot;]+&quot;):/g, '<span style="color: #00CCFF">$1</span>:')
    return highlighted
  })
}
