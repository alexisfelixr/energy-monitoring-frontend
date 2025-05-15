import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface PieData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieData[];
  width?: number;
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  width = 300, 
  height = 300 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions and colors
    const radius = Math.min(width, height) / 2;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create SVG group
    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create pie generator
    const pie = d3.pie<PieData>()
      .value((d: PieData) => d.value)
      .sort(null); // Don't sort, maintain the data order

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius - 10);

    // Create hover arc generator (slightly larger)
    const hoverArc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius - 5);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('box-shadow', '0 1px 3px rgba(0,0,0,0.1)');

    // Add slices
    const slices = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', (d: d3.PieArcDatum<PieData>) => d.data.color || colorScale(d.data.name) as string)
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(this: SVGPathElement, event: MouseEvent, d: d3.PieArcDatum<PieData>) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', function() { return hoverArc(d); });

        // Calculate percentage
        const total = d3.sum(data, (item: PieData) => item.value);
        const percentage = ((d.data.value / total) * 100).toFixed(1);

        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.data.name}</strong>: ${d.data.value.toFixed(2)} (${percentage}%)`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(this: SVGPathElement, _event: MouseEvent, d: d3.PieArcDatum<PieData>) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', function() { return arc(d); });

        tooltip.style('opacity', 0);
      });

    // Add labels (only if slice is big enough)
    slices.append('text')
      .attr('transform', (d: d3.PieArcDatum<PieData>) => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .text((d: d3.PieArcDatum<PieData>) => {
        const total = d3.sum(data, (item: PieData) => item.value);
        const percentage = ((d.data.value / total) * 100);
        return percentage > 8 ? `${percentage.toFixed(0)}%` : '';
      });

    // Clean up function
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} className='mx-auto'></svg>
  );
};

export default PieChart;
