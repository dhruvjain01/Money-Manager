import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { addThousandsSeparator } from "../util/util";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, amount } = payload[0].payload;
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 text-sm">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-purple-700 font-bold">₹{addThousandsSeparator(amount)}</p>
      </div>
    );
  }
  return null;
};

const CustomPieChart = ({ data, label, totalAmount, colors }) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-90 relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
              innerRadius={100}
              paddingAngle={2}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-800">{totalAmount}</p>
        </div>
      </div>

      {/* Color Indicators */}
      <div className="flex flex-wrap justify-center gap-8 mt-8">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></span>
            <span className="text-sm text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPieChart;
