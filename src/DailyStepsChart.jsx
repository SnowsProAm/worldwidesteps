import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const compact = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(Math.round(n));

export default function DailyStepsChart({ data, reducedMotion }) {
  return <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0C69C8" stopOpacity={0.25}/><stop offset="100%" stopColor="#0C69C8" stopOpacity={0}/></linearGradient></defs>
      <XAxis dataKey="day" tick={{ fill: '#67758b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
      <YAxis tick={{ fill: '#67758b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={compact} width={38}/>
      <Tooltip formatter={value => [Number(value).toLocaleString(), 'Steps']} contentStyle={{ borderRadius: 6, borderColor: '#e7edf5', fontSize: 12 }}/>
      <Area type="monotone" dataKey="steps" name="Steps" stroke="#0C69C8" strokeWidth={2.5} fill="url(#areaGrad)" dot={data.length === 1} isAnimationActive={!reducedMotion}/>
    </AreaChart>
  </ResponsiveContainer>;
}
