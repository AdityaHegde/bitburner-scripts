import type { CityName } from "$src/types/gameTypes";

export const CityNames: Array<CityName> = [
  "Aevum",
  "Chongqing",
  "Sector-12",
  "New Tokyo",
  "Ishima",
  "Volhaven",
] as any;
export const ProductionCity = CityNames[0];
export const LastCity = CityNames[CityNames.length - 1];
export const MaxProductCount = 3;

export enum IndustryType {
  Energy = "Energy",
  Utilities = "Water Utilities",
  Agriculture = "Agriculture",
  Fishing = "Fishing",
  Mining = "Mining",
  Food = "Food",
  Tobacco = "Tobacco",
  Chemical = "Chemical",
  Pharmaceutical = "Pharmaceutical",
  Computers = "Computer Hardware",
  Robotics = "Robotics",
  Software = "Software",
  Healthcare = "Healthcare",
  RealEstate = "RealEstate",
}

export const EmployeePositions = [
  "Operations",
  "Engineer",
  "Business",
  "Management",
  "Research & Development",
  "Training",
  "Unassigned",
];
