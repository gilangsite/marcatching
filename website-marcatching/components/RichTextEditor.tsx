'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  className?: string
  style?: React.CSSProperties
}

const FONT_SIZES = ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem', '1.75rem', '2rem', '2.5rem', '3rem']
const FONT_SIZE_LABELS: Record<string, string> = {
  '0.75rem': '12px',
  '0.875rem': '14px',
  '1rem': '16px',
  '1.125rem': '18px',
  '1.25rem': '20px',
  '1.5rem': '24px',
  '1.75rem': '28px',
  '2rem': '32px',
  '2.5rem': '40px',
  '3rem': '48px',
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#0d3369', '#2563eb', '#dc2626',
  '#16a34a', '#d97706', '#7c3aed', '#db2777', '#94a3b8',
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis di sini...',
  minHeight = 120,
  className = '',
  style = {},
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarState, setToolbarState] = useState({
    visible: false,
    x: 0,
    y: 0,
    bold: false,
    italic: false,
    fontSize: '1rem',
    color: '#ffffff',
    highlight: 'transparent',
    align: 'left',
  })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showFontSizePicker, setShowFontSizePicker] = useState(false)
  const isUpdatingRef = useRef(false)

  // Sync value → editor (only on external change)
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Only update if content is truly different (avoid cursor jump)
    if (el.innerHTML !== value) {
      isUpdatingRef.current = true
      el.innerHTML = value || ''
      isUpdatingRef.current = false
    }
  }, [value])

  // Read computed style at selection
  function readSelectionState() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const bold = document.queryCommandState('bold')
    const italic = document.queryCommandState('italic')
    const color = document.queryCommandValue('foreColor') || '#ffffff'
    // fontSize via queryCommandValue returns legacy '3' etc, so we use getComputedStyle on focus node
    let fontSize = '1rem'
    try {
      const node = sel.focusNode
      const el = node?.nodeType === 1 ? node as Element : node?.parentElement
      if (el) {
        const cs = window.getComputedStyle(el as HTMLElement)
        fontSize = cs.fontSize || '1rem'
        // normalize px → rem (approx)
        if (fontSize.endsWith('px')) {
          const px = parseFloat(fontSize)
          const remVal = px / 16
          // Find closest preset
          const closest = FONT_SIZES.reduce((a, b) => {
            const aRem = parseFloat(a)
            const bRem = parseFloat(b)
            return Math.abs(aRem - remVal) < Math.abs(bRem - remVal) ? a : b
          })
          fontSize = closest
        }
      }
    } catch { /* */ }

    const alignMap: Record<string, string> = {
      justifyLeft: 'left',
      justifyCenter: 'center',
      justifyRight: 'right',
      justifyFull: 'justify',
    }
    let align = 'left'
    for (const [cmd, val] of Object.entries(alignMap)) {
      if (document.queryCommandState(cmd)) { align = val; break }
    }

    // highlight: try to get backgroundColor
    let highlight = 'transparent'
    try {
      const node = sel.focusNode
      const el = node?.nodeType === 1 ? node as Element : node?.parentElement
      if (el) {
        const bg = (el as HTMLElement).style.backgroundColor || window.getComputedStyle(el as HTMLElement).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          highlight = bg
        }
      }
    } catch { /* */ }

    return { bold, italic, fontSize, color, highlight, align }
  }

  const showToolbar = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarState(s => ({ ...s, visible: false }))
      setShowColorPicker(false)
      setShowHighlightPicker(false)
      setShowFontSizePicker(false)
      return
    }

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const editor = editorRef.current
    if (!editor) return

    const editorRect = editor.getBoundingClientRect()

    const state = readSelectionState()
    setToolbarState({
      visible: true,
      x: rect.left - editorRect.left + rect.width / 2,
      y: rect.top - editorRect.top - 8,
      ...(state || {}),
    } as any)
  }, [])

  function hideToolbar() {
    setToolbarState(s => ({ ...s, visible: false }))
    setShowColorPicker(false)
    setShowHighlightPicker(false)
    setShowFontSizePicker(false)
  }

  function handleInput() {
    if (isUpdatingRef.current) return
    const el = editorRef.current
    if (!el) return
    onChange(el.innerHTML)
  }

  function execCmd(cmd: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
    handleInput()
    // Re-read state after command
    const state = readSelectionState()
    if (state) {
      setToolbarState(s => ({ ...s, ...state }))
    }
  }

  function handleAlign(align: string) {
    const cmdMap: Record<string, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull',
    }
    execCmd(cmdMap[align] || 'justifyLeft')
    setToolbarState(s => ({ ...s, align }))
  }

  function handleFontSize(size: string) {
    // execCommand fontSize uses 1-7, we use inline span instead
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    editorRef.current?.focus()
    // Wrap selection in a span with font-size style
    const range = sel.getRangeAt(0)
    const span = document.createElement('span')
    span.style.fontSize = size
    try {
      range.surroundContents(span)
    } catch {
      // If range spans multiple elements, use extractContents
      const frag = range.extractContents()
      span.appendChild(frag)
      range.insertNode(span)
    }
    handleInput()
    setToolbarState(s => ({ ...s, fontSize: size }))
    setShowFontSizePicker(false)
  }

  function handleColor(color: string) {
    execCmd('foreColor', color)
    setToolbarState(s => ({ ...s, color }))
    setShowColorPicker(false)
  }

  function handleHighlight(color: string) {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    editorRef.current?.focus()
    const range = sel.getRangeAt(0)
    const span = document.createElement('span')
    if (color === 'transparent' || color === 'none') {
      span.style.backgroundColor = ''
    } else {
      span.style.backgroundColor = color
    }
    try {
      range.surroundContents(span)
    } catch {
      const frag = range.extractContents()
      span.appendChild(frag)
      range.insertNode(span)
    }
    handleInput()
    setToolbarState(s => ({ ...s, highlight: color }))
    setShowHighlightPicker(false)
  }

  // Prevent toolbar clicks from collapsing selection
  function onToolbarMouseDown(e: React.MouseEvent) {
    e.preventDefault()
  }

  const editorStyle: React.CSSProperties = {
    minHeight,
    outline: 'none',
    lineHeight: 1.7,
    color: 'inherit',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    fontSize: '1rem',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    background: '#ffffff',
    ...style,
  }

  return (
    <div style={{ position: 'relative' }} className={className}>
      {/* Floating toolbar */}
      {toolbarState.visible && (
        <div
          ref={toolbarRef}
          onMouseDown={onToolbarMouseDown}
          style={{
            position: 'absolute',
            zIndex: 9999,
            left: Math.max(0, toolbarState.x - 180),
            top: toolbarState.y - 50,
            background: '#1e293b',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '5px 8px',
            flexWrap: 'wrap',
            maxWidth: 400,
            minWidth: 320,
            pointerEvents: 'all',
          }}
        >
          {/* Bold */}
          <ToolbarBtn
            active={toolbarState.bold}
            onClick={() => execCmd('bold')}
            title="Bold (Ctrl+B)"
          >
            <b style={{ fontSize: 13 }}>B</b>
          </ToolbarBtn>

          {/* Italic */}
          <ToolbarBtn
            active={toolbarState.italic}
            onClick={() => execCmd('italic')}
            title="Italic (Ctrl+I)"
          >
            <i style={{ fontSize: 13 }}>I</i>
          </ToolbarBtn>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 3px' }} />

          {/* Alignment */}
          <ToolbarBtn active={toolbarState.align === 'left'} onClick={() => handleAlign('left')} title="Rata Kiri">
            <AlignLeftIcon />
          </ToolbarBtn>
          <ToolbarBtn active={toolbarState.align === 'center'} onClick={() => handleAlign('center')} title="Rata Tengah">
            <AlignCenterIcon />
          </ToolbarBtn>
          <ToolbarBtn active={toolbarState.align === 'right'} onClick={() => handleAlign('right')} title="Rata Kanan">
            <AlignRightIcon />
          </ToolbarBtn>
          <ToolbarBtn active={toolbarState.align === 'justify'} onClick={() => handleAlign('justify')} title="Rata Kanan-Kiri">
            <AlignJustifyIcon />
          </ToolbarBtn>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 3px' }} />

          {/* Font size */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseDown={e => { e.preventDefault(); setShowFontSizePicker(p => !p); setShowColorPicker(false); setShowHighlightPicker(false) }}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                color: '#fff', padding: '4px 8px', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', minWidth: 38, display: 'flex', alignItems: 'center', gap: 3,
              }}
              title="Ukuran Font"
            >
              {FONT_SIZE_LABELS[toolbarState.fontSize] || '16px'}
              <span style={{ fontSize: 9 }}>▼</span>
            </button>
            {showFontSizePicker && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, background: '#1e293b', borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: 6, zIndex: 10000, minWidth: 80,
                display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4,
              }}>
                {FONT_SIZES.map(size => (
                  <button
                    key={size}
                    onMouseDown={e => { e.preventDefault(); handleFontSize(size) }}
                    style={{
                      background: toolbarState.fontSize === size ? 'rgba(37,99,235,0.5)' : 'transparent',
                      border: 'none', borderRadius: 5, color: '#fff', padding: '5px 10px',
                      fontSize: 12, cursor: 'pointer', textAlign: 'left', fontWeight: toolbarState.fontSize === size ? 700 : 400,
                    }}
                  >
                    {FONT_SIZE_LABELS[size]} <span style={{ opacity: 0.5, fontSize: 10 }}>({size})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text color */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseDown={e => { e.preventDefault(); setShowColorPicker(p => !p); setShowFontSizePicker(false); setShowHighlightPicker(false) }}
              title="Warna Teks"
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                cursor: 'pointer', padding: '4px 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 700, lineHeight: 1 }}>A</span>
              <span style={{ width: 16, height: 3, background: toolbarState.color, borderRadius: 2, display: 'block' }} />
            </button>
            {showColorPicker && (
              <ColorPicker
                colors={PRESET_COLORS}
                onSelect={handleColor}
                allowCustom
              />
            )}
          </div>

          {/* Highlight */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseDown={e => { e.preventDefault(); setShowHighlightPicker(p => !p); setShowFontSizePicker(false); setShowColorPicker(false) }}
              title="Highlight / Latar Teks"
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                cursor: 'pointer', padding: '4px 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ fontSize: 11, color: '#fff', lineHeight: 1 }}>✦</span>
              <span style={{ width: 16, height: 3, background: toolbarState.highlight === 'transparent' ? 'rgba(255,255,255,0.3)' : toolbarState.highlight, borderRadius: 2, display: 'block' }} />
            </button>
            {showHighlightPicker && (
              <ColorPicker
                colors={['transparent', '#fef9c3', '#dcfce7', '#dbeafe', '#fce7f3', '#ffe4e6', '#f3e8ff', '#ffedd5', '#f0fdf4']}
                onSelect={handleHighlight}
                transparentOption
              />
            )}
          </div>

          {/* Clear formatting */}
          <ToolbarBtn active={false} onClick={() => execCmd('removeFormat')} title="Hapus Format">
            <span style={{ fontSize: 10, opacity: 0.8 }}>✕F</span>
          </ToolbarBtn>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={showToolbar}
        onKeyUp={e => {
          showToolbar()
          // Update on key up
        }}
        onBlur={() => {
          // Delay to allow toolbar click to register
          setTimeout(hideToolbar, 200)
        }}
        data-placeholder={placeholder}
        style={editorStyle}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function ToolbarBtn({ children, active, onClick, title }: { children: React.ReactNode, active: boolean, onClick: () => void, title?: string }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        background: active ? 'rgba(37,99,235,0.6)' : 'rgba(255,255,255,0.1)',
        border: active ? '1px solid rgba(37,99,235,0.8)' : '1px solid transparent',
        borderRadius: 6, color: '#fff', padding: '4px 7px', cursor: 'pointer',
        fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 28, transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function ColorPicker({ colors, onSelect, allowCustom, transparentOption }: {
  colors: string[]
  onSelect: (c: string) => void
  allowCustom?: boolean
  transparentOption?: boolean
}) {
  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, background: '#1e293b', borderRadius: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: 10, zIndex: 10000,
      display: 'flex', flexWrap: 'wrap', gap: 5, minWidth: 160, marginTop: 4,
    }}>
      {transparentOption && (
        <button
          onMouseDown={e => { e.preventDefault(); onSelect('transparent') }}
          title="Hapus Highlight"
          style={{
            width: 22, height: 22, borderRadius: 4, cursor: 'pointer',
            background: 'transparent', border: '1.5px dashed rgba(255,255,255,0.4)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>×</span>
        </button>
      )}
      {colors.filter(c => c !== 'transparent').map(c => (
        <button
          key={c}
          onMouseDown={e => { e.preventDefault(); onSelect(c) }}
          title={c}
          style={{
            width: 22, height: 22, borderRadius: 4, cursor: 'pointer',
            background: c, border: '1.5px solid rgba(255,255,255,0.25)',
            transition: 'transform 0.12s',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = 'scale(1.2)' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = 'scale(1)' }}
        />
      ))}
      {allowCustom && (
        <label title="Pilih warna custom" style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', cursor: 'pointer', border: '1.5px solid rgba(255,255,255,0.25)', background: 'linear-gradient(135deg, #f00, #0f0, #00f)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <input type="color" onChange={e => onSelect(e.target.value)} onMouseDown={e => e.stopPropagation()} style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', cursor: 'pointer' }} />
        </label>
      )}
    </div>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────

const iconStyle: React.CSSProperties = { width: 13, height: 13, fill: 'currentColor', display: 'block' }

function AlignLeftIcon() {
  return (
    <svg style={iconStyle} viewBox="0 0 24 24">
      <path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/>
    </svg>
  )
}
function AlignCenterIcon() {
  return (
    <svg style={iconStyle} viewBox="0 0 24 24">
      <path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z"/>
    </svg>
  )
}
function AlignRightIcon() {
  return (
    <svg style={iconStyle} viewBox="0 0 24 24">
      <path d="M3 5h18v2H3V5zm6 4h12v2H9V9zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z"/>
    </svg>
  )
}
function AlignJustifyIcon() {
  return (
    <svg style={iconStyle} viewBox="0 0 24 24">
      <path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
    </svg>
  )
}
