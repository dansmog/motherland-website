// Using switch statement
export function getCurrencySymbol(country) {
  switch (country.toLowerCase()) {
    case "canada":
      return "CA$";
    case "united states":
      return "$";
    case "united kingdom":
      return "£";
    case "europe":
      return "€";
    default:
      return "CA$"; // Default to $ if country not found
  }
}

export const PrimeByCountry = {
  canada: import.meta.env.PUBLIC_CANADA_PRIME,
  "united states": import.meta.env.PUBLIC_UNITED_STATES_PRIME,
};
