import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell, ReferenceLine } from "recharts";

interface PredictionItem {
  label: string;
  probability: number;
}

interface GroupedPrediction {
  older: {
    total_probability: number;
    items: PredictionItem[];
  };
  equal_or_younger: {
    total_probability: number;
    items: PredictionItem[];
  };
}

interface Props {
  data: GroupedPrediction;
}

export default function BinaryBarChart({ data }: Props) {
  const maxProbability = Math.max(
    ...data.older.items.map((i) => i.probability),
    ...data.equal_or_younger.items.map((i) => i.probability)
  );

  const olderData = [...data.older.items].reverse().map((item) => ({
    label: item.label,
    value: -item.probability,
    group: "older",
  }));
  const youngerData = data.equal_or_younger.items.map((item) => ({
    label: item.label,
    value: item.probability,
    group: "equal_or_younger",
  }));
  const thresholdItem = { label: "threshold", value: 0, group: "threshold" };
  const chartData = [...olderData, thresholdItem, ...youngerData];

  const isOlderWinner =
    data.older.total_probability >= data.equal_or_younger.total_probability;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <XAxis
            type="number"
            domain={[-maxProbability, maxProbability]}
            tickFormatter={(v) => `${Math.abs(v * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <Tooltip
            formatter={(value: number) =>
              `${Math.abs(value * 100).toFixed(2)}%`
            }
            labelFormatter={(label) => `Label: ${label}`}
          />
          <ReferenceLine y="threshold" stroke="black" strokeWidth={1} ifOverflow="extendDomain" />
          <Bar
            dataKey="value"
            radius={[4, 4, 4, 4]}
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.group === "older"
                    ? isOlderWinner ? "#22c55e" : "#ef4444"
                    : isOlderWinner ? "#ef4444" : "#22c55e"
                }
              />
            ))}
            <LabelList
              dataKey="value"
              content={({ x, y, width, height, value, index }) => {
                if (typeof index !== "number" || index < 0 || index >= chartData.length) return null;
                const entry = chartData[index];
                const numericValue = typeof value === "number" ? value : 0;
                if (Math.abs(numericValue) < 0.005) return null;

                const percentage = `${Math.abs(numericValue * 100).toFixed(0)}%`;
                const fontSize = Math.max(10, Math.min(14, Math.abs(numericValue) * 100));
                const fillColor =
                  entry.group === "older"
                    ? isOlderWinner
                      ? "white"
                      : "black"
                    : isOlderWinner
                      ? "black"
                      : "white";

                return (
                  <text
                    x={numericValue < 0 ? Number(x) + Number(width) + 5 : Number(x) + Number(width) - 5}
                    y={Number(y) + Number(height) / 2}
                    dominantBaseline="middle"
                    textAnchor={numericValue < 0 ? "start" : "end"}
                    fill={fillColor}
                    fontSize={fontSize}
                    style={{
                      maxWidth: 60,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {percentage}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}