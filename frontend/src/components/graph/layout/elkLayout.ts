import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export interface LayoutOptions {
  direction?: 'DOWN' | 'RIGHT' | 'UP' | 'LEFT';
  nodeSpacing?: number;
  layerSpacing?: number;
}

export const getNodeDimensions = (type?: string): { width: number; height: number } => {
  switch (type) {
    case 'paper':
      return { width: 280, height: 150 };
    case 'claim':
      return { width: 280, height: 160 };
    case 'concept':
      return { width: 240, height: 120 };
    case 'dataset':
      return { width: 240, height: 120 };
    case 'evidence':
      return { width: 300, height: 170 };
    default:
      return { width: 260, height: 140 };
  }
};

/**
 * Computes an automatic hierarchical layout using ELK.js (Eclipse Layout Kernel)
 * Algorithm: layered (Sugiyama framework)
 * Direction: DOWN (top-to-bottom hierarchy)
 */
export async function getElkLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const direction = options.direction || 'DOWN';
  const nodeSpacing = options.nodeSpacing ?? 50;
  const layerSpacing = options.layerSpacing ?? 80;

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': String(nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.edgeRouting': 'SPLINES',
      'elk.padding': '[top=40,left=40,bottom=40,right=40]',
    },
    children: nodes.map((n) => {
      const dims = getNodeDimensions(n.type);
      return {
        id: n.id,
        width: n.measured?.width ?? dims.width,
        height: n.measured?.height ?? dims.height,
      };
    }),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  try {
    const layouted = await elk.layout(elkGraph);

    const positionMap = new Map<string, { x: number; y: number }>();
    if (layouted.children) {
      for (const child of layouted.children) {
        if (child.id && child.x !== undefined && child.y !== undefined) {
          positionMap.set(child.id, { x: child.x, y: child.y });
        }
      }
    }

    const layoutedNodes = nodes.map((n) => {
      const pos = positionMap.get(n.id);
      return {
        ...n,
        position: pos || n.position,
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (err) {
    console.warn('ELK layout computation failed, falling back to grid:', err);
    return { nodes, edges };
  }
}

