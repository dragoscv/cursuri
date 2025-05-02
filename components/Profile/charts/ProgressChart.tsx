import React, { useEffect, useRef } from 'react';

interface ChartData {
    labels: string[];
    data: number[];
    colors: string[];
}

interface ProgressChartProps {
    data: ChartData;
    type: 'bar' | 'doughnut';
    className?: string;
    height?: number;
    width?: number;
}

export default function ProgressChart({ data, type, className = '', height = 180, width = 180 }: ProgressChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (type === 'doughnut') {
            drawDoughnutChart(ctx, data, canvasRef.current.width, canvasRef.current.height);
        } else {
            drawBarChart(ctx, data, canvasRef.current.width, canvasRef.current.height);
        }
    }, [data, type]);

    // Function to draw a doughnut chart
    const drawDoughnutChart = (
        ctx: CanvasRenderingContext2D,
        chartData: ChartData,
        width: number,
        height: number
    ) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        const innerRadius = radius * 0.6; // for doughnut hole

        // Calculate total for percentages
        const total = chartData.data.reduce((acc, val) => acc + val, 0);

        let startAngle = -0.5 * Math.PI; // Start at 12 o'clock

        // Draw segments
        chartData.data.forEach((value, index) => {
            const sliceAngle = (value / total) * (2 * Math.PI);
            const endAngle = startAngle + sliceAngle;

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = chartData.colors[index];
            ctx.fill();

            // Draw inner circle for doughnut hole
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-card-bg') || '#ffffff';
            ctx.fill();

            // If the slice is large enough, add label
            if (sliceAngle > 0.2) {
                const labelRadius = (radius + innerRadius) / 2;
                const labelAngle = startAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * labelRadius;
                const labelY = centerY + Math.sin(labelAngle) * labelRadius;

                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const percentage = Math.round((value / total) * 100);

                if (percentage >= 5) { // Only show label if segment is at least 5%
                    ctx.fillText(`${percentage}%`, labelX, labelY);
                }
            }

            // Move to next segment
            startAngle = endAngle;
        });

        // Draw center text (total)
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-foreground') || '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${total}`, centerX, centerY);

        // Draw legend
        const legendX = 10;
        let legendY = height - (chartData.labels.length * 20) - 10;

        chartData.labels.forEach((label, index) => {
            // Color square
            ctx.fillStyle = chartData.colors[index];
            ctx.fillRect(legendX, legendY, 12, 12);

            // Label text
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-foreground') || '#000000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, legendX + 18, legendY + 6);

            legendY += 18;
        });
    };

    // Function to draw a bar chart
    const drawBarChart = (
        ctx: CanvasRenderingContext2D,
        chartData: ChartData,
        width: number,
        height: number
    ) => {
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Find maximum value for scaling
        const maxValue = Math.max(...chartData.data);

        // Calculate bar width
        const totalBars = chartData.data.length;
        const barWidth = (chartWidth / totalBars) * 0.8;
        const barSpacing = (chartWidth / totalBars) * 0.2;

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-card-border') || '#cccccc';
        ctx.stroke();

        // Draw y-axis labels
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const value = (maxValue / numYLabels) * i;
            const y = height - padding.bottom - (chartHeight * (value / maxValue));

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-muted') || '#999999';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(value).toString(), padding.left - 5, y);

            // Draw horizontal grid line
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-card-border') || '#cccccc';
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw bars and x-axis labels
        chartData.data.forEach((value, index) => {
            const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing / 2;
            const barHeight = (value / maxValue) * chartHeight;
            const y = height - padding.bottom - barHeight;

            // Draw bar
            const gradient = ctx.createLinearGradient(x, y, x, height - padding.bottom);
            gradient.addColorStop(0, chartData.colors[index]);
            gradient.addColorStop(1, chartData.colors[index] + '80'); // 50% opacity

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw bar value on top
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-foreground') || '#000000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5);

            // Draw x-axis label
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ai-muted') || '#999999';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(chartData.labels[index], x + barWidth / 2, height - padding.bottom + 5);
        });
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
        />
    );
}
