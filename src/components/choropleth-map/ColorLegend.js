import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";

export const ColorLegend = () => {

    const legendWidth = 300;
    const legendHeight = 20;
    const legendX = 300;
    const legendY = 50;

    const legendScale = scaleSequential(interpolateYlOrRd)
        .domain([0, 10]);
    return (
        <g transform={`translate(${legendX}, ${legendY})`}>
            <defs>
                <linearGradient id="legend-gradient">
                    {legendScale.ticks(20).map((tickValue) => (
                        <stop
                            key={tickValue}
                            offset={(tickValue - legendScale.domain()[0]) / (legendScale.domain()[1] - legendScale.domain()[0])}
                            stopColor={legendScale(tickValue)}
                        />
                    ))}
                </linearGradient>
            </defs>
            <rect
                x={0}
                y={0}
                width={legendWidth}
                height={legendHeight}
                fill="url(#legend-gradient)"
            />
            <text
                x={0}
                y={legendHeight + 10}
                fontSize="12px"
                textAnchor="start"
            >
                {legendScale.domain()[0].toFixed(1)}
            </text>
            <text
                x={legendWidth}
                y={legendHeight + 10}
                fontSize="12px"
                textAnchor="end"
            >
                {legendScale.domain()[1].toFixed(1)}
            </text>
        </g>
    )
}
