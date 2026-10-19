import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const compact = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(Math.round(n));

export default function DailyStepsChart({ data, reducedMotion, darkMode = false }) {
  const tickColor = darkMode ? '#AAB8CA' : '#67758b';
  const borderColor = darkMode ? '#43536A' : '#e7edf5';
  const chartColor = darkMode ? '#78A6E8' : '#0C69C8';
  return <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartColor} stopOpacity={darkMode ? 0.38 : 0.25}/><stop offset="100%" stopColor={chartColor} stopOpacity={0}/></linearGradient></defs>
      <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
      <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={compact} width={38}/>
      <Tooltip formatter={value => [Number(value).toLocaleString(), 'Steps']} contentStyle={{ borderRadius: 6, backgroundColor: darkMode ? '#172231' : '#fff', color: darkMode ? '#F2F6FC' : '#0F1629', borderColor, fontSize: 12 }}/>
      <Area type="monotone" dataKey="steps" name="Steps" stroke={chartColor} strokeWidth={2.5} fill="url(#areaGrad)" dot={data.length === 1} isAnimationActive={!reducedMotion}/>
    </AreaChart>
  </ResponsiveContainer>;
}
