import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { GraphNode, GraphEdge } from '../../types/graph';
import { useTheme } from '../../context/ThemeContext';

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  reset: () => void;
  exportPng: () => void;
  centerOnNode: (nodeId: string) => void;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectEdge: (edge: GraphEdge) => void;
  onDeselect: () => void;
  layoutName?: 'cose' | 'concentric' | 'circle' | 'breadthfirst';
  showLabels?: boolean;
  showArrows?: boolean;
  className?: string;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  (
    {
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      onSelectNode,
      onSelectEdge,
      onDeselect,
      layoutName = 'cose',
      showLabels = true,
      showArrows = true,
      className = '',
    },
    ref
  ) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const [hoverInfo, setHoverInfo] = useState<{
      x: number;
      y: number;
      title: string;
      subtitle: string;
      type: string;
    } | null>(null);

    // Expose control actions to parent component
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (cyRef.current) {
          cyRef.current.zoom({
            level: cyRef.current.zoom() * 1.3,
            renderedPosition: {
              x: cyRef.current.width() / 2,
              y: cyRef.current.height() / 2,
            },
          });
        }
      },
      zoomOut: () => {
        if (cyRef.current) {
          cyRef.current.zoom({
            level: cyRef.current.zoom() * 0.75,
            renderedPosition: {
              x: cyRef.current.width() / 2,
              y: cyRef.current.height() / 2,
            },
          });
        }
      },
      fit: () => {
        if (cyRef.current) {
          cyRef.current.fit(undefined, 50);
        }
      },
      reset: () => {
        if (cyRef.current) {
          const layout = cyRef.current.layout(getLayoutConfig(layoutName));
          layout.run();
          setTimeout(() => {
            if (cyRef.current) cyRef.current.fit(undefined, 50);
          }, 350);
        }
      },
      exportPng: () => {
        if (cyRef.current) {
          const pngData = cyRef.current.png({
            full: true,
            scale: 2.5,
            bg: isDark ? '#181C22' : '#FAF7F2',
          });
          const link = document.createElement('a');
          link.download = `academic-graph-${Date.now()}.png`;
          link.href = pngData;
          link.click();
        }
      },
      centerOnNode: (nodeId: string) => {
        if (cyRef.current) {
          const ele = cyRef.current.getElementById(nodeId);
          if (ele && ele.length > 0) {
            cyRef.current.animate({
              center: { eles: ele },
              zoom: 1.4,
              duration: 500,
            });
            ele.select();
          }
        }
      },
    }));

    const getLayoutConfig = (name: string): cytoscape.LayoutOptions => {
      switch (name) {
        case 'concentric':
          return {
            name: 'concentric',
            concentric: (node: any) => node.degree(),
            levelWidth: () => 2,
            padding: 60,
            spacingFactor: 1.5,
            animate: true,
            animationDuration: 600,
          } as any;
        case 'circle':
          return {
            name: 'circle',
            padding: 60,
            spacingFactor: 1.4,
            animate: true,
            animationDuration: 600,
          };
        case 'breadthfirst':
          return {
            name: 'breadthfirst',
            directed: true,
            padding: 60,
            spacingFactor: 1.6,
            animate: true,
            animationDuration: 600,
          };
        case 'cose':
        default:
          return {
            name: 'cose',
            animate: true,
            animationDuration: 800,
            padding: 60,
            nodeOverlap: 4,
            nodeRepulsion: (node: any) => 450000,
            idealEdgeLength: (edge: any) => 140,
            edgeElasticity: (edge: any) => 32,
            nestingFactor: 1.2,
            gravity: 30,
            numIter: 1000,
            initialTemp: 300,
            coolingFactor: 0.98,
            minTemp: 1.0,
            randomize: false,
          } as any;
      }
    };

    // Initialize & update Cytoscape instance
    useEffect(() => {
      if (!containerRef.current) return;

      const elements: cytoscape.ElementDefinition[] = [
        ...nodes.map((n) => {
          let size = 36;
          if (n.data.citationCount) {
            size = Math.min(60, Math.max(38, 32 + Math.log10(n.data.citationCount + 1) * 8));
          } else if (n.type === 'PAPER') {
            size = 44;
          } else if (n.type === 'CHUNK') {
            size = 26;
          }

          return {
            group: 'nodes' as const,
            data: {
              id: n.id,
              label: n.label.length > 28 ? n.label.substring(0, 28) + '...' : n.label,
              fullTitle: n.label,
              type: n.type,
              size,
              isImported: n.data.isImported || false,
              isUnresolved: n.data.isUnresolved || n.type === 'UNRESOLVED_PAPER',
              originalNode: n,
            },
          };
        }),
        ...edges.map((e) => ({
          group: 'edges' as const,
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type,
            label: e.data.label || e.type.toLowerCase().replace(/_/g, ' '),
            isContradiction: e.type === 'CONTRADICTS',
            isAiProposed: e.data.isAiProposed || e.type === 'AI_PROPOSED',
            originalEdge: e,
          },
        })),
      ];

      const cy = cytoscape({
        container: containerRef.current,
        elements,
        boxSelectionEnabled: false,
        wheelSensitivity: 0.25,
        style: [
          // Global node defaults
          {
            selector: 'node',
            style: {
              label: showLabels ? 'data(label)' : '',
              color: isDark ? '#F5EFE6' : '#212832',
              'font-size': '10px',
              'font-weight': 700,
              'text-valign': 'bottom',
              'text-margin-y': 7,
              'text-max-width': '140px',
              'text-wrap': 'ellipsis',
              'text-background-color': isDark ? 'rgba(33, 40, 50, 0.94)' : 'rgba(255, 255, 255, 0.95)',
              'text-background-opacity': 0.95,
              'text-background-padding': '3px',
              'text-background-shape': 'roundrectangle',
              'text-border-width': 1,
              'text-border-color': isDark ? 'rgba(223, 209, 183, 0.25)' : 'rgba(148, 136, 120, 0.35)',
              'text-border-opacity': 1,
              width: 'data(size)',
              height: 'data(size)',
              'border-width': 2.5,
              'transition-property': 'background-color, border-color, border-width, width, height, shadow-blur',
              'transition-duration': 250,
            },
          },

          // Primary Indexed Paper Node (Charcoal / Cream)
          {
            selector: 'node[type = "PAPER"]',
            style: {
              'background-color': isDark ? '#DFD1B7' : '#212832',
              shape: 'round-rectangle',
              'border-color': isDark ? '#FAF7F2' : '#393D46',
              'border-width': 2.5,
            },
          },
          // User-Imported Paper
          {
            selector: 'node[type = "PAPER"][?isImported]',
            style: {
              'border-color': '#10B981',
              'border-width': 3.5,
            },
          },
          // Unresolved External Reference
          {
            selector: 'node[?isUnresolved], node[type = "UNRESOLVED_PAPER"]',
            style: {
              'background-color': isDark ? '#1E293B' : '#E2E8F0',
              'border-color': isDark ? '#64748B' : '#94A3B8',
              'border-style': 'dashed',
              'border-width': 2,
              shape: 'rectangle',
              color: isDark ? '#94A3B8' : '#64748B',
            },
          },

          // Concept Node (Teal / Emerald Circle)
          {
            selector: 'node[type = "CONCEPT"]',
            style: {
              'background-color': '#0D9488',
              shape: 'ellipse',
              'border-color': '#5EEAD4',
            },
          },

          // Claim Node (Purple Hexagon)
          {
            selector: 'node[type = "CLAIM"]',
            style: {
              'background-color': '#7C3AED',
              shape: 'hexagon',
              'border-color': '#C4B5FD',
            },
          },

          // Method Node (Cyan Diamond)
          {
            selector: 'node[type = "METHOD"]',
            style: {
              'background-color': '#0284C7',
              shape: 'diamond',
              'border-color': '#7DD3FC',
            },
          },

          // Dataset Node (Amber Rounded Rectangle)
          {
            selector: 'node[type = "DATASET"]',
            style: {
              'background-color': '#D97706',
              shape: 'round-rectangle',
              'border-color': '#FCD34D',
            },
          },

          // AI Interpretation Node (Dashed Blue Pill)
          {
            selector: 'node[type = "AI_INTERPRETATION"]',
            style: {
              'background-color': isDark ? '#1E3A8A' : '#EFF6FF',
              'border-color': '#3B82F6',
              'border-style': 'dashed',
              'border-width': 2.5,
              shape: 'round-rectangle',
              color: isDark ? '#93C5FD' : '#1D4ED8',
            },
          },

          // Evidence Chunk (Subtle Slate Rectangle)
          {
            selector: 'node[type = "CHUNK"]',
            style: {
              'background-color': isDark ? '#334155' : '#64748B',
              'border-color': isDark ? '#64748B' : '#94A3B8',
              shape: 'rectangle',
              width: 24,
              height: 24,
              'font-size': '8px',
            },
          },

          // Node Selection State (Elevated Glow)
          {
            selector: 'node:selected',
            style: {
              'border-color': '#2563EB',
              'border-width': 4.5,
              'border-opacity': 1,
            },
          },

          // Global Edge Defaults
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': isDark ? '#475569' : '#94A3B8',
              'target-arrow-color': isDark ? '#475569' : '#94A3B8',
              'target-arrow-shape': showArrows ? 'triangle' : 'none',
              'arrow-scale': 1.1,
              'curve-style': 'bezier',
              'control-point-step-size': 40,
              opacity: 0.85,
              'font-size': '9px',
              'font-weight': 600,
              'text-rotation': 'autorotate',
              'text-margin-y': -8,
              color: isDark ? '#CBD5E1' : '#475569',
              'transition-property': 'line-color, width, opacity',
              'transition-duration': 200,
            },
          },

          // Semantic Edge Types
          {
            selector: 'edge[type = "CITES"]',
            style: {
              'line-color': isDark ? '#64748B' : '#64748B',
              'target-arrow-color': isDark ? '#64748B' : '#64748B',
              width: 2,
            },
          },
          {
            selector: 'edge[type = "REPORTS"]',
            style: {
              'line-color': '#2563EB',
              'target-arrow-color': '#2563EB',
              width: 2.5,
            },
          },
          {
            selector: 'edge[type = "HAS_EVIDENCE"]',
            style: {
              'line-color': isDark ? '#64748B' : '#94A3B8',
              'target-arrow-color': isDark ? '#64748B' : '#94A3B8',
              'line-style': 'dotted',
              width: 1.5,
            },
          },
          {
            selector: 'edge[type = "USES_METHOD"]',
            style: {
              'line-color': '#0891B2',
              'target-arrow-color': '#0891B2',
              width: 2,
            },
          },
          {
            selector: 'edge[type = "EVALUATED_ON"]',
            style: {
              'line-color': '#D97706',
              'target-arrow-color': '#D97706',
              width: 2,
            },
          },
          {
            selector: 'edge[type = "SUPPORTS"]',
            style: {
              'line-color': '#059669',
              'target-arrow-color': '#059669',
              width: 3,
            },
          },
          {
            selector: 'edge[type = "CONTRADICTS"], edge[?isContradiction]',
            style: {
              'line-color': '#DC2626',
              'target-arrow-color': '#DC2626',
              'source-arrow-color': '#DC2626',
              'source-arrow-shape': showArrows ? 'triangle' : 'none',
              width: 3.5,
              opacity: 0.95,
            },
          },
          {
            selector: 'edge[type = "QUALIFIES"]',
            style: {
              'line-color': '#EA580C',
              'target-arrow-color': '#EA580C',
              'line-style': 'dashed',
              width: 2.5,
            },
          },
          {
            selector: 'edge[type = "EXTENDS"]',
            style: {
              'line-color': '#7C3AED',
              'target-arrow-color': '#7C3AED',
              'line-style': 'dashed',
              width: 2,
            },
          },
          {
            selector: 'edge[type = "DISCUSSES"]',
            style: {
              'line-color': isDark ? '#475569' : '#64748B',
              'target-arrow-color': isDark ? '#475569' : '#64748B',
              'line-style': 'dotted',
              width: 1.5,
            },
          },
          {
            selector: 'edge[type = "AI_PROPOSED"], edge[?isAiProposed]',
            style: {
              'line-color': '#2563EB',
              'target-arrow-color': '#2563EB',
              'line-style': 'dashed',
              width: 2,
            },
          },

          // Edge Selection State
          {
            selector: 'edge:selected',
            style: {
              width: 4.5,
              'line-color': '#2563EB',
              'target-arrow-color': '#2563EB',
              label: 'data(label)',
              'text-background-color': isDark ? '#0F172A' : '#FFFFFF',
              'text-background-opacity': 0.9,
              'text-background-padding': '3px',
              'text-border-width': 1,
              'text-border-color': '#2563EB',
            },
          },
        ],
      });

      cyRef.current = cy;

      // Run layout and fit
      const layout = cy.layout(getLayoutConfig(layoutName));
      layout.run();

      setTimeout(() => {
        if (cyRef.current) {
          cyRef.current.fit(undefined, 50);
        }
      }, 400);

      // Selection Handlers
      cy.on('tap', 'node', (evt: EventObject) => {
        const node = evt.target;
        const originalNode = node.data('originalNode');
        if (originalNode) {
          onSelectNode(originalNode);
        }
      });

      cy.on('tap', 'edge', (evt: EventObject) => {
        const edge = evt.target;
        const originalEdge = edge.data('originalEdge');
        if (originalEdge) {
          onSelectEdge(originalEdge);
        }
      });

      cy.on('tap', (evt: EventObject) => {
        if (evt.target === cy) {
          onDeselect();
          setHoverInfo(null);
        }
      });

      // Hover Tooltip Handlers
      cy.on('mouseover', 'node', (evt: EventObject) => {
        const node = evt.target;
        const pos = node.renderedPosition();
        const orig = node.data('originalNode') as GraphNode;
        if (orig) {
          setHoverInfo({
            x: pos.x,
            y: pos.y - 34,
            title: orig.data.title || orig.label,
            subtitle: orig.data.year ? String(orig.data.year) : orig.type,
            type: orig.type,
          });
        }
      });

      cy.on('mouseout', 'node', () => {
        setHoverInfo(null);
      });

      return () => {
        cy.destroy();
        cyRef.current = null;
      };
    }, [nodes, edges, layoutName, showLabels, showArrows, isDark]);

    // Handle external selectedNodeId changes
    useEffect(() => {
      if (!cyRef.current) return;
      cyRef.current.nodes().unselect();
      if (selectedNodeId) {
        const ele = cyRef.current.getElementById(selectedNodeId);
        if (ele && ele.length > 0) {
          ele.select();
        }
      }
    }, [selectedNodeId]);

    // Handle external selectedEdgeId changes
    useEffect(() => {
      if (!cyRef.current) return;
      cyRef.current.edges().unselect();
      if (selectedEdgeId) {
        const ele = cyRef.current.getElementById(selectedEdgeId);
        if (ele && ele.length > 0) {
          ele.select();
        }
      }
    }, [selectedEdgeId]);

    return (
      <div className={`relative w-full h-full min-h-[640px] select-none ${className}`}>
        <div ref={containerRef} className="w-full h-full min-h-[640px]" />

        {/* Hover Tooltip Card */}
        {hoverInfo && (
          <div
            style={{
              position: 'absolute',
              left: `${hoverInfo.x}px`,
              top: `${hoverInfo.y}px`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
            }}
            className="z-50 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#212832]/95 border border-[#DFD1B7] dark:border-[#393D46] shadow-xl backdrop-blur-md text-xs min-w-[160px] max-w-xs animate-scale-up"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#212832] dark:text-[#DFD1B7]">
                {hoverInfo.type}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {hoverInfo.subtitle}
              </span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
              {hoverInfo.title}
            </p>
          </div>
        )}
      </div>
    );
  }
);

GraphCanvas.displayName = 'GraphCanvas';
