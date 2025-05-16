import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface BarData {
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
  height = 350,
  color = '#3B82F6' // blue-500
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

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

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'rgba(255, 255, 255, 0.9)')
      .style('padding', '8px')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Create SVG group
    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Remove standard X axis labels and just add the axis line
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0).tickFormat(() => ""))
      .select('.domain')
      .attr('stroke', '#ccc');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', 'black');
      
    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .style('color', 'black');

    // Add and animate bars with event handlers
    const bars = g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d: BarData) => xScale(d.name) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', innerHeight) // Start from the bottom
      .attr('height', 0) // Initial height = 0
      .attr('fill', color)
      .attr('rx', 2); // rounded corners
      
    // Add event handlers to the bars (must be added before the transition)
    bars.on('mouseover', function(event: MouseEvent, d: BarData) {
        d3.select(this).attr('opacity', 0.8);
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.name}</strong>: ${d.value.toFixed(2)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.style('opacity', 0);
      });
    
    // Now animate the bars
    bars.transition()
      .duration(1000)
      .attr('y', (d: BarData) => yScale(d.value))
      .attr('height', (d: BarData) => innerHeight - yScale(d.value));

    // Add text labels inside bars (vertical orientation)
    const labels = g.selectAll('.bar-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', (d: BarData) => (xScale(d.name) as number) + xScale.bandwidth() / 2)
      .attr('y', innerHeight - 5) // Start near bottom
      .attr('text-anchor', 'middle')
      .attr('fill', 'transparent') // Start invisible
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .attr('transform', (d: BarData) => `rotate(-90, ${(xScale(d.name) as number) + xScale.bandwidth() / 2}, ${innerHeight - 5})`)
      .text((d: BarData) => d.name);
      
    // Animate text labels
    labels.transition()
      .delay(200)
      .duration(800)
      .attr('y', (d: BarData) => {
        // Position text vertically within the bar
        const barHeight = innerHeight - yScale(d.value);
        // Only show text inside if bar is tall enough
        if (barHeight > 25) {
          // Centrar el texto verticalmente dentro de la barra
          return yScale(d.value) + (barHeight / 2); 
        } else {
          return yScale(d.value) - 5; // Position above the bar if it's too short
        }
      })
      .attr('transform', (d: BarData) => {
        const barHeight = innerHeight - yScale(d.value);
        const xCenter = (xScale(d.name) as number) + xScale.bandwidth() / 2;
        const yPos = barHeight > 25 
          ? yScale(d.value) + (barHeight / 2)  // Centrado en barras altas
          : yScale(d.value) - 5;                // Encima en barras cortas
          
        // Solo rotar en barras altas
        return barHeight > 25 
          ? `rotate(-90, ${xCenter}, ${yPos})` 
          : '';
      })
      .attr('fill', (d: BarData) => {
        const barHeight = innerHeight - yScale(d.value);
        return barHeight > 25 ? 'white' : '#333'; // White text inside taller bars, dark text above shorter bars
      });

    // Add X axis title
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .style('font-size', '12px')
      .style('fill', '#555')
      .text('Devices');

    // Add Y axis title
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -innerHeight / 2)
      .style('font-size', '12px')
      .style('fill', '#555')
      .text('Energy Consumption (kW)');

    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, color]);

  return (
    <div className="w-full h-full overflow-hidden">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto max-w-full"
      ></svg>
    </div>
  );
};

export default BarChart;
