import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { addThousandsSeparator } from "../util/util.js";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dayData = payload[0].payload; // full object for this date
    return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-md border border-gray-100 text-sm max-w-xs">
            <p className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
          {label} <span className="text-purple-700">{`— ₹${addThousandsSeparator(dayData.totalAmount)}`}</span>
            </p>
            <ul className="mt-3 space-y-1.5">
            {dayData.items.map((item) => (
                <li
                key={item.id}
                className="flex justify-between items-center text-gray-700"
                >
                <span className="truncate">{item.name}</span>
                <span className="font-semibold text-gray-900">{`₹${addThousandsSeparator(item.amount)}`}</span>
                </li>
            ))}
            </ul>
        </div>
    );
  }
  return null;
};

const CustomLineChartData = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        No data for this month.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffffff" />
        <XAxis
            dataKey="date"
            tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                })
            }
            stroke="#6b7280"
        />
        <YAxis
          stroke="#6b7280"
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="totalAmount"
          stroke="#7c3aed"
          strokeWidth={3}
          dot={{ r: 4, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChartData;
