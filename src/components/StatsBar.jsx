import React, { useEffect, useState } from 'react';
import { getStats } from '../services/strapi';

const StatsBar = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats.length) return null;

  return (
    <div className="w-full bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4 flex flex-wrap justify-between items-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center justify-center w-full sm:w-1/3 p-2 border-r last:border-r-0 border-black/10 sm:border-black/20">
            <h3 className="text-3xl sm:text-4xl font-bold">{stat.value}</h3>
            <p className="text-sm sm:text-base uppercase tracking-wider font-semibold opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
