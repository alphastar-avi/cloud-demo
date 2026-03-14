import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import type { Transaction } from '../types';

interface SankeyChartProps {
  transactions: Transaction[];
}

const SankeyChart: React.FC<SankeyChartProps> = ({ transactions }) => {
  // Process Data for Sankey Diagram 
  // Map Income sources to "Budget" and "Budget" to Expenses
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  // If no transactions, don't render chart
  if (transactions.length === 0) {
    return <div style={{ color: 'var(--text-muted)' }}>No data for the selected period.</div>;
  }

  // Calculate nodes and links
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

  // Theme for Nivo components to match dark mode
  const theme = {
    textColor: '#f8fafc',
    tooltip: {
      container: {
        background: '#0f172a',
        color: '#f8fafc',
        fontSize: '14px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', padding: '24px 0' }}>
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
