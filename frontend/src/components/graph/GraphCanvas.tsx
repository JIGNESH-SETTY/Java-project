import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { GraphNode, GraphEdge } from '../../types/graph';

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
          cyRef.current.zoom(cyRef.current.zoom() * 1.25);
        }
      },
      zoomOut: () => {
        if (cyRef.current) {
          cyRef.current.zoom(cyRef.current.zoom() * 0.8);
        }
      },
      fit: () => {
        if (cyRef.current) {
          cyRef.current.fit(undefined, 35);
        }
      },
      reset: () => {
        if (cyRef.current) {
          const layout = cyRef.current.layout(getLayoutConfig(layoutName));
          layout.run();
          cyRef.current.fit(undefined, 35);
        }
      },
      exportPng: () => {
        if (cyRef.current) {
          const pngData = cyRef.current.png({
            full: true,
            scale: 2,
            bg: '#F9FAFC',
          });
          const link = document.createElement('a');
          link.download = `research-graph-${Date.now()}.png`;
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
              duration: 400,
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
            padding: 30,
            animate: true,
            animationDuration: 500,
          } as any;
        case 'circle':
          return {
            name: 'circle',
            padding: 30,
            animate: true,
            animationDuration: 500,
          };
        case 'breadthfirst':
          return {
            name: 'breadthfirst',
            directed: true,
            padding: 30,
            spacingFactor: 1.2,
            animate: true,
            animationDuration: 500,
          };
        case 'cose':
        default:
          return {
            name: 'cose',
            animate: true,
            animationDuration: 600,
            padding: 35,
            nodeOverlap: 25,
            idealEdgeLength: 80,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 800,
            initialTemp: 200,
            coolingFactor: 0.95,
          } as any;
      }
    };

    // Initialize & update Cytoscape instance
    useEffect(() => {
      if (!containerRef.current) return;

      const elements: cytoscape.ElementDefinition[] = [
        ...nodes.map((n) => {
          // Moderate sizing based on citation count / importance
          let size = 34;
          if (n.data.citationCount) {
            size = Math.min(54, Math.max(34, 30 + Math.log10(n.data.citationCount + 1) * 5));
          } else if (n.type === 'PAPER') {
            size = 38;
          } else if (n.type === 'CHUNK') {
            size = 24;
          }

          return {
            group: 'nodes' as const,
            data: {
              id: n.id,
              label: n.label.length > 26 ? n.label.substring(0, 26) + '...' : n.label,
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
              color: '#29282B',
              'font-size': '10px',
              'font-weight': 600,
              'text-valign': 'bottom',
              'text-margin-y': 5,
              'text-max-width': '120px',
              'text-wrap': 'ellipsis',
              width: 'data(size)',
              height: 'data(size)',
              'border-width': 2,
              'transition-property': 'background-color, border-color, border-width, width, height',
              'transition-duration': 200,
            },
          },

          // Paper Node
          {
            selector: 'node[type = "PAPER"]',
            style: {
              'background-color': '#4F46E5',
              shape: 'round-rectangle',
              'border-color': '#818CF8',
              'border-width': 2,
            },
          },
          // User Imported Paper Node
          {
            selector: 'node[type = "PAPER"][?isImported]',
            style: {
              'border-color': '#0D9488',
              'border-width': 3,
            },
          },
          // Unresolved Paper
          {
            selector: 'node[?isUnresolved], node[type = "UNRESOLVED_PAPER"]',
            style: {
              'background-color': '#E2E8F0',
              'border-color': '#94A3B8',
              'border-style': 'dashed',
              'border-width': 2,
              shape: 'rectangle',
              color: '#64748B',
            },
          },

          // Concept Node (Circle, Teal)
          {
            selector: 'node[type = "CONCEPT"]',
            style: {
              'background-color': '#0D9488',
              shape: 'ellipse',
              'border-color': '#5EEAD4',
            },
          },

          // Claim Node (Hexagon, Violet)
          {
            selector: 'node[type = "CLAIM"]',
            style: {
              'background-color': '#7C3AED',
              shape: 'hexagon',
              'border-color': '#C4B5FD',
            },
          },

          // Method Node (Diamond, Blue)
          {
            selector: 'node[type = "METHOD"]',
            style: {
              'background-color': '#2563EB',
              shape: 'diamond',
              'border-color': '#93C5FD',
            },
          },

          // Dataset Node (Rounded Rectangle, Amber)
          {
            selector: 'node[type = "DATASET"]',
            style: {
              'background-color': '#D97706',
              shape: 'round-rectangle',
              'border-color': '#FCD34D',
            },
          },

          // AI Interpretation Node (Dashed Purple)
          {
            selector: 'node[type = "AI_INTERPRETATION"]',
            style: {
              'background-color': '#F3E8FF',
              'border-color': '#9333EA',
              'border-style': 'dashed',
              'border-width': 2,
              shape: 'round-rectangle',
              color: '#581C87',
            },
          },

          // Evidence Chunk (Small Document Slate)
          {
            selector: 'node[type = "CHUNK"]',
            style: {
              'background-color': '#475569',
              'border-color': '#94A3B8',
              shape: 'rectangle',
              width: 22,
              height: 22,
              'font-size': '8px',
            },
          },

          // Node Selection State
          {
            selector: 'node:selected',
            style: {
              'border-color': '#FF6F61',
              'border-width': 4,
              'border-opacity': 1,
            },
          },

          // Global Edge Defaults
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#64748B',
              'target-arrow-color': '#64748B',
              'target-arrow-shape': showArrows ? 'triangle' : 'none',
              'curve-style': 'bezier',
              opacity: 0.85,
              'font-size': '9px',
              'text-rotation': 'autorotate',
              'text-margin-y': -6,
              color: '#475569',
              'transition-property': 'line-color, width, opacity',
              'transition-duration': 200,
            },
          },

          // Edge Types
          {
            selector: 'edge[type = "CITES"]',
            style: {
              'line-color': '#64748B',
              'target-arrow-color': '#64748B',
            },
          },
          {
            selector: 'edge[type = "REPORTS"]',
            style: {
              'line-color': '#2563EB',
              'target-arrow-color': '#2563EB',
            },
          },
          {
            selector: 'edge[type = "HAS_EVIDENCE"]',
            style: {
              'line-color': '#94A3B8',
              'target-arrow-color': '#94A3B8',
              'line-style': 'dotted',
              width: 1.5,
            },
          },
          {
            selector: 'edge[type = "USES_METHOD"]',
            style: {
              'line-color': '#0891B2',
              'target-arrow-color': '#0891B2',
            },
          },
          {
            selector: 'edge[type = "EVALUATED_ON"]',
            style: {
              'line-color': '#D97706',
              'target-arrow-color': '#D97706',
            },
          },
          {
            selector: 'edge[type = "SUPPORTS"]',
            style: {
              'line-color': '#059669',
              'target-arrow-color': '#059669',
              width: 2.5,
            },
          },
          // CONTRADICTS: Prominent Solid Red + Stronger Width
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
            },
          },
          {
            selector: 'edge[type = "EXTENDS"]',
            style: {
              'line-color': '#7C3AED',
              'target-arrow-color': '#7C3AED',
              'line-style': 'dashed',
            },
          },
          {
            selector: 'edge[type = "DISCUSSES"]',
            style: {
              'line-color': '#64748B',
              'target-arrow-color': '#64748B',
              'line-style': 'dotted',
              width: 1.5,
            },
          },
          // AI Proposed: Dashed Violet with clear label
          {
            selector: 'edge[type = "AI_PROPOSED"], edge[?isAiProposed]',
            style: {
              'line-color': '#9333EA',
              'target-arrow-color': '#9333EA',
              'line-style': 'dashed',
              width: 2,
            },
          },

          // Edge Selection State
          {
            selector: 'edge:selected',
            style: {
              width: 4,
              'line-color': '#FF6F61',
              'target-arrow-color': '#FF6F61',
              label: 'data(label)',
            },
          },
        ],
      });

      cyRef.current = cy;

      // Run initial layout
      const layout = cy.layout(getLayoutConfig(layoutName));
      layout.run();

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
            y: pos.y - 30,
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
    }, [nodes, edges, layoutName, showLabels, showArrows]);

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
      <div className={`relative w-full h-full min-h-[540px] overflow-hidden select-none ${className}`}>
        {/* Cytoscape Container */}
        <div
          ref={containerRef}
          className="w-full h-full rounded-[26px]"
          style={{
            background:
              'radial-gradient(circle at 15% 20%, rgba(240, 245, 255, 0.8) 0%, rgba(248, 246, 255, 0.7) 50%, rgba(245, 248, 252, 0.9) 100%)',
          }}
        />

        {/* Floating Node Hover Tooltip */}
        {hoverInfo && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-900/90 text-white shadow-lg backdrop-blur-xs text-[11px] max-w-xs transition-opacity duration-150"
            style={{
              left: `${hoverInfo.x}px`,
              top: `${hoverInfo.y}px`,
            }}
          >
            <div className="font-bold truncate leading-tight">{hoverInfo.title}</div>
            <div className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1.5">
              <span className="uppercase text-[9px] px-1 rounded bg-white/20 font-semibold">
                {hoverInfo.type}
              </span>
              <span>{hoverInfo.subtitle}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GraphCanvas.displayName = 'GraphCanvas';
