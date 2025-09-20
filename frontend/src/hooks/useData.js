

// import { useState, useEffect } from 'react';
// import { csv } from 'd3';

// const csvUrl =
//   'https://gist.githubusercontent.com/curran/a9656d711a8ad31d812b8f9963ac441c/raw/c22144062566de911ba32509613c84af2a99e8e2/MissingMigrants-Global-2019-10-08T09-47-14-subset.csv';

// const row = d => {
//   d.coords = d['Location Coordinates'].split(',').map(d => +d).reverse();
//   d['Total Dead and Missing'] = + d['Total Dead and Missing'];
//   d['Reported Date'] = new Date(d['Reported Date']);
//   return d;
// };

// export const useData = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     csv(csvUrl, row).then(setData);
//   }, []);

//   return data;
// };

import { useState, useEffect } from 'react';
import { json } from 'd3';

const mockFlightsData = [
  { id: 1, date: "2024-01-15", lat: 55.7558, lng: 37.6173, type: "Boeing" },
  { id: 2, date: "2024-01-16", lat: 59.9343, lng: 30.3351, type: "Airbus" },
  { id: 3, date: "2024-01-17", lat: 56.3269, lng: 44.0055, type: "Boeing" },
  { id: 4, date: "2024-01-18", lat: 55.1542, lng: 61.4291, type: "Airbus" },
  { id: 5, date: "2024-01-19", lat: 54.7065, lng: 20.5109, type: "Boeing" },
  { id: 6, date: "2024-01-20", lat: 53.2415, lng: 50.2212, type: "Airbus" },
  { id: 7, date: "2024-01-21", lat: 56.8575, lng: 60.6129, type: "Boeing" },
  { id: 8, date: "2024-01-22", lat: 56.0184, lng: 92.8672, type: "Airbus" },
  { id: 9, date: "2024-01-23", lat: 54.9885, lng: 82.8939, type: "Boeing" },
  { id: 73, date: "2024-01-21", lat: 56.8575, lng: 60.6129, type: "Boeing" },
  { id: 82, date: "2024-01-22", lat: 56.0184, lng: 92.8672, type: "Airbus" },
  { id: 91, date: "2024-01-23", lat: 54.9885, lng: 82.8939, type: "Boeing" },
  { id: 100, date: "2024-01-24", lat: 52.2871, lng: 104.2838, type: "Airbus" },
  { id: 11, date: "2024-02-01", lat: 65.7558, lng: 37.6173, type: "Boeing" },
  { id: 12, date: "2024-02-05", lat: 59.9343, lng: 30.3351, type: "Airbus" },
  { id: 13, date: "2024-02-10", lat: 56.3269, lng: 44.0055, type: "Boeing" },
  { id: 14, date: "2024-02-15", lat: 55.1542, lng: 61.4291, type: "Airbus" },
  { id: 15, date: "2024-02-20", lat: 54.7065, lng: 20.5109, type: "Boeing" },
  { id: 16, date: "2024-02-25", lat: 53.2415, lng: 50.2212, type: "Airbus" },
  { id: 17, date: "2024-03-01", lat: 56.8575, lng: 60.6129, type: "Boeing" },
  { id: 18, date: "2024-03-05", lat: 56.0184, lng: 92.8672, type: "Airbus" },
  { id: 19, date: "2024-03-10", lat: 54.9885, lng: 82.8939, type: "Boeing" },
  { id: 20, date: "2024-03-15", lat: 52.2871, lng: 104.2838, type: "Airbus" },
  { id: 21, date: "2024-03-15", lat: 52.2871, lng: 104.2838, type: "Airbus" },
  { id: 22, date: "2024-03-15", lat: 52.2871, lng: 104.2838, type: "Airbus" },
  { id: 23, date: "2024-03-15", lat: 52.2871, lng: 104.2838, type: "Airbus" },
  { id: 23, date: "2025-09-18", lat: 55.7558, lng: 37.6173, type: "Airbus" },
];

export const useData = () => {
  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   json(mockFlightsData).then(setData);
  // }, []);

  return mockFlightsData;
};
