import { createRequire } from 'node:module';

const minimumPopulation = Number(process.argv[2]);
const require = createRequire(import.meta.url);
const cities = require('all-the-cities');
const countries = require('country-list/data.json');

const cityNames = [];
for (const city of cities) {
  if (city.population >= minimumPopulation) cityNames.push(city.name);
}

process.stdout.write(JSON.stringify({
  cities: cityNames,
  countries: countries.map((country) => country.name),
}));
