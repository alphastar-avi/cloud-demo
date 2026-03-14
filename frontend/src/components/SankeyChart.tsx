import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import type { Transaction } from '../types';

interface SankeyChartProps {
  transactions: Transaction[];
}

const SankeyChart: React.FC<SankeyChartProps> = ({ transactions }) => {
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  if (transactions.length === 0) {
    return <div className="text-muted-foreground text-sm">No data for the selected period.</div>;
  }

  const nodesMap = new Set<string>();
  const linksMap = new Map<string, number>();

  nodesMap.add('Budget');

  incomes.forEach(inc => {
    const sourceNode = inc.title || 'Other Income';
    nodesMap.add(sourceNode);
    const linkKey = `${sourceNode}->Budget`;
    linksMap.set(linkKey, (linksMap.get(linkKey) || 0) + inc.amount);
  });

  expenses.forEach(exp => {
    const targetNode = exp.category || 'Other Expense';
    nodesMap.add(targetNode);
    const linkKey = `Budget->${targetNode}`;
    linksMap.set(linkKey, (linksMap.get(linkKey) || 0) + exp.amount);
  });

  const nodes = Array.from(nodesMap).map(id => ({ id }));
  const links = Array.from(linksMap.entries()).map(([key, value]) => {
    const [source, target] = key.split('->');
    return { source, target, value };
  });

  const theme = {
    textColor: 'hsl(var(--foreground))',
    tooltip: {
      container: {
        background: 'hsl(var(--popover))',
        color: 'hsl(var(--popover-foreground))',
        fontSize: '13px',
        borderRadius: '8px',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    }
  };

  return (
    <div className="w-full h-full py-6">
      <ResponsiveSankey
        data={{ nodes, links }}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        align="justify"
        colors={{ scheme: 'category10' }}
        nodeOpacity={0.8}
        nodeHoverOpacity={1}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.8]]
        }}
        linkOpacity={0.3}
        linkHoverOpacity={0.6}
        linkBlendMode="screen"
        enableLinkGradient={true}
        labelPosition="inside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
        }}
        theme={theme}
      />
    </div>
  );
};

export default SankeyChart;
