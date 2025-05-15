import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  fecha: string;     // Fecha en formato YYYY-MM-DD
  voltaje: number;   // Valor de voltaje
  consumo: number;   // Valor de consumo
}

interface HistoricalChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

interface ItemData {
  date: Date;
  voltaje: number;
  consumo: number;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, width = 800, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set margins
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create date parser and formatter
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%d/%m');

    // Prepare data with proper date objects
    const chartData = data.map(d => ({
      date: parseDate(d.fecha) || new Date(), // Convierte string a Date
      voltaje: d.voltaje,
      consumo: d.consumo
    }));

    // Sort data by date
    chartData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Create scales
    // X-axis: ordinal scale for dates
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    // Y-axis: linear scale for voltage
    const voltajeScale = d3.scaleLinear()
      .domain([90, d3.max(chartData, d => d.voltaje) as number * 1.1 || 150])
      .range([innerHeight, 0]);
    
    // Y-axis: linear scale for consumption
    const consumoScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.consumo) as number * 1.2 || 10])
      .range([innerHeight, 0]);

    // Create line generators
    const voltajeLine = d3.line<{ date: Date, voltaje: number, consumo: number }>()
      .x(d => xScale(d.date))
      .y(d => voltajeScale(d.voltaje))
      .curve(d3.curveMonotoneX);

    const consumoLine = d3.line<{ date: Date, voltaje: number, consumo: number }>()
      .x(d => xScale(d.date))
      .y(d => consumoScale(d.consumo))
      .curve(d3.curveMonotoneX);

    // Create SVG and group element
    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis - with date format and only show ticks for the exact dates in our data
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues(chartData.map(d => d.date)) // Solo usar las fechas exactas de nuestros datos
          .tickFormat(d => formatDate(d as Date))
      )
      .attr('class', 'x-axis')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-weight', '600')
      .style('font-size', '11px')
      .style('fill', '#000000');
      
    // Add X-axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#000000')
      .text('Fecha');

    // Add Y axis for voltage with improved visibility
    g.append('g')
      .call(d3.axisLeft(voltajeScale))
      .attr('class', 'y-axis-voltage')
      .selectAll('text')
      .style('font-weight', '600')
      .style('font-size', '11px')
      .style('fill', '#000000');
      
    // Add Y axis for consumption with improved visibility
    g.append('g')
      .attr('transform', `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(consumoScale))
      .attr('class', 'y-axis-consumption')
      .selectAll('text')
      .style('font-weight', '600')
      .style('font-size', '11px')
      .style('fill', '#000000');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(voltajeScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .style('color', 'black');

    // Add voltage line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6') // blue-500
      .attr('stroke-width', 2)
      .attr('d', voltajeLine);

    // Add consumption line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#10B981') // green-500
      .attr('stroke-width', 2)
      .attr('d', consumoLine);

    // Add chart title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Histórico de Voltaje y Consumo por Día');

    // Add legend
    const legendData = [
      { color: '#3B82F6', text: 'Voltaje (V)' },
      { color: '#10B981', text: 'Consumo (kW)' }
    ];
    
    const legend = g.selectAll('.legend')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);
      
    legend.append('rect')
      .attr('x', innerWidth - 100)
      .attr('y', 10)
      .attr('width', 15)
      .attr('height', 3)
      .style('fill', d => d.color)
      .style('stroke', d => d.color);
      
    legend.append('text')
      .attr('x', innerWidth - 80)
      .attr('y', 10)
      .attr('dy', '.35em')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', d => d.color)
      .text(d => d.text);

    // Add tooltips
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

    // Add hover circles for voltage
    const voltajeCircles = g.selectAll('.voltaje-circle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'voltaje-circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => voltajeScale(d.voltaje))
      .attr('r', 0)
      .attr('fill', '#3B82F6')
      .style('opacity', 0);

    // Add hover circles for consumption
    const consumoCircles = g.selectAll('.consumo-circle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'consumo-circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => consumoScale(d.consumo))
      .attr('r', 0)
      .attr('fill', '#10B981')
      .style('opacity', 0);

    // Overlay for hover interaction
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function (event: MouseEvent) {
        const [xPos] = d3.pointer(event);
        
        // Find closest data point
        const xValue = xScale.invert(xPos);
        const bisect = d3.bisector((d: { date: Date }) => d.date).left;
        const index = bisect(chartData, xValue);
        const dataPoint = chartData[index] || chartData[chartData.length - 1];
        
        // Update circles
        // agrega valores ramdoms

        // como quito la variable d?
        voltajeCircles
          .style('opacity', (d: ItemData, i: number) => i === index ? 1 : 0)
          .attr('r', (d: ItemData, i: number) => i === index ? 5 : 0);
          
        consumoCircles
          .style('opacity', (d: ItemData, i: number) => i === index ? 1 : 0)
          .attr('r', (d: ItemData, i: number) => i === index ? 5 : 0);
        
        // Show tooltip
        const voltajeDisplay = typeof dataPoint.voltaje === 'number' ? dataPoint.voltaje.toFixed(2) : 'N/A';
        const consumoDisplay = typeof dataPoint.consumo === 'number' ? dataPoint.consumo.toFixed(2) : 'N/A';
        const formattedDate = formatDate(dataPoint.date);
        
        tooltip
          .style('opacity', 1)
          .html(`<strong>Fecha:</strong> ${formattedDate}<br><strong>Voltaje:</strong> ${voltajeDisplay}V<br><strong>Consumo:</strong> ${consumoDisplay}kW`)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        voltajeCircles.style('opacity', 0).attr('r', 0);
        consumoCircles.style('opacity', 0).attr('r', 0);
        tooltip.style('opacity', 0);
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

export default HistoricalChart;
