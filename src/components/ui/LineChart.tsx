import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  voltage: number;
  current: number;
  originalDate?: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, width = 800, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set margins
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, (d: DataPoint) => new Date(`2024-01-01T${d.date}`)) as [Date, Date])
      .range([0, innerWidth]);

    // Siempre establecer un rango fijo para el voltaje y la corriente para mantener consistencia
    // El voltaje normalmente estará entre 100V y 140V en un sistema estable
    const voltageScale = d3.scaleLinear()
      .domain([90, 150]) // Rango amplio para evitar que cualquier valor se salga
      .range([innerHeight, 0]);
    
    // La corriente puede variar más, usemos una escala que cubra un rango amplio
    // Para sistemas típicos, establecemos un rango de 0 a 50A
    const currentScale = d3.scaleLinear()
      .domain([0, 50])
      .range([innerHeight, 0]);
    
    // Comprobamos si hay valores fuera de los rangos predefinidos
    const maxVoltage = d3.max(data, (d: DataPoint) => d.voltage) as number;
    const maxCurrent = d3.max(data, (d: DataPoint) => d.current) as number;
    
    // Si encontramos valores que exceden nuestros rangos, ajustamos las escalas
    if (maxVoltage > 145) {
      voltageScale.domain([90, maxVoltage * 1.1]);
    }
    
    if (maxCurrent > 45) {
      currentScale.domain([0, maxCurrent * 1.2]);
    }

    // Create line generators
    const voltageLine = d3.line<DataPoint>()
      .x((d: DataPoint) => xScale(new Date(`2024-01-01T${d.date}`)))
      .y((d: DataPoint) => voltageScale(d.voltage))
      .curve(d3.curveMonotoneX);

    const currentLine = d3.line<DataPoint>()
      .x((d: DataPoint) => xScale(new Date(`2024-01-01T${d.date}`)))
      .y((d: DataPoint) => currentScale(d.current))
      .curve(d3.curveMonotoneX);

    // Create SVG and group element
    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis with improved visibility
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d: Date | d3.NumberValue) => 
        d3.timeFormat('%H:%M')(d instanceof Date ? d : new Date(d as number))
      ))
      .attr('class', 'x-axis')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-weight', '600')
      .style('font-size', '11px')
      .style('fill', '#000000');

    // Add Y axis for voltage with improved visibility
    g.append('g')
      .call(d3.axisLeft(voltageScale))
      .attr('class', 'y-axis-voltage')
      .selectAll('text')
      .style('font-weight', '600')
      .style('font-size', '11px')
      .style('fill', '#000000');
      
    // Add Y axis for current with improved visibility
    g.append('g')
      .attr('transform', `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(currentScale))
      .attr('class', 'y-axis-current')
      .selectAll('text')
      .style('font-weight', '600')
      .style('font-size', '11px')
      .style('fill', '#000000');
      
    // Add Y-axis label for current
    g.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -innerWidth - 45)
      .attr('x', innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#10B981')
      .text('Current (kW)');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(voltageScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .style('stroke', '#808080')
      .style('color', 'black');

    // Add voltage line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6') // blue-500
      .attr('stroke-width', 2)
      .attr('d', voltageLine);

    // Add current line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10B981') // green-500
      .attr('stroke-width', 2)
      .attr('d', currentLine);

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Time');
      
    // Add legend
    const legendData = [
      { color: '#3B82F6', text: 'Voltage (V)' },
      { color: '#10B981', text: 'Current (A)' }
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
    const voltageCircles = g.selectAll('.voltage-circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'voltage-circle')
      .attr('cx', (d: DataPoint) => xScale(new Date(`2024-01-01T${d.date}`)))
      .attr('cy', (d: DataPoint) => voltageScale(d.voltage))
      .attr('r', 0)
      .attr('fill', '#3B82F6')
      .style('opacity', 0);

    // Add hover circles for current
    const currentCircles = g.selectAll('.current-circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'current-circle')
      .attr('cx', (d: DataPoint) => xScale(new Date(`2024-01-01T${d.date}`)))
      .attr('cy', (d: DataPoint) => currentScale(d.current))
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
        const bisect = d3.bisector((d: DataPoint) => new Date(`2024-01-01T${d.date}`)).left;
        const index = bisect(data, xValue);
        const dataPoint = data[index] || data[data.length - 1];
        
        // Update circles
        voltageCircles
          .style('opacity', (_d: DataPoint, i: number) => i === index ? 1 : 0)
          .attr('r', (_d: DataPoint, i: number) => i === index ? 5 : 0);
          
        currentCircles
          .style('opacity', (_d: DataPoint, i: number) => i === index ? 1 : 0)
          .attr('r', (_d: DataPoint, i: number) => i === index ? 5 : 0);
        
        // Show tooltip
        // Verificar que voltage y current sean números antes de usar toFixed
        const voltageDisplay = typeof dataPoint.voltage === 'number' ? dataPoint.voltage.toFixed(2) : 'N/A';
        const currentDisplay = typeof dataPoint.current === 'number' ? dataPoint.current.toFixed(2) : 'N/A';
        
        // Mostrar la fecha original si está disponible (para visualización histórica),
        // o la hora regular si no lo está
        const timeDisplay = dataPoint.originalDate ? 
          `<strong>Fecha:</strong> ${dataPoint.originalDate}` : 
          `<strong>Hora:</strong> ${dataPoint.date}`;
        
        tooltip
          .style('opacity', 1)
          .html(`${timeDisplay}<br><strong>Voltaje:</strong> ${voltageDisplay}V<br><strong>Consumo:</strong> ${currentDisplay}kW`)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        voltageCircles.style('opacity', 0).attr('r', 0);
        currentCircles.style('opacity', 0).attr('r', 0);
        tooltip.style('opacity', 0);
      });

    // Clean up function
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height]);

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

export default LineChart;
