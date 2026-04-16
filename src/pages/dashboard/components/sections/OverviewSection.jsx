import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const weeklyDeliveryData = [42, 56, 48, 71, 68, 82, 76];
const monthlyDeliveryData = [220, 260, 310, 298, 340, 372];
const deliveryDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const deliveryMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const buildLinePath = (data, width, height, padding) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const normalized = max === min ? 0.5 : (value - min) / (max - min);
      const y = height - padding - normalized * innerHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const LineChart = ({ data, labels }) => {
  const width = 420;
  const height = 220;
  const padding = 24;
  const linePath = buildLinePath(data, width, height, padding);
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    const y = height - padding - normalized * (height - padding * 2);
    return { x, y, value, label: labels[index] };
  });

  return (
    <div className="delivery-chart delivery-chart--line">
      <svg viewBox={`0 0 ${width} ${height}`} className="delivery-chart-svg" role="img" aria-label="Weekly delivery trend line chart">
        <defs>
          <linearGradient id="deliveryLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2E86C1" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#2E86C1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map(row => {
          const y = padding + (row * (height - padding * 2)) / 3;
          return <line key={row} x1={padding} y1={y} x2={width - padding} y2={y} className="delivery-chart-gridline" />;
        })}
        <path d={`${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#deliveryLineFill)" />
        <path d={linePath} fill="none" stroke="#2E86C1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(point => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#2E86C1" strokeWidth="3" />
          </g>
        ))}
      </svg>
      <div className="delivery-chart-axis delivery-chart-axis--bottom">
        {labels.map(label => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
};

const BarChart = ({ data, labels }) => {
  const max = Math.max(...data);

  return (
    <div className="delivery-chart delivery-chart--bar" role="img" aria-label="Monthly deliveries bar chart">
      <div className="delivery-bar-grid">
        {data.map((value, index) => (
          <div key={labels[index]} className="delivery-bar-item">
            <span className="delivery-bar-value">{value}</span>
            <div className="delivery-bar-track">
              <div className="delivery-bar-fill" style={{ height: `${(value / max) * 100}%` }} />
            </div>
            <span className="delivery-bar-label">{labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChart = ({ data, labels }) => {
  const width = 420;
  const height = 220;
  const padding = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * innerWidth;
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    const y = height - padding - normalized * innerHeight;
    return { x, y, value, label: labels[index] };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = `${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="delivery-chart delivery-chart--area">
      <svg viewBox={`0 0 ${width} ${height}`} className="delivery-chart-svg" role="img" aria-label="Weekly delivery area chart">
        <defs>
          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map(row => {
          const y = padding + (row * innerHeight) / 3;
          return <line key={row} x1={padding} y1={y} x2={width - padding} y2={y} className="delivery-chart-gridline" />;
        })}
        <path d={areaPath} fill="url(#areaFill)" />
        <path d={pathData} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="delivery-chart-axis delivery-chart-axis--bottom">
        {labels.map(label => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
};

const PieChart = ({ completed, processing, failed }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const total = completed + processing + failed;
  
  const completedAngle = (completed / total) * 360;
  const processingAngle = (processing / total) * 360;
  
  const completedPercent = Math.round((completed / total) * 100);
  const processingPercent = Math.round((processing / total) * 100);
  const failedPercent = Math.round((failed / total) * 100);

  return (
    <div className="delivery-chart delivery-chart--pie">
      <svg viewBox="0 0 160 160" className="delivery-pie-svg" role="img" aria-label="Delivery status pie chart">
        <circle cx="80" cy="80" r={radius} className="delivery-pie-track" />
        <circle 
          cx="80" 
          cy="80" 
          r={radius} 
          className="delivery-pie-slice delivery-pie-slice--completed" 
          strokeDasharray={circumference} 
          strokeDashoffset={circumference - (completed / total) * circumference}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
        />
        <circle 
          cx="80" 
          cy="80" 
          r={radius} 
          className="delivery-pie-slice delivery-pie-slice--processing" 
          strokeDasharray={circumference} 
          strokeDashoffset={circumference - (processing / total) * circumference}
          style={{ 
            transform: `rotate(${completedAngle - 90}deg)`, 
            transformOrigin: '80px 80px' 
          }}
        />
        <circle 
          cx="80" 
          cy="80" 
          r={radius} 
          className="delivery-pie-slice delivery-pie-slice--failed" 
          strokeDasharray={circumference} 
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="delivery-chart-legend">
        <div><span className="delivery-legend-dot delivery-legend-dot--completed" />Completed {completedPercent}%</div>
        <div><span className="delivery-legend-dot delivery-legend-dot--processing" />Processing {processingPercent}%</div>
        <div><span className="delivery-legend-dot delivery-legend-dot--failed" />Failed {failedPercent}%</div>
      </div>
    </div>
  );
};

const RadarChart = ({ data, labels }) => {
  const size = 220;
  const center = size / 2;
  const radius = 70;
  const numPoints = data.length;
  const angleSlice = (Math.PI * 2) / numPoints;
  const maxValue = Math.max(...data);
  
  const points = data.map((value, index) => {
    const angle = angleSlice * index - Math.PI / 2;
    const x = center + (value / maxValue) * radius * Math.cos(angle);
    const y = center + (value / maxValue) * radius * Math.sin(angle);
    return { x, y };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  
  return (
    <div className="delivery-chart delivery-chart--radar">
      <svg viewBox={`0 0 ${size} ${size}`} className="delivery-radar-svg" role="img" aria-label="Delivery performance radar chart">
        <defs>
          <linearGradient id="radarFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map(scale => {
          const radarPoints = Array(numPoints)
            .fill(0)
            .map((_, index) => {
              const angle = angleSlice * index - Math.PI / 2;
              const x = center + scale * radius * Math.cos(angle);
              const y = center + scale * radius * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(' ');
          return <polygon key={scale} points={radarPoints} className="delivery-radar-grid" />;
        })}
        {Array(numPoints)
          .fill(0)
          .map((_, index) => {
            const angle = angleSlice * index - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line key={index} x1={center} y1={center} x2={x} y2={y} className="delivery-radar-axis" />
            );
          })}
        <path d={pathData} fill="url(#radarFill)" stroke="#8B5CF6" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#8B5CF6" />
        ))}
      </svg>
      <div className="delivery-chart-legend delivery-chart-legend--radar">
        {labels.map((label, i) => (
          <div key={label}>
            <span className="delivery-legend-dot delivery-legend-dot--radar" />
            {label}: {data[i]}
          </div>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ completed, onTime, delayed }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const total = completed + onTime + delayed;
  const completedOffset = circumference - (completed / total) * circumference;
  const onTimeOffset = completedOffset - (onTime / total) * circumference;

  return (
    <div className="delivery-chart delivery-chart--donut">
      <svg viewBox="0 0 160 160" className="delivery-donut-svg" role="img" aria-label="Delivery quality donut chart">
        <circle cx="80" cy="80" r={radius} className="delivery-donut-track" />
        <circle cx="80" cy="80" r={radius} className="delivery-donut-slice delivery-donut-slice--completed" strokeDasharray={circumference} strokeDashoffset={completedOffset} />
        <circle cx="80" cy="80" r={radius} className="delivery-donut-slice delivery-donut-slice--on-time" strokeDasharray={circumference} strokeDashoffset={onTimeOffset} />
        <circle cx="80" cy="80" r={radius} className="delivery-donut-slice delivery-donut-slice--delayed" strokeDasharray={circumference} strokeDashoffset={circumference} />
        <text x="80" y="74" textAnchor="middle" className="delivery-donut-value">{Math.round((onTime / total) * 100)}%</text>
        <text x="80" y="94" textAnchor="middle" className="delivery-donut-label">On-time</text>
      </svg>
      <div className="delivery-chart-legend">
        <div><span className="delivery-legend-dot delivery-legend-dot--completed" />Completed {completed}</div>
        <div><span className="delivery-legend-dot delivery-legend-dot--on-time" />On-time {onTime}</div>
        <div><span className="delivery-legend-dot delivery-legend-dot--delayed" />Delayed {delayed}</div>
      </div>
    </div>
  );
};

const OverviewSection = ({
  user,
  navigate,
  loadingProfile,
  profileCompletion,
}) => {
  const accountStatus = profileCompletion >= 100 ? 'Ready to Use' : 'In Progress';
  const weeklyTotal = weeklyDeliveryData.reduce((sum, value) => sum + value, 0);
  const monthlyTotal = monthlyDeliveryData[monthlyDeliveryData.length - 1];
  const weeklyGrowth = Math.round(((weeklyDeliveryData[6] - weeklyDeliveryData[0]) / weeklyDeliveryData[0]) * 100);


  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-copy">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to your POTENS delivery partner portal.
          </p>
        </div>
      </header>

      {loadingProfile ? (
        <Card padding="md" shadow="sm">
          <p className="dashboard-subtitle">Loading partner profile details...</p>
        </Card>
      ) : (
        <>
          <div className="overview-top-grid">
            <Card padding="md" shadow="sm" className="overview-portal-card">
              <div className="overview-portal-card-head">
                <span className="overview-portal-icon" aria-hidden="true">📄</span>
                <div>
                  <h2 className="overview-portal-title">Applications</h2>
                  <p className="overview-portal-subtitle">1 application</p>
                </div>
              </div>
              <div className="overview-portal-meta-row">
                <span>Total Applications</span>
                <strong>{profileCompletion > 0 ? 1 : 0}</strong>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/profile-completion')}>
                Manage Applications
              </Button>
            </Card>
          </div>

          <div className="overview-analytics-stack">
            <div className="overview-analytics-header">
              <div>
                <p className="screen-kicker">Delivery Analytics</p>
                <h2 className="card-section-title">Delivery performance overview</h2>
                <p className="screen-subtitle">Track daily delivery movement, monthly output, and service quality from one place.</p>
              </div>
            </div>

            <div className="overview-stats-grid">
              <Card padding="md" shadow="sm" className="overview-stat-card">
                <span className="overview-stat-label">This Week</span>
                <strong className="overview-stat-value"> {weeklyTotal} </strong>
                <span className="overview-stat-trend overview-stat-trend--up">+{weeklyGrowth}% vs Monday</span>
              </Card>
              <Card padding="md" shadow="sm" className="overview-stat-card">
                <span className="overview-stat-label">Latest Month</span>
                <strong className="overview-stat-value"> {monthlyTotal} </strong>
                <span className="overview-stat-trend">Deliveries completed</span>
              </Card>
              <Card padding="md" shadow="sm" className="overview-stat-card">
                <span className="overview-stat-label">Service Quality</span>
                <strong className="overview-stat-value"> 94% </strong>
                <span className="overview-stat-trend">On-time fulfilment rate</span>
              </Card>
            </div>

            <div className="overview-chart-grid">
              <Card padding="md" shadow="sm" className="overview-chart-card">
                <div className="overview-chart-head">
                  <div>
                    <h3 className="overview-chart-title">Weekly delivery trend</h3>
                    <p className="overview-chart-subtitle">Line chart showing the last 7 days of delivery activity.</p>
                  </div>
                  <span className="overview-chart-chip">Line</span>
                </div>
                <LineChart data={weeklyDeliveryData} labels={deliveryDays} />
              </Card>

              <Card padding="md" shadow="sm" className="overview-chart-card">
                <div className="overview-chart-head">
                  <div>
                    <h3 className="overview-chart-title">Weekly delivery area</h3>
                    <p className="overview-chart-subtitle">Area chart showing delivery volume distribution over the week.</p>
                  </div>
                  <span className="overview-chart-chip">Area</span>
                </div>
                <AreaChart data={weeklyDeliveryData} labels={deliveryDays} />
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OverviewSection;
