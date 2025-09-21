import { useEffect, useMemo, useState } from 'react';

export const useFlightData = (flightsData) => {
  const [dateRange, setDateRange] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);

  const dailyFlights = useMemo(() => {
    if (!flightsData) return [];

    const flightsByDate = flightsData.reduce((acc, flight) => {
      const date = flight.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(flightsByDate)
      .map(([date, count]) => ({ date: new Date(date), count }))
      .sort((a, b) => a.date - b.date);
  }, [flightsData]);

  useEffect(() => {
    const stableDateRange = dateRange ? [dateRange[0].getTime(), dateRange[1].getTime()] : null;

    if (!stableDateRange || !flightsData) {
      setFilteredFlights(flightsData || []);
      return;
    }

    const [startTimestamp, endTimestamp] = stableDateRange;
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);

    const filtered = (flightsData || []).filter((flight) => {
      const flightDate = new Date(flight.date);
      return flightDate >= startDate && flightDate <= endDate;
    });

    setFilteredFlights(filtered);
  }, [dateRange, flightsData]);

  return {
    filteredFlights,
    dailyFlights,
    setDateRange,
  };
};

// // hooks/useFlightData.js
// import { useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   const dailyFlights = useMemo(() => {
//     if (!flightsData) return [];

//     const flightsByDate = flightsData.reduce((acc, flight) => {
//       const date = flight.date;
//       acc[date] = (acc[date] || 0) + 1;
//       return acc;
//     }, {});

//     return Object.entries(flightsByDate)
//       .map(([date, count]) => ({ date: new Date(date), count }))
//       .sort((a, b) => a.date - b.date);
//   }, [flightsData]);

//   useEffect(() => {
//     if (!dateRange || !flightsData) {
//       setFilteredFlights(flightsData || []);
//       return;
//     }

//     const [startDate, endDate] = dateRange;
//     const filtered = (flightsData || []).filter((flight) => {
//       const flightDate = new Date(flight.date);
//       return flightDate >= startDate && flightDate <= endDate;
//     });

//     setFilteredFlights(filtered);
//   }, [dateRange, flightsData]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     setDateRange,
//   };
// };
