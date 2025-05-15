import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface BarData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  width = 500, 
  height = 300,
  color = '#3B82F6' // blue-500
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set margins
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map((d: BarData) => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: BarData) => d.value) as number * 1.1]) // 10% padding on top
      .range([innerHeight, 0]);

    // Create SVG group
    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('color', 'black')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', 'black');

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: BarData) => xScale(d.name) as number)
      .attr('y', (d: BarData) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: BarData) => innerHeight - yScale(d.value))
      .attr('fill', color)
      .attr('rx', 2) // rounded corners
      .on('mouseover', function(this: SVGRectElement, event: MouseEvent, d: BarData) {
        d3.select(this).attr('opacity', 0.8);
        
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.name}</strong>: ${d.value.toFixed(2)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(this: SVGRectElement) {
        d3.select(this).attr('opacity', 1);
        tooltip.style('opacity', 0);
      });

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2);

    // Add tooltip
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

    // Clean up function
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, color]);

  return (
    <svg ref={svgRef} width={width} height={height} className='mx-auto'></svg>
  );
};

export default BarChart;
